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
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
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
                                    <ListItem button={true} component={RouterLink} to="/">
                                        <ListItemText primary="Home" />
                                    </ListItem>
                                    <ListItem button={true} component={RouterLink} to="/about">
                                        <ListItemText primary="About" />
                                    </ListItem>
                                    <ListItem button={true} component={RouterLink} to="/catalog">
                                        <ListItemText primary="Catalog" />
                                    </ListItem>
                                    {isLoggedIn && (
                                        <ListItem button={true} component={RouterLink} to="/appointments">
                                            <ListItemText primary="Appointments" />
                                        </ListItem>
                                    )}
                                    <Divider />
                                    {isLoggedIn ? (
                                        <>
                                            {isSuperUser && (
                                                <ListItem button={true} component={RouterLink} to="/admin">
                                                    <ListItemText primary="Admin Dashboard" />
                                                </ListItem>
                                            )}
                                            <ListItem button={true} component={RouterLink} to="/profile">
                                                <ListItemText primary="Profile" />
                                            </ListItem>
                                            <ListItem button={true} onClick={handleLogout}>
                                                <ListItemText primary="Logout" />
                                            </ListItem>
                                        </>
                                    ) : (
                                        <>
                                            <ListItem button={true} component={RouterLink} to="/login">
                                                <ListItemText primary="Login" />
                                            </ListItem>
                                            <ListItem button={true} component={RouterLink} to="/register">
                                                <ListItemText primary="Register" />
                                            </ListItem>
                                        </>
                                    )}
                                </List>
                            </div>
                        </Drawer>
                    </>
                ) : (
                    <>
                        <Button color="inherit" component={RouterLink} to="/">
                            Home
                        </Button>
                        <Button color="inherit" component={RouterLink} to="/about">
                            About
                        </Button>
                        <Button color="inherit" component={RouterLink} to="/catalog">
                            Catalog
                        </Button>
                        {isLoggedIn && (
                            <Button color="inherit" component={RouterLink} to="/appointments">
                                Appointments
                            </Button>
                        )}
                        {isLoggedIn ? (
                            <>
                                {isSuperUser ? (
                                    <Button color="inherit" component={RouterLink} to="/admin">
                                        Admin Dashboard
                                    </Button>
                                ) : (
                                    <Button color="inherit" component={RouterLink} to="/profile">
                                        Profile
                                    </Button>
                                )}
                                <Button color="inherit" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button color="inherit" component={RouterLink} to="/login">
                                    Login
                                </Button>
                                <Button color="inherit" component={RouterLink} to="/register">
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
