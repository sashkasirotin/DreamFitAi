/**
 * @file api.js
 * @description Standardized Axios client instance.
 * Houses the backend base URL routing, and attaches request interceptors
 * to inject JWT authentication tokens transparently into header envelopes.
 */

import axios from 'axios';

// Get base URL from environment variables, fallback to local standard port if undefined
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Axios Request Interceptor: Automatically fetches the user's login session token
// from local storage and embeds it into the HTTP Authorization request header.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

