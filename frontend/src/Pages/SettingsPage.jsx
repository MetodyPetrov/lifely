import { useState } from "react"

import OptionsDialog from "../Dialogs/OptionsDialog";
import StatusDialog from "../Dialogs/StatusDialog";

import setTheme from "../functions/themeChange";

export default function SettingsPage({ pageView, logout, reloadPosts }) {
    const [ accountDeletion, setAccountDeletion ] = useState(false);
    const [ nameChangeStatus, setNameChangeStatus ] = useState(false);

    async function handleDeleteAccount() {
        try {
            await fetch('http://localhost:5000/accounts', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': localStorage.getItem('accessToken')
                }
            });
            localStorage.clear();
            pageView('home');
            logout();
        } catch (error) {
            console.error(error);
            localStorage.clear();
        }
    }

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
                reloadPosts();
            } catch (error) {
                console.error('Error updating post ownership:', error);
                localStorage.clear();
            }
            setNameChangeStatus(false);
        }
        nameTaken().then(async (res) => {
            if(!res) await changePostOwnership();
        });
    }

    return (
        <div className="settings-page-background">

            {
                nameChangeStatus && <StatusDialog>{nameChangeStatus}</StatusDialog>
            }

            { accountDeletion === 'init' ?
                    <OptionsDialog 
                        title="Are you sure you want to delete your account?" 
                        options={['yes', 'no']} 
                        optionListeners={[() => { setAccountDeletion('Deleting account...'); handleDeleteAccount(); }, () => setAccountDeletion(false)]}
                        windowWidth={'200px'}
                    />  
                    : (accountDeletion && <StatusDialog>{accountDeletion}</StatusDialog>)
            }



            <div className="settings">
                <div className="username-change-container">
                    <h2>Change username</h2>
                    <form onSubmit={changeNameHandler}>
                        <input className="username-input" defaultValue={localStorage.getItem('username')} name="username" spellCheck={false} autoComplete="off"></input>
                    </form>
                </div>
                <button className="delete-account-button" onClick={() => setAccountDeletion('init')}>DELETE ACCOUNT</button>
                <div className="theme-list-container">
                    Themes:
                    <ul className="theme-list">
                        <li><button className="default-theme" onClick={() => setTheme('default')}>Default</button></li>
                        <li><button className="dark-theme" onClick={() => setTheme('dark')}>Dark</button></li>
                        <li><button className="blue-theme" onClick={() => setTheme('blue')}>Blue</button></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}