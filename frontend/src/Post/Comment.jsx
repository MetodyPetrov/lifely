import { useRef, useState } from "react";
import StatusDialog from "../Dialogs/StatusDialog";
import OptionsDialog from "../Dialogs/OptionsDialog";

export default function Comment({ postId, postOwner, reloadComments, user, id, children, editing, commentTextarea }) {
    const editArea = useRef(null);

    const [ edit, setEdit ] = useState(editing);
    const [ commentStatus, setCommentStatus ] = useState(false);
    const [ deleteConfirmation, setDeleteConfirmation ] = useState(false);

    async function handleDeleteComment() {
        try {
            setCommentStatus('Deleting comment...');
            await fetch(`http://localhost:5000/comments/delete/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': localStorage.getItem('accessToken')
                },
                body: JSON.stringify({
                    comment: children,
                    id
                }
            )});
            setCommentStatus(false);
            reloadComments();
        } catch (error) {
            console.error(error);
        }
    }

    async function handleSaveComment() {
        try {
            setCommentStatus('Updating comment...');
            await fetch(`http://localhost:5000/comments/edit/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': localStorage.getItem('accessToken')
                },
                body: JSON.stringify({
                    prevComment: children,
                    newComment: editArea.current.value,
                    id
                })
            });
            setCommentStatus(false);
            reloadComments();
        } catch (error) {
            console.error(error);
            localStorage.clear();
        }
    }

    function resizeCommentArea() {
        const textarea = (commentTextarea && commentTextarea.current) || (editArea && editArea.current);
        textarea.style.height = 'auto'; 
        textarea.style.height = `${textarea.scrollHeight}px`; 
    }

    function sendCaretAtEnd(e) {
        var temp_value = e.target.value;
        e.target.value = '';
        e.target.value = temp_value;
      }

    return (
        <div className="comment-wrapper">
            <div className="comment">
                { commentStatus && <StatusDialog>{commentStatus}</StatusDialog> }




                { !edit && (localStorage.getItem('username') === user || localStorage.getItem('username') === postOwner) && 
                    <div className="comment-actions">
                        { localStorage.getItem('username') === user && <button className="edit-comment-button" onClick={() => setEdit(!edit)}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M160-400v-80h280v80H160Zm0-160v-80h440v80H160Zm0-160v-80h440v80H160Zm360 560v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T863-380L643-160H520Zm300-263-37-37 37 37ZM580-220h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19Z"/></svg></button> }
                        <button style={{borderLeft: "solid black 1px"}} className="delete-comment-button" onClick={() => setDeleteConfirmation(true)}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button> 
                    </div>
                }



                { deleteConfirmation && 
                    <OptionsDialog 
                        title="Are you sure you want to delete this comment?" 
                        options={['yes', 'no']} 
                        optionListeners={[() => { setDeleteConfirmation(false); handleDeleteComment(); }, () => setDeleteConfirmation(false)]}
                        windowWidth={'200px'}
                    /> 
                }



                { edit ? 
                    <>
                        <textarea autoFocus onFocus={sendCaretAtEnd} ref={editing ? commentTextarea : editArea} onChange={resizeCommentArea} className="comment-box" defaultValue={children} spellCheck={false}></textarea>
                        { !editing && 
                            <>
                                <button className="red-button edit-button" onClick={() => setEdit(false)}>Cancel</button>
                                <button className="green-button edit-button" onClick={handleSaveComment}>Save</button>
                            </>
                        }
                    </>
                    :
                    children
                }
                <div className="comment-owner"><span className="prevent-hyphen-break">— </span>{user}</div>
            </div>
        </div>
    );
}