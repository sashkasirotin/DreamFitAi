/**
 * @file AuthContext.jsx
 * @description React Context wrapper to manage global user state.
 * Handles token persistence in localStorage, active login/registration sessions,
 * and configures global headers on the Axios connection interface.
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

// Create the Context container for authentication
export const AuthContext = createContext();

// Custom hook to consume the authentication state in child components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Run verification check on initial mount to restore user session if credentials exist
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
            // Setup default authorization header for all subsequent API queries
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    /**
     * Authenticates user against login credentials and persists their session details.
     * @param {string} email 
     * @param {string} password 
     */
    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token, user: userData } = response.data;
        
        // Save security credentials locally
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Setup authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        return userData;
    };

    /**
     * Registers a new account, then calls `login` automatically to begin session.
     */
    const register = async (name, email, password) => {
        await api.post('/auth/register', { name, email, password });
        return login(email, password);
    };

    /**
     * Clears all session credentials from browser memory, logging the user out.
     */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

