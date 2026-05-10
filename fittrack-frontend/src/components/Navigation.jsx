import React from 'react';
import { NavLink } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <NavLink
                label="Dashboard"
                active={location.pathname === '/'}
                onClick={() => handleNavigate('/')}
                variant="filled"
                color="violet"
                style={{ borderRadius: '8px' }}
            />
            <NavLink
                label="Log Meal"
                active={location.pathname === '/log-meal'}
                onClick={() => handleNavigate('/log-meal')}
                variant="filled"
                color="violet"
                style={{ borderRadius: '8px' }}
            />
            <NavLink
                label="Log Workout"
                active={location.pathname === '/log-workout'}
                onClick={() => handleNavigate('/log-workout')}
                variant="filled"
                color="violet"
                style={{ borderRadius: '8px' }}
            />
            <NavLink
                label="Progress & AI"
                active={location.pathname === '/progress'}
                onClick={() => handleNavigate('/progress')}
                variant="filled"
                color="violet"
                style={{ borderRadius: '8px' }}
            />

            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <NavLink
                    label="Login"
                    active={location.pathname === '/login'}
                    onClick={() => handleNavigate('/login')}
                    variant="subtle"
                    color="cyan"
                    style={{ borderRadius: '8px' }}
                />
                <NavLink
                    label="Register"
                    active={location.pathname === '/register'}
                    onClick={() => handleNavigate('/register')}
                    variant="subtle"
                    color="cyan"
                    style={{ borderRadius: '8px' }}
                />
            </div>
        </div>
    );
};

export default Navigation;
