import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";
import "./SignupForm.css";

function SignupFormModal() {
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const { closeModal } = useModal();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === confirmPassword) {
            setErrors({});
            return dispatch(
                sessionActions.signup({
                    email,
                    username,
                    firstName,
                    lastName,
                    password,
                })
            )
                .then(closeModal)
                .catch(async (res) => {
                    const data = await res.json();
                    if (data && data.errors) {
                        setErrors(data.errors);
                    }
                });
        }
        return setErrors({
            confirmPassword: "Confirm Password field must be the same as the Password field"
        });
    };

    return (
        <div className="signup-container">
            <h1 className="signup-text">Sign Up</h1>
            <form onSubmit={handleSubmit}>
                    {errors.email && <p className="signup-error">{errors.email}</p>}
                    {errors.username && <p className="signup-error">{errors.username}</p>}
                <div>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Email"
                        className="signup-input"
                    />
                </div>
                <div>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Username"
                        className="signup-input"
                    />
                </div>
                <div>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="First Name"
                        className="signup-input"
                    />
                </div>
                {errors.firstName && <p>{errors.firstName}</p>}
                <div>                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder="Last Name"
                        className="signup-input"
                    />
                </div>
                {errors.lastName && <p>{errors.lastName}</p>}
                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Password"
                        className="signup-input"
                    />
                </div>
                {errors.password && <p>{errors.password}</p>}
                <div>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm Password"
                        className="signup-input"
                    />
                </div>
                {errors.confirmPassword && (
                    <p>{errors.confirmPassword}</p>
                )}
                <button className="signup-button-modal" type="submit" disabled={username.length < 4 || password.length < 6 || confirmPassword.length < 6 || !email || !firstName || !lastName}>Sign Up</button>
            </form>
        </div>
    );
}

export default SignupFormModal;
