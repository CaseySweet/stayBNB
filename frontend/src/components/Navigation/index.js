import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';
import favicon from  './favicon.png'

function Navigation({ isLoaded }) {
    const sessionUser = useSelector(state => state.session.user);
    return (
        <div className='top-container'>
            <div>
                <img src={favicon} alt='Favicon' className='logo' />
                <NavLink exact to="/" className='home-link'>staybnb</NavLink>
            </div>
            {isLoaded && (
                <div >
                    {sessionUser && (
                        <NavLink to="/spots/new" className='nav-create-spot'>Create a New Spot</NavLink>
                    )}
                    <ProfileButton user={sessionUser} />
                </div>
            )}
        </div>
    );
}

export default Navigation;
