import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import OpenModalButton from '../OpenModalButton';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';
import { useHistory, NavLink } from 'react-router-dom'
import './Navigation.css';

function ProfileButton({ user }) {
    const dispatch = useDispatch();
    const [showMenu, setShowMenu] = useState(false);
    const ulRef = useRef();
    const history = useHistory()

    const openMenu = () => {
        if (showMenu) return;
        setShowMenu(true);
    };

    useEffect(() => {
        if (!showMenu) return;

        const closeMenu = (e) => {
            if (!ulRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('click', closeMenu);

        return () => document.removeEventListener("click", closeMenu);
    }, [showMenu]);

    const closeMenu = () => setShowMenu(false);

    const logout = (e) => {
        e.preventDefault();
        dispatch(sessionActions.logout());
        closeMenu();
        history.push('/')
    };

    const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

    return (
        <>
            <button onClick={openMenu} className="menu-button">
                <i className="fas fa-user-circle" />
            </button>
            <ul className={ulClassName} ref={ulRef}>
                {ulClassName === 'profile-dropdown hidden' ? (
                    <></>
                ) :
                    (user ? (
                        <>
                            <div>Hello, {user.firstName}</div>
                            <div>{user.email}</div>
                            <NavLink to="/spots/current">
                                Manage Spots
                            </NavLink>
                            <div>
                                <button onClick={logout}>Log Out</button>
                            </div>
                        </>
                    ) : (
                        <div className="login-signup-container">
                            <div className="login">
                                <OpenModalButton
                                    buttonText="Log In"
                                    onButtonClick={closeMenu}
                                    modalComponent={<LoginFormModal />}
                                />
                            </div>
                            <div className="signup">
                                <OpenModalButton
                                    buttonText="Sign Up"
                                    onButtonClick={closeMenu}
                                    modalComponent={<SignupFormModal />}
                                />
                            </div>
                        </div>
                    )
                    )}
            </ul>
        </>
    );
}

export default ProfileButton;
