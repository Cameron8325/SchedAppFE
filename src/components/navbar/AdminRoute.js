import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const AdminRoute = ({ children }) => {
    const { user, isSuperUser, loading } = useContext(AuthContext);

    if (loading) {
        // Show a loading spinner while authentication status is being determined
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!user || !isSuperUser) {
        // Redirect to home if not an admin
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
