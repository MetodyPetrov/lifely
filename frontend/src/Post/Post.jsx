import { useEffect, useRef, useState } from "react";

import PostOptionsMenu from "./PostOptionsMenu";
import PostModal from "./PostModal";
import StatusDialog from "../Dialogs/StatusDialog";

export default function Post({ resetPosts, resetOptionsDropdown, postId, index, imgUrl, title, description, uploadedBy, uploadDate, displayUpload, smallerWidth = document.getElementById('root').clientWidth < 951}) {
    const [ postOwner, setIsPostOwner ] = useState(false);
    const [ showDropdown, setShowDropdown ] = useState(smallerWidth);
    const [ showModal, setShowModal ] = useState(false);

    const [ deletionStatus, setDeletionStatus ] = useState(false);
    const postCard = useRef(null);

    useEffect(() => {
        localStorage.getItem('username') === uploadedBy && setIsPostOwner(true);
        if(postCard.current) postCard.current.style.animation = `slideIn 1s ease-out forwards ${index * 0.5}s`;
    }, [uploadedBy, index]); // if uploadedBy isn't a dependancy when a post is created setIsPostOwner isn't set to true for some reason...

    useEffect(() => {smallerWidth || setShowDropdown(false)}, [resetOptionsDropdown, smallerWidth]);

    async function deletePost() {
        setDeletionStatus('Deleting post...');

        const response = await fetch('http://localhost:5000/posts/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': localStorage.getItem('accessToken')
            },
            body: JSON.stringify({
                postId
            }
        )});

        const resData = await response.json();

        if(!response.ok) throw new Error('Failed to remove post.');
        else alert('Post successfully deleted!');

        setShowDropdown(false); // no idea why, but when the element before the last one is deleted and the last one is owned by the same user, the options dropdown automatically is opened for the now last element after posts refresh. I tried to understand why but yeah...
        setDeletionStatus(false);
        resetPosts();

        return resData.message;
    }
    
    return (
        <div className="post-card" ref={postCard}>
            { deletionStatus && <StatusDialog>{deletionStatus}</StatusDialog>}
            { showModal && <PostModal 
                removeModal={() => setShowModal(false)}
                postId={postId}
                imgUrl={imgUrl}
                title={title} 
                uploadedBy={uploadedBy}
                uploadDate={uploadDate}
                description={description}
            /> }
            <div className="card">
                {displayUpload && <div>Uploaded by: {uploadedBy}</div>}
                <div className="post" style={{backgroundImage: `url(${imgUrl})`}} onClick={() => setShowModal(true)}></div>
                <div className="post-title-box">
                    <h2>{title}</h2> 
                    { postOwner && !smallerWidth && <button className="show-options-button" onClick={() => setShowDropdown(!showDropdown)}>⋮</button> }
                </div>
            </div>
            { showDropdown && postOwner ? 
                <PostOptionsMenu optionsTitle={'Options'} menuElements={['Delete']} deletePost={deletePost}/> : 
                smallerWidth && <PostOptionsMenu optionsTitle={'No Options Available'}/>
            }
        </div>
    );
}