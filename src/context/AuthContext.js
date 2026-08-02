// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import api, { setAuthSessionActive } from '../api/client';

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
            setAuthSessionActive(true);

            const superUserStatus = await api.get('/api/users/check-superuser/');
            setIsSuperUser(superUserStatus.data.is_superuser);
        } catch (error) {
            setUser(null);
            setIsSuperUser(false);
            if (error.response?.status === 401) {
                setAuthSessionActive(false);
            }
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
        setAuthSessionActive(true);
        await initializeCsrf(); // Reinitialize CSRF token after login
        await refreshUser();
    }, [refreshUser, initializeCsrf]);

    const logout = useCallback(async () => {
        // Disable refresh before the request so an in-flight 401 cannot restore
        // a session while logout is clearing the cookies.
        setAuthSessionActive(false);
        setUser(null);
        setIsSuperUser(false);
        try {
            await api.post('/api/users/logout/');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            await initializeCsrf();
        }
    }, [initializeCsrf]);

    // Bootstrap from a quiet session-status endpoint so signed-out visitors do
    // not generate a 401 followed by a pointless refresh request.
    useEffect(() => {
        let mounted = true;

        const bootstrapAuth = async () => {
            await initializeCsrf();
            try {
                const response = await api.get('/api/users/session-status/');
                if (!mounted) return;
                if (response.data.has_session) {
                    setAuthSessionActive(true);
                    await refreshUser();
                } else {
                    setAuthSessionActive(false);
                    setLoading(false);
                }
            } catch (error) {
                // Preserve compatibility during a rolling frontend/backend deploy.
                if (mounted) await refreshUser();
            }
        };

        const handleExpiredSession = () => {
            setUser(null);
            setIsSuperUser(false);
            setLoading(false);
        };

        window.addEventListener('auth:expired', handleExpiredSession);
        bootstrapAuth();

        return () => {
            mounted = false;
            window.removeEventListener('auth:expired', handleExpiredSession);
        };
    }, [initializeCsrf, refreshUser]);

    return (
        <AuthContext.Provider value={{ user, isSuperUser, login, logout, register, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
