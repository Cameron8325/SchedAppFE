// src/index.js

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppRoutes from './components/navbar/routes';
import { AuthProvider } from './context/AuthContext';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
);
