import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '../../pages/HomePage';
import AboutPage from '../../pages/AboutPage';
import AppointmentsPage from '../../pages/appts/AppointmentsPage';
import ProfilePage from '../../pages/ProfilePage';
import LoginPage from '../../pages/LoginPage';
import RegisterPage from '../../pages/RegisterPage';
import AdminDashboard from '../../pages/AdminDashboard';
import CatalogPage from '../../pages/CatalogPage';
import PasswordResetPage from '../../pages/PasswordResetPage.jsx';
import AccountDeletionConfirm from '../../pages/AccountDeletionConfirm.jsx';
import NavBar from './navbar.jsx';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute.js';
import EmailConfirmed from '../../pages/EmailConfirmed';

function AppRoutes() {
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} /> {/* Public Route */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/reset/:uidb64/:token" element={<PasswordResetPage />} />
                {/* Add the account deletion confirmation route */}
                <Route
                    path="/users/delete-account-confirm/:uidb64/:token"
                    element={<AccountDeletionConfirm />}
                />
                {/* Corrected Verification Route */}
                <Route path="/verify-email/:uid/:token" element={<EmailConfirmed />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
