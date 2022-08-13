const bodyParser = require("body-parser")
const express = require("express")
const app = express()
const mysql = require("mysql")
const path = require("path")
const bcrypt = require("bcrypt")
// const session = require('express-session')
const cookieSession = require('cookie-session')
require("dotenv").config()
const {DateTime}=require("luxon")

const authenticationMiddleware = (req, res, next) => {
    if (req.path == "/login" || req.path == "/signup" ) next()
    else if (req.session.hasOwnProperty("user_id")) {
        next()
    }
    else {
        res.redirect("/login.html")
    }
}
// const con = mysql.createConnection({
//     user: "root",
//     password: "root",
//     host: "localhost",
//     database: "first_db"
// })
  const con = mysql.createConnection(process.env.MYSQL_CON_STRING)
  console.log(process.env)
// app.use(session({
//     secret: 'fdgdhka1234567890-=dfghjkl; cvbdnm,3948eruiksdjfmxcn3uwifjeskldn354#$%!@#$%^&)*&^SCVBNM<',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }
// }))
app.use(cookieSession({
    name:'session',  
    keys: [process.env.SESSION_KEY],
// Cookie Options
maxAge: 24 * 60 * 60 * 1000 // covervsion in milliseconds. hours user will remian login for 24 hours
}))


app.set("View engine", "ejs")
app.use(express.static("Resources"))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(authenticationMiddleware)
app.use(express.static("private_resources"))

con.connect((err) => {
    if (err) throw err
    else console.log("connected to mysql")
})
app.get("/", (req, res) => {
    // con.query("INSERT INTO Users (name,email) VALUES('Qasim','contact@qasim.edu')",(err,result)=>{
    //     if (err) res.send("An error occured")
    //     else res.send("Hello")
    // })
    con.query(`INSERT INTO Users (name,email) VALUES('${req.query.name}','${req.query.email}')`, (err, result) => {
        if (err) res.send("An error occured")
        else res.send("Hello")
    })
})

app.post("/signup", (req, res) => {
    bcrypt.hash(req.body.password, 10, (err, hashed_password) => {
        if (err) throw err
        con.query(`INSERT INTO Users (name,email,password) VALUES('${req.body.full_name}','${req.body.email}','${hashed_password}')`, (err, result) => {
            if (err) res.send("An error occured")
            // else res.send("Sign up Successful")
            else res.redirect("/login.html")
        })
    })
})
app.post("/login", (req, res) => {
    const email = req.body.email
    const text_password = req.body.password
    con.query(`SELECT id, name, password FROM Users WHERE email='${email}'`, (err, results) => {
        if (err) res.sendStatus(500)
        else {
            const correct_hash_password = results[0].password
            bcrypt.compare(text_password, correct_hash_password, (err, comp_result) => {
                if (comp_result) {
                    req.session.user_id = results[0].id
                    req.session.user_name = results[0].name
                    // res.sendStatus(200)
                    res.redirect("/feed")
                }
                else res.sendStatus(401)
            })
        }
    })
})
app.get("/logout",authenticationMiddleware,(req,res)=>{
    req.session.null
    res.redirect("login.html")
})
app.get("/my_profile", authenticationMiddleware, (req, res) => {
    // res.sendFile(path.join(__dirname,"/views/my_profile.html")) // it wont work as this file is not html anymore.
    res.render("my_profile.ejs", {
        name: req.session.user_name
    })
    
}) 
app.get("/feed",authenticationMiddleware, (req,res)=>{
    res.render("feed.ejs",{
         name: req.session.user_name,
         user_id:req.session.user_id,
        
        // name:"Uzair"
    }) 
    
})
//SQL INJECTION
app.post("/post/new",authenticationMiddleware, (req, res) => {
   if (req.body.hasOwnProperty("content") && req.body.content !=""){
    con.query("INSERT INTO Posts(content,user_id) VALUES(?,?)",[req.body.content,req.session.user_id],(err,result)=>{
        if (err) res.sendStatus(500)
        else res.sendStatus(201)
    })
   } else res.sendStatus(400)
    
})
//EDIT Request
app.post("/post/edit",authenticationMiddleware, (req, res) => {
    const post_content=req.body.content
     const post_id= req.body.id
 
    con.query(`UPDATE Posts SET content='${post_content}' WHERE id='${post_id}';`,(err,result)=>{
    if (err) res.sendStatus(500)
    else res.sendStatus(201)
})
   
   

 })
app.get("/posts/all",authenticationMiddleware,(req,res)=>{
     con.query("SELECT Posts.id, Posts.content,Posts.date_posted,Users.name,Users.id AS user_id FROM Posts INNER JOIN Users ON Posts.user_id=Users.id;",(err,result)=>{
        if (err) res.sendStatus(500)
        else{
            const final=result.map(post=>{
                post.date_posted=DateTime.fromJSDate(post.date_posted).toFormat('yyyy LLLL dd')
                return post
            })
            res.json(final )
         
        }
       
     })
})

app.listen(process.env.PORT, () => {
    console.log("Server is listening"+ process.env.PORT)
})

// In case tailwind error occurs
// https://stackoverflow.com/questions/68613313/how-do-i-fix-tailwindcss-cli-from-throwing-typeerror-object-fromentries-is-not