import { useRef, useState } from 'react';
import StatusDialog from "../Dialogs/StatusDialog";

export default function AddPostPage({ redirectToMainPage }) {
    const postDescription = useRef();
    
    const [ addPostProgress, setAddPostProgress ] = useState(false);

    function resizeDescription() {
        const textarea = postDescription.current;
        textarea.style.height = 'auto'; 
        textarea.style.height = `${textarea.scrollHeight}px`; 
    }

    async function submitPost(event) {
        try {
            event.preventDefault();
            const fd = new FormData(event.target);

            setAddPostProgress('Uploading post...');
            const res = await fetch('http://localhost:5000/posts/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': localStorage.getItem('accessToken')
                },
                body: JSON.stringify({
                    title: fd.get('title'),
                    imgUrl: fd.get('imageUrl'),
                    description: fd.get('description')
                })
            });
            if(!res.ok) {
                alert('Failed to create post');
                setAddPostProgress(false);
            }
        } catch (error) {
            console.error(error);
            localStorage.clear();
        }
        redirectToMainPage();
    }

    return (
        <div className="add-post-page-background">  
            { addPostProgress && <StatusDialog>{addPostProgress}</StatusDialog> }
            <form className="add-post-form" onSubmit={submitPost}>
                <input spellCheck={false} placeholder="title" className="info-input" name="title" required></input>
                <input spellCheck={false} placeholder="imageUrl" className="info-input" name="imageUrl" required></input>
                <textarea spellCheck={false} ref={postDescription} placeholder="description" className="info-input" name="description" onChange={resizeDescription}></textarea>
                <div>
                    <button type="reset" className="red-button option-button">Clear</button>
                    <button className="green-button option-button">Post</button>
                </div>
            </form>
        </div>
    )
}