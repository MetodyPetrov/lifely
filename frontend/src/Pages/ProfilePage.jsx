import { useState, useRef, useEffect } from "react";

import Post from "../Post/Post";
import StatusDialog from "../Dialogs/StatusDialog";

export default function ProfilePage({ allPosts, removeOptions, onSuccesfulAuth, removeOptionsSelected }) {
    const inputRef = useRef(null);
    const userRef= useRef(null);

    const [ personalPosts, setPersonalPosts ] = useState([]);
    useEffect(() => {
        setPersonalPosts(allPosts.filter(post => post.uploadedBy === localStorage.getItem('username')));
    }, [ allPosts ]);

    const [ nameInChange, setNameInChange ] = useState(false);
    const [ nameChangeStatus, setNameChangeStatus ] = useState(false);

    function changeNameHandler(event) {
        event.preventDefault();
        const fd = new FormData(event.target);

        if(fd.get('username') === localStorage.getItem('username')) return;

        async function nameTaken() {
            let name;
            setNameChangeStatus('Checking for name availability...');
            try {
                name = await fetch(`http://localhost:5000/accounts/exists/${fd.get('username')}`, {
                    headers: {
                        'X-Authorization': localStorage.getItem('accessToken')
                    }
                });
                name = await name.json();
                if(name.exists) {
                    alert('Name is taken');
                    setNameChangeStatus(false);
                };
            } catch (error) {
                localStorage.clear();
                console.error(`Error checking for ${fd.get('username')} in DB`, error);
                setNameChangeStatus(false);
            }
            return name.exists;
        }

        async function changePostOwnership() {
            try {
                setNameChangeStatus(`Changing all comments and post ownership of the user's posts...`);
                
                const ws = new WebSocket(`ws://localhost:5000?token=${localStorage.getItem('accessToken')}`);
                ws.onmessage = (message) => setNameChangeStatus(message.data);

                let response = await fetch('http://localhost:5000/username-change', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Authorization': localStorage.getItem('accessToken')
                    },
                    body: JSON.stringify({
                        username: fd.get('username')
                    })
                });
                response = await response.json();
                ws.close();

                localStorage.setItem('accessToken', response.tkn);
                localStorage.setItem('username', fd.get('username'));
                onSuccesfulAuth();
            } catch (error) {
                console.error('Error updating post ownership:', error);
                localStorage.clear();
            }
            setNameInChange(false);
            setNameChangeStatus(false);
        }
        nameTaken().then(async (res) => {
            if(!res) await changePostOwnership();
        });
    }

    useEffect(() => {
        if (nameInChange && inputRef.current) {
            inputRef.current.focus();
        }
    }, [nameInChange]);

    return (
        <div className="profile-page-background" onClick={removeOptionsSelected}>
            {
                nameChangeStatus && <StatusDialog>{nameChangeStatus}</StatusDialog>
            }
            <div className="profile-page">
                {nameInChange ?
                    <form onSubmit={changeNameHandler}>
                        <input
                            ref={inputRef}
                            className="changing-value"
                            defaultValue={localStorage.getItem('username')}
                            name="username"
                            autoComplete="off"
                            spellCheck={false}></input>
                    </form>
                    : <h1 ref={userRef}>{localStorage.getItem('username')}</h1>}
                <button onClick={() => setNameInChange(!nameInChange)}>
                    <svg className="edit-username-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                </button>
            </div>

            {personalPosts.map((item, index) => {
                return (
                    <Post
                        key={item._id}
                        index={index}

                        postId={item._id}
                        imgUrl={item.imgUrl}
                        title={item.title}
                        description={item.description}

                        uploadedBy={item.uploadedBy}
                        uploadDate={item.date}

                        resetOptionsDropdown={removeOptions}
                        resetPosts={onSuccesfulAuth}
                    />
                );
            })}
        </div>
    );
}
