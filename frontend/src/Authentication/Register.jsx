import { useState } from 'react';
import StatusDialog from "../Dialogs/StatusDialog";

export default function Register({ onAuth, registration }) {
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ confirmPass, setConfirmPass ] = useState('');

    const [ registrationStatus, setRegistrationStatus ] = useState(false);

    function CreateAccount(event) {
        event.preventDefault();

        setRegistrationStatus('Checking for password duplication...');

        if(password !== confirmPass) {
            alert('Passwords differ!');
            setRegistrationStatus(false);
            return;
        }

        setRegistrationStatus('Checking for username availability...');

        fetch(`http://localhost:5000/accounts/exists/${username}`).then((response) => {
            return response.json();
        }).then((response) => {
            return response.exists;
        }).then((response) => {
            if(response) {
                alert('Name is taken.');
                setRegistrationStatus(false);
                return;
            }
            setRegistrationStatus('Creating account...');
            fetch('http://localhost:5000/accounts/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password  
                })
            }).then((response) => {
                return response.json();
            }).then((response) => {
                response.message && alert(response.message);
                if(response.accessToken) {
                    localStorage.setItem('accessToken', response.accessToken);
                    localStorage.setItem('username', response.username);
                    onAuth();
                } else {
                    setRegistrationStatus(false); 
                }
            }).catch((err) => {
                console.error(err);
                setRegistrationStatus(false); 
            })
        }).catch((err) => {
            console.error(err);
            setRegistrationStatus(false); 
        })
    }

    return (
        <div className="page-background">
            {
                registrationStatus && 
                <StatusDialog>{registrationStatus}</StatusDialog>
            }
            <form className="login-form" onSubmit={CreateAccount}>
                <input className="info-input" placeholder="Username" value={username} required onChange={(event) => {setUsername(event.target.value)}}></input>
                <input className="info-input" placeholder="Password" type="password" value={password} required onChange={(event) => {setPassword(event.target.value)}}></input>
                <input className="info-input" placeholder="Confirm Password" type="password" value={confirmPass} required onChange={(event) => {setConfirmPass(event.target.value)}}></input>
                <div><button type="button" className="auth-method-button" onClick={() => registration(false)}>Login</button></div>
                <button type="submit" className="auth-button">Register</button>
            </form>
        </div>
    );
}