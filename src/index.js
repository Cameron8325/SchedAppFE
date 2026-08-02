// src/index.js

import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import './index.css';
import AppRoutes from './components/navbar/routes';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <ThemeProvider theme={theme}>
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    </ThemeProvider>
);
