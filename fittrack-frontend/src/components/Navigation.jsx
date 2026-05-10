import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
    return (
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
            <Link to="/" style={{ marginRight: '1rem' }}>Dashboard</Link>
            <Link to="/log-meal" style={{ marginRight: '1rem' }}>Log Meal</Link>
            <Link to="/log-workout" style={{ marginRight: '1rem' }}>Log Workout</Link>
            <Link to="/progress" style={{ marginRight: '1rem' }}>Progress</Link>
            <Link to="/login">Login</Link>
        </nav>
    );
};
export default Navigation;
