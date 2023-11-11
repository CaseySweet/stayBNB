import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }) {
    const sessionUser = useSelector(state => state.session.user);
    return (
        <div className='top-container'>
            <div>
                <img src='./favicon.png' alt='Favicon' className='logo' />
                <NavLink exact to="/" className='home-link'>staybnb</NavLink>
            </div>
            {isLoaded && (
                <div >
                    <NavLink to="/spots/new">Create a New Spot</NavLink>
                    <ProfileButton user={sessionUser} />
                </div>
            )}
        </div>
    );
}

export default Navigation;
