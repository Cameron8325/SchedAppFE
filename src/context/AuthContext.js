// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isSuperUser, setIsSuperUser] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initialize CSRF token by hitting the set-csrf endpoint
    const initializeCsrf = useCallback(async () => {
        try {
            await api.get('/api/users/set-csrf/');
        } catch (error) {
            console.error('Failed to initialize CSRF token:', error);
        }
    }, []);

    // Fetch (or re-fetch) the authenticated user's data
    const refreshUser = useCallback(async () => {
        try {
            const response = await api.get('/api/users/check-user/');
            setUser(response.data);

            const superUserStatus = await api.get('/api/users/check-superuser/');
            setIsSuperUser(superUserStatus.data.is_superuser);
        } catch (error) {
            setUser(null);
            setIsSuperUser(false);
            if (!error.response || error.response.status !== 401) {
                console.error('Error fetching current user:', error);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (username, firstName, lastName, email, password, passwordConfirm, phoneNumber) => {
        const response = await api.post('/api/users/register/', {
            username,
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            password_confirm: passwordConfirm,
            phone_number: phoneNumber,
        });
        return response.data;
    }, []);

    const login = useCallback(async (username_email, password) => {
        await api.post('/api/users/login/', { username_email, password });
        await initializeCsrf(); // Reinitialize CSRF token after login
        await refreshUser();
    }, [refreshUser, initializeCsrf]);

    const logout = useCallback(async () => {
        try {
            await api.post('/api/users/logout/');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setUser(null);
            setIsSuperUser(false);
            await initializeCsrf();
        }
    }, [initializeCsrf]);

    // Fetch current user when component mounts
    useEffect(() => {
        initializeCsrf();
        refreshUser();
    }, [initializeCsrf, refreshUser]);

    return (
        <AuthContext.Provider value={{ user, isSuperUser, login, logout, register, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
