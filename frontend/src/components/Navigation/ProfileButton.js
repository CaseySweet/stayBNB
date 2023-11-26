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
                        <div className="logged-user-container">
                            <div>Hello, {user.firstName}</div>
                            <div className="user-email-nav">{user.email}</div>
                            <div className="manage-spots-nav">
                                <NavLink className="manage-spots-button" to="/spots/current" onClick={closeMenu}>
                                    Manage Spots
                                </NavLink>
                            </div>
                            <div>
                                <button className="logout-button-nav" onClick={logout}>Log Out</button>
                            </div>
                        </div>
                    ) : (
                        <div className="login-signup-container">
                                <OpenModalButton
                                    className={"signup"}
                                    buttonText="Sign Up"
                                    onButtonClick={closeMenu}
                                    modalComponent={<SignupFormModal />}
                                />
                                <OpenModalButton
                                    className={"login"}
                                    buttonText="Log In"
                                    onButtonClick={closeMenu}
                                    modalComponent={<LoginFormModal />}
                                />
                            </div>
                    )
                    )}
            </ul>
        </>
    );
}

export default ProfileButton;
