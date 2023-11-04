import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }) {
    const sessionUser = useSelector(state => state.session.user);

    return (
        <div>
            <div class='top-container'>
                <div>
                    <NavLink exact to="/" class='home-link'>staybnb</NavLink>
                </div>
                <div>
                    <ul>
                        {isLoaded && (
                            <li>
                                <ProfileButton user={sessionUser} />
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Navigation;
