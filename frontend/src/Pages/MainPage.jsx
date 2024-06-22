import Post from "../Post/Post";

export default function MainPage({ removeOptionsSelected, onSuccesfulAuth, posts, removeOptions }) {
    return (
        <div id="posts-box" onClick={removeOptionsSelected}>
            {posts.map((item, index) => (
                <Post 
                key={index}
                index={index}
                
                postId={item._id}
                imgUrl={item.imgUrl}
                title={item.title}
                description={item.description}
                
                uploadedBy={item.uploadedBy}
                displayUpload
                uploadDate={item.date}
                
                resetOptionsDropdown={removeOptions}
                resetPosts={onSuccesfulAuth}
                />
            ))}
        </div>
    )
}