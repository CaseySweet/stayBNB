import React, { useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";

function LoginFormModal() {
    const dispatch = useDispatch();
    const [credential, setCredential] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const { closeModal } = useModal();

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        return dispatch(sessionActions.login({ credential, password }))
            .then(closeModal)
            .catch(async (res) => {
                const data = await res.json();
                if (data && data.message) {
                    setErrors(data);
                }
            });
    };

    // console.log(errors, '<---- errors')

    const demo = (e) => {
        e.preventDefault()
        return dispatch(sessionActions.login({ credential: 'Demo-lition', password: 'password' }))
            .then(closeModal)
    }

    return (
        <div className="login-container">
            <div>
                <h1>Log In</h1>
            </div>
            <form onSubmit={handleSubmit}>
                {errors.message && (
                    <p>{errors.message}</p>
                )}
                <div>
                    <div>
                        Username or Email
                    </div>
                    <input
                        type="text"
                        value={credential}
                        onChange={(e) => setCredential(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <div>
                        Password
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <button type="submit" disabled={credential.length < 4 || password.length < 6}>Log In</button>
                </div>
                <div>
                    <button onClick={demo}>Demo User</button>
                </div>
            </form>
        </div>
    );
}

export default LoginFormModal;
