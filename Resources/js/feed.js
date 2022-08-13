// $(document).ready(function () {
//     $("#post-form").submit((e) => {
//         e.preventDefault();
//         //console.log(e.target)
//         //   
//         const my_content = ($("#post-content-field").val())
//         $.post("/post/new", { content: my_content }, function (data) {
//             if (data == "Created") alert("Post created successfully")
//             else alert("Error Occured")
//         })
//     })
// })

const cur_user_id = parseInt(document.getElementById("user_id_field").value)
//console.log(cur_user_id);
// const Edit=(props)=>{
//     const [editContent,setEditContent]=React.useState("")

// }
const Form = (props) => {
    const setReload = props.reloadFunction
    const [content, setContent] = React.useState("")
    const post = (e) => {
        e.preventDefault()
        $.post("/post/new", { content: content }, function (data) {
            if (data == "Created") {
                alert("Post created successfully")
                setReload(cur => !cur)
            }
            else alert("Error Occured")
        })
    }
    return <section className="mt-8 w-3/4 m-auto bg-white px-12 py-10 flex flex-col rounded-md ">
        <h2 className="text-2xl bold mb-4">Create a post </h2>
        <form action="/post/new" method="POST" id="post-form" onSubmit={post}>
            <textarea name="content" placeholder="What's on your mind?" className="border-2 w-full px-3 py-3"
                id="post-content-field" value={content} onChange={(e) => { setContent(e.target.value) }}></textarea>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 float-right rounded-xl"><i
                className="fa-solid fa-paper-plane"></i> Post now</button>
        </form>
    </section>



}

const Posts = () => {

    const [posts, setPosts] = React.useState([])
    const [reload, setReload] = React.useState(false)
    const [editPostsId, setEditPostsId] = React.useState(null)
    const [editPosts, setEditposts] = React.useState("")


    const submitPosts = id => {
        return event => {
            event.preventDefault();
            const updatedPosts = [...posts].map((post) => {
                if (post.id == id) {
                    post.content = editPosts
                }
                return post
                    
            })
            //setPosts(updatedPosts)
            
            { $.post("/post/edit", { content: editPosts, id: editPostsId }, function (data) {
                if (data == "Created" && editPosts!=="") {
                    alert("Post edited successfully")
                    setPosts(updatedPosts)
                }
                else alert("Edit field can't be empty")
                
            })
            // console.log(data)
            
            setEditPostsId(null)
            setEditposts("")
        }
        }

   }
    //console.log(posts)
    // const editItem = (id, content, User_id) => {
    //     let newEditItem = posts.find((elem) => {
    //         return [elem.id = id, elem.content = content, elem.User_id = User_id]
    //     })
    //     setEditposts(newEditItem.content)
    //      console.log(newEditItem.content)
    // }
    React.useEffect(() => {
        fetch("/posts/all")
            .then((data) => {
                data.json()
                    .then(final_data => {
                        setPosts(final_data)
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            })
    }, [reload])


    return (
        <div>
            {/* props is to parse values of state value to other functions */}
            <Form reloadFunction={setReload}></Form>
            {posts.map((post, index) => (
                <div className="mt-8 w-8/12 m-auto bg-white p-12 pt-10 rounded-md flex gap-x-4" key={index}>
                    <i className="fa-solid fa-circle-user text-8xl"></i>
                    <div className="w-full">
                        <div className="flex flex-row justify-between items-center">
                            <h3 className="text-lg font-bold">{post.name}</h3>
                            <span className="text-gray-400 text-sm">{post.date_posted}</span>
                        </div>
                        <form action="/post/edit" method="POST" id="post-form" onSubmit={submitPosts(post.id)}>
                            {editPostsId == post.id ? (<textarea className="border-solid w-full cursor-text" placeholder="Rewrite your post" onChange={(e) => setEditposts(e.target.value)} value={editPosts}></textarea>) : (<p>{post.content}</p>)}
                            {cur_user_id == post.user_id ? (<button type="button" className="bg-blue-600 hover:bg-blue-700 text-white p-3  rounded-xl mt-3" id="editing" onClick={() => setEditPostsId(post.id)}>Edit Post</button>) : ("")}
                            {cur_user_id == post.user_id ? (<button type="Submit" className="bg-blue-600 hover:bg-blue-700 text-white p-3  rounded-xl mt-4 ml-3" id="submit_edit">Save</button>) : ("")}
                        </form>
                    </div>
                </div>))}
        </div>)
}

const root = ReactDOM.createRoot(document.getElementById("app"))
root.render(<Posts></Posts>)