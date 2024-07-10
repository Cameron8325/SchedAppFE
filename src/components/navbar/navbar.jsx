import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import authService from '../../services/authService';

function NavBar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSuperUser, setIsSuperUser] = useState(false);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) {
            setIsLoggedIn(true);
            authService.isSuperUser().then(setIsSuperUser);
        }
    }, []);

    const handleLogout = () => {
        authService.logout();
        setIsLoggedIn(false);
        setIsSuperUser(false);
        window.location.href = '/';
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    Gong Fu Tea Scheduler
                </Typography>
                <Button color="inherit" component={Link} to="/">Home</Button>
                <Button color="inherit" component={Link} to="/about">About</Button>
                {isLoggedIn && <Button color="inherit" component={Link} to="/appointments">Appointments</Button>}
                {isLoggedIn ? (
                    <>
                        {isSuperUser ? (
                            <>
                                <Button color="inherit" component={Link} to="/admin">Admin Dashboard</Button>
                            </>
                        ) : (
                            <>
                                <Button color="inherit" component={Link} to="/profile">Profile</Button>
                            </>
                        )}
                        <Button color="inherit" onClick={handleLogout}>Logout</Button>
                    </>
                ) : (
                    <>
                        <Button color="inherit" component={Link} to="/login">Login</Button>
                        <Button color="inherit" component={Link} to="/register">Register</Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default NavBar;
