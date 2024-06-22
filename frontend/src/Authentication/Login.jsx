import { useState } from 'react';

import Register from './Register';
import StatusDialog from "../Dialogs/StatusDialog";

export default function Login({ onAuth }) {
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ registration, onRegistration ] = useState(false);

    const [ authenticationState, setAuthenticationState ] = useState(false);
    
    function AuthAccount(event) {
        event.preventDefault();
        setAuthenticationState('Authenticating User...');
        fetch(`http://localhost:5000/accounts/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            }
        )}).then((response) => {
            return response.json();
        }).then((response) => {
                setAuthenticationState('Logging in...');
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('username', response.username);
                onAuth();
            }).catch((err) => {
                alert('Wrong Credentials.');
                setAuthenticationState(false);
            }
        );
    }

    return registration ? 
    (<Register onAuth={onAuth} registration={onRegistration}/>) : 
    (
        <div className="page-background">

        {
            authenticationState && 
            <StatusDialog>{authenticationState}</StatusDialog>
        }
    
            <form className="login-form" onSubmit={AuthAccount}>
                <input className="info-input" placeholder="Username" value={username} required onChange={(event) => {setUsername(event.target.value)}}></input>
                <input className="info-input" placeholder="Password" type="password" value={password} required onChange={(event) => {setPassword(event.target.value)}}></input>
                <div><button type="button" className="auth-method-button" onClick={() => onRegistration(true)}>Register</button></div>
                <button type="submit" className="auth-button">Login</button>
            </form>
        </div>
    )
}