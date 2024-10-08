// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const [isSuperUser, setIsSuperUser] = useState(false); 
    const [loading, setLoading] = useState(true); 

    const fetchCurrentUser = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                const superUserStatus = await authService.isSuperUser();
                setIsSuperUser(superUserStatus);
            } else {
                setUser(null);
                setIsSuperUser(false);
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
            setUser(null);
            setIsSuperUser(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const login = async (username_email, password) => {
        try {
            await authService.login(username_email, password);
            await fetchCurrentUser(); // Update user state after login
        } catch (error) {
            if (error.response && error.response.status === 401) {
                try {
                    await authService.refreshToken(); 
                    await fetchCurrentUser(); // Retry fetching user after refreshing token
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    logout(); // Logout if refresh also fails
                }
            } else {
                throw error;
            }
        }
    };
    

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            setIsSuperUser(false);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isSuperUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
