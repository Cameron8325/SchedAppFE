// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Ensure axios sends cookies with requests
axios.defaults.withCredentials = true;

// Create a flag to check if the interceptor is already set up
let axiosInterceptorSetUp = false;

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isSuperUser, setIsSuperUser] = useState(false);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/users/';

    // Helper function to get a cookie value by name
    const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                cookie = cookie.trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    // Initialize CSRF token by hitting the set-csrf endpoint
    const initializeCsrf = useCallback(async () => {
        try {
            await axios.get(`${API_URL}set-csrf/`);
        } catch (error) {
            console.error('Failed to initialize CSRF token:', error);
        }
    }, [API_URL]);

    // Fetch current user data
    const fetchCurrentUser = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}check-user/`);
            setUser(response.data);

            const superUserStatus = await axios.get(`${API_URL}check-superuser/`);
            setIsSuperUser(superUserStatus.data.is_superuser);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // User is not authenticated; set user to null without triggering token refresh
                setUser(null);
                setIsSuperUser(false);
            } else {
                console.error('Error fetching current user:', error);
            }
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    // Register function
    const register = useCallback(async (username, firstName, lastName, email, password, passwordConfirm, phoneNumber) => {
        const csrfToken = getCookie('csrftoken');
        try {
            const response = await axios.post(`${API_URL}register/`, {
                username,
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                password_confirm: passwordConfirm,
                phone_number: phoneNumber,
            }, {
                headers: {
                    'X-CSRFToken': csrfToken
                }
            });
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }, [API_URL]);

    // Login function
    const login = useCallback(async (username_email, password) => {
        const csrfToken = getCookie('csrftoken');
        try {
            await axios.post(`${API_URL}login/`, {
                username_email,
                password,
            }, {
                headers: { 'X-CSRFToken': csrfToken }
            });

            await initializeCsrf(); // Reinitialize CSRF token after login
            await fetchCurrentUser(); // Update user state after login
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }, [API_URL, fetchCurrentUser, initializeCsrf]);

    // Logout function wrapped in useCallback
    const logout = useCallback(async () => {
        const csrfToken = getCookie('csrftoken');
        try {
            await axios.post(`${API_URL}logout/`, {}, {
                headers: { 'X-CSRFToken': csrfToken }
            });
            await initializeCsrf(); // Reinitialize CSRF token after logout
            setUser(null);
            setIsSuperUser(false);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, [API_URL, initializeCsrf]);

    // Refresh token function wrapped in useCallback
    const refreshToken = useCallback(async () => {
        const csrfToken = getCookie('csrftoken');
        const refreshTokenValue = getCookie('refresh_token');
        if (!refreshTokenValue) {
            console.error('No refresh token available');
            throw new Error('No refresh token found');
        }

        try {
            const response = await axios.post(`${API_URL}token/refresh/`, {
                refresh: refreshTokenValue
            }, {
                headers: { 'X-CSRFToken': csrfToken }
            });

            await initializeCsrf(); // Reinitialize CSRF token after refresh
            return response.data;
        } catch (error) {
            console.error('Token refresh error:', error);
            throw error;
        }
    }, [API_URL, initializeCsrf]);

    // Set up Axios interceptor to handle token refresh
    useEffect(() => {
        if (!axiosInterceptorSetUp) {
            axios.interceptors.response.use(
                response => response,
                async error => {
                    const originalRequest = error.config;
                    if (error.response && error.response.status === 401 && !originalRequest._retry) {
                        // Check if refresh token is available
                        const refreshTokenValue = getCookie('refresh_token');
                        if (!refreshTokenValue) {
                            // No refresh token; user is not logged in
                            console.error('No refresh token available, cannot refresh token.');
                            setUser(null);
                            setIsSuperUser(false);
                            setLoading(false);
                            return Promise.reject(error);
                        }
                        originalRequest._retry = true;
                        try {
                            await refreshToken(); // Attempt to refresh token
                            return axios(originalRequest); // Retry the original request
                        } catch (refreshError) {
                            console.error('Token refresh failed:', refreshError);
                            await logout(); // Log out the user if refresh fails
                            return Promise.reject(refreshError);
                        }
                    }
                    return Promise.reject(error);
                }
            );
            axiosInterceptorSetUp = true;
        }
    }, [refreshToken, logout]);

    // Fetch current user when component mounts
    useEffect(() => {
        initializeCsrf(); // Ensure CSRF token is initialized
        fetchCurrentUser();
    }, [initializeCsrf, fetchCurrentUser]);

    return (
        <AuthContext.Provider value={{ user, isSuperUser, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
