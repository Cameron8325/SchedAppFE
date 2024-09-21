import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '../../pages/HomePage';
import AboutPage from '../../pages/AboutPage';
import AppointmentsPage from '../../pages/appts/AppointmentsPage';
import ProfilePage from '../../pages/ProfilePage';
import LoginPage from '../../pages/LoginPage';
import RegisterPage from '../../pages/RegisterPage';
import AdminDashboard from '../../pages/AdminDashboard';
import CatalogPage from '../../pages/CatalogPage'; // Import the CatalogPage
import NavBar from './navbar';

function AppRoutes() {
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
