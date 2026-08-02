import React, { useContext, useState } from 'react';
import { Link as RouterLink, NavLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { AuthContext } from '../../context/AuthContext';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/catalog', label: 'Sessions' },
  { to: '/appointments', label: 'Calendar' },
  { to: '/about', label: 'Our practice' },
];

function NavBar() {
  const { user, isSuperUser, logout } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const accountLinks = user
    ? [
        ...(isSuperUser ? [{ to: '/admin', label: 'Operations' }] : []),
        { to: '/profile', label: 'My visits' },
      ]
    : [{ to: '/login', label: 'Sign in' }];

  const allLinks = [...publicLinks, ...accountLinks];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        color: '#17201D',
        backgroundColor: 'rgba(255,253,247,.96)',
        borderBottom: '1px solid #D7D1C4',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Toolbar sx={{ maxWidth: 1280, width: '100%', mx: 'auto', minHeight: { xs: 64, md: 72 }, px: { xs: 2, md: 4 } }}>
        <Box
          component={RouterLink}
          to="/"
          aria-label="Ceremonial Artifex home"
          sx={{ display: 'flex', alignItems: 'center', gap: 1.4, color: 'inherit', textDecoration: 'none', mr: 'auto' }}
        >
          <Box
            aria-hidden="true"
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 34,
              height: 34,
              color: '#FFFDF7',
              backgroundColor: '#B33A24',
              borderRadius: '50%',
              fontFamily: 'Georgia, serif',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '-0.04em',
            }}
          >
            CA
          </Box>
          <Box>
            <Box sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: 16, md: 19 }, lineHeight: 1 }}>
              Ceremonial Artifex
            </Box>
            <Box sx={{ mt: 0.45, color: '#6D756F', fontSize: 9, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase' }}>
              Sessions by reservation
            </Box>
          </Box>
        </Box>

        {isMobile ? (
          <IconButton onClick={() => setDrawerOpen(true)} aria-label="Open menu" sx={{ color: '#17201D' }}>
            <MenuIcon />
          </IconButton>
        ) : (
          <Box component="nav" aria-label="Main navigation" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {publicLinks.slice(1).map((link) => (
              <Button
                key={link.to}
                component={NavLink}
                to={link.to}
                sx={{ color: '#3F4945', px: 1.5, '&.active': { color: '#B33A24' } }}
              >
                {link.label}
              </Button>
            ))}
            {isSuperUser && (
              <Button component={NavLink} to="/admin" sx={{ color: '#3F4945', px: 1.5, '&.active': { color: '#B33A24' } }}>
                Operations
              </Button>
            )}
            {user ? (
              <>
                <IconButton component={RouterLink} to="/profile" aria-label="My visits" sx={{ ml: 1, color: '#173F36' }}>
                  <PersonOutlineIcon />
                </IconButton>
                <Button onClick={handleLogout} sx={{ color: '#58625E', px: 1 }}>Sign out</Button>
              </>
            ) : (
              <Button component={RouterLink} to="/login" variant="outlined" sx={{ ml: 1 }}>
                Sign in
              </Button>
            )}
          </Box>
        )}
      </Toolbar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 300, minHeight: '100%', backgroundColor: '#FFFDF7', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, pb: 2, borderBottom: '1px solid #D7D1C4' }}>
            <Box sx={{ fontFamily: 'Georgia, serif', fontSize: 20 }}>Ceremonial Artifex</Box>
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu"><CloseIcon /></IconButton>
          </Box>
          <List>
            {allLinks.map((link) => (
              <ListItemButton key={link.to} component={RouterLink} to={link.to} onClick={() => setDrawerOpen(false)}>
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
            {user && (
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Sign out" />
              </ListItemButton>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}

export default NavBar;
