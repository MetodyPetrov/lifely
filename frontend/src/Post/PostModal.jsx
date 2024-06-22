import { createPortal } from "react-dom";
import { useRef, useEffect, useState } from "react";

import Comment from "./Comment";
import StatusDialog from "../Dialogs/StatusDialog";

export default function PostModal({ removeModal, postId, imgUrl, title, uploadedBy, uploadDate, description }) {
    const dialog = useRef();
    const commentTextarea = useRef(null);
    description = description || 'This post has no description...';
    
    useEffect(() => {
        dialog.current.showModal();
        commentFetching();
    }, []);
    
    const [ comments, setComments ] = useState([]);
    const [ addComment, setAddComment ] = useState(false);
    const [ commentUpdation, setCommentUpdation ] = useState(false);

    async function commentFetching() {
        setCommentUpdation('Retrieving comments...');
        try {
            const result = await fetch(`http://localhost:5000/posts/${postId}/comments`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': localStorage.getItem('accessToken')
                }
            });
            if(result.ok) setComments(await result.json());
        } catch(error) {
            console.log('Error fetching comments', error);
        }
        setCommentUpdation(false);
    }

    async function handleCommentChange(e) { // NOTE: mouseDown is used since we had* a clash with the onBlur() in the Comment component (onBlur was used to stop commenting) - https://stackoverflow.com/questions/12154954/how-to-make-element-not-lose-focus-when-button-is-pressed#:~:text=Handle%20the%20mousedown,event%20default%20behavior.
        e.preventDefault();                 
        if(addComment) {
            await handleSubmitComment();
        } else {
            setAddComment(true);
        }
    }

    async function handleSubmitComment() {
        setCommentUpdation('Uploading comment...');
        try {
            const result = await fetch(`http://localhost:5000/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': localStorage.getItem('accessToken')
                },
                body: JSON.stringify({
                    comment: commentTextarea.current.value
                })
            });
            if(result.ok) setComments(await result.json());
        } catch(error) {
            console.error('Error fetching & updating comments', error);
        }
        setCommentUpdation(false);
        setAddComment(false);
    }

    return createPortal(
        <dialog 
            className="modal"
            ref={dialog}
            onClick={(e) => dialog.current === e.target && removeModal() }
            onKeyDown={(e) => e.key === 'Escape' && removeModal()}
        >

            <div className="mid-page-post-modal">
                <h2>{title}</h2>
                <div className="mid-page-undertitle">
                    <div>uploaded by: {uploadedBy}</div>
                    <div>upload date: {uploadDate}</div>
                </div>
                <img src={imgUrl} alt="post"></img>
                <hr/>
                <div className="post-description">{description}</div>
                <hr/>
                {
                commentUpdation ? 
                <StatusDialog fullscreen={false}>{commentUpdation}</StatusDialog> : 
                <div className="comments-box">
                    { addComment && <Comment key={postId} postId={postId} reloadComments={commentFetching} user={localStorage.getItem('username')} editing /*handleCommentBlur={() => setAddComment(false)}*/ commentTextarea={commentTextarea}></Comment> }
                    <button autoFocus className={addComment ? "submit-button" : "neutral-button"} onMouseDown={handleCommentChange}>Add Comment</button>
                    {
                        comments.length > 0 && comments.map((item, index) => (<Comment key={index} postId={postId} postOwner={uploadedBy} reloadComments={commentFetching} user={item.user} id={item.id}>{item.comment}</Comment>))
                    }
                </div>
                }
            </div>
        </dialog>,
        document.getElementById("modal")
    );
}
