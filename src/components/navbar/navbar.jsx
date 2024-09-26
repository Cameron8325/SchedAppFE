import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';
import authService from '../../services/authService';

function NavBar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSuperUser, setIsSuperUser] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Detect if screen is md or smaller

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

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: '#4A4A48' }}>
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1, color: '#F0E5D8' }}>
                    Gong Fu Tea Scheduler
                </Typography>

                {isMobile ? (
                    <>
                        <IconButton color="inherit" edge="end" onClick={toggleDrawer(true)}>
                            <MenuIcon />
                        </IconButton>
                        <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
                            <div
                                role="presentation"
                                onClick={toggleDrawer(false)}
                                onKeyDown={toggleDrawer(false)}
                                style={{ width: 250 }}
                            >
                                <List>
                                    <ListItem  component={RouterLink} to="/">
                                        <ListItemText primary="Home" sx={{ color: '#4A4A48' }} />
                                    </ListItem>
                                    <ListItem  component={RouterLink} to="/about">
                                        <ListItemText primary="About" sx={{ color: '#4A4A48' }} />
                                    </ListItem>
                                    <ListItem  component={RouterLink} to="/catalog">
                                        <ListItemText primary="Catalog" sx={{ color: '#4A4A48' }} />
                                    </ListItem>
                                    {isLoggedIn && (
                                        <ListItem  component={RouterLink} to="/appointments">
                                            <ListItemText primary="Appointments" sx={{ color: '#4A4A48' }} />
                                        </ListItem>
                                    )}
                                    <Divider />
                                    {isLoggedIn ? (
                                        <>
                                            {isSuperUser && (
                                                <ListItem  component={RouterLink} to="/admin">
                                                    <ListItemText primary="Admin Dashboard" sx={{ color: '#4A4A48' }} />
                                                </ListItem>
                                            )}
                                            <ListItem  component={RouterLink} to="/profile">
                                                <ListItemText primary="Profile" sx={{ color: '#4A4A48' }} />
                                            </ListItem>
                                            <ListItem  onClick={handleLogout}>
                                                <ListItemText primary="Logout" sx={{ color: '#4A4A48' }} />
                                            </ListItem>
                                        </>
                                    ) : (
                                        <>
                                            <ListItem  component={RouterLink} to="/login">
                                                <ListItemText primary="Login" sx={{ color: '#4A4A48' }} />
                                            </ListItem>
                                            <ListItem  component={RouterLink} to="/register">
                                                <ListItemText primary="Register" sx={{ color: '#4A4A48' }} />
                                            </ListItem>
                                        </>
                                    )}
                                </List>
                            </div>
                        </Drawer>
                    </>
                ) : (
                    <>
                        <Button sx={{ color: '#F0E5D8' }} component={RouterLink} to="/">
                            Home
                        </Button>
                        <Button sx={{ color: '#F0E5D8' }} component={RouterLink} to="/about">
                            About
                        </Button>
                        <Button sx={{ color: '#F0E5D8' }} component={RouterLink} to="/catalog">
                            Catalog
                        </Button>
                        {isLoggedIn && (
                            <Button sx={{ color: '#F0E5D8' }} component={RouterLink} to="/appointments">
                                Appointments
                            </Button>
                        )}
                        {isLoggedIn ? (
                            <>
                                {isSuperUser ? (
                                    <Button sx={{ color: '#F0E5D8' }} component={RouterLink} to="/admin">
                                        Admin Dashboard
                                    </Button>
                                ) : (
                                    <Button sx={{ color: '#F0E5D8' }} component={RouterLink} to="/profile">
                                        Profile
                                    </Button>
                                )}
                                <Button sx={{ color: '#F0E5D8' }} onClick={handleLogout}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button sx={{ color: '#F0E5D8' }} component={RouterLink} to="/login">
                                    Login
                                </Button>
                                <Button sx={{ color: '#F0E5D8' }} component={RouterLink} to="/register">
                                    Register
                                </Button>
                            </>
                        )}
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default NavBar;
