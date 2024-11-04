// src/components/navbar/NavBar.js

import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
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
  Divider,
  Box,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useTheme, useMediaQuery } from "@mui/material";
import { AuthContext } from "../../context/AuthContext";

function NavBar() {
  const { user, isSuperUser, logout } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Detect if screen is md or smaller

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/"; // Redirect to home after logout
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally, display an error message to the user
    }
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const navLinks = (
    <>
      <ListItem component={RouterLink} to="/">
        <ListItemText primary="Home" sx={{ color: "#4A4A48" }} />
      </ListItem>
      <ListItem component={RouterLink} to="/about">
        <ListItemText primary="About" sx={{ color: "#4A4A48" }} />
      </ListItem>
      <ListItem component={RouterLink} to="/catalog">
        <ListItemText primary="Catalog" sx={{ color: "#4A4A48" }} />
      </ListItem>
      <ListItem component={RouterLink} to="/appointments">
        <ListItemText primary="Appointments" sx={{ color: "#4A4A48" }} />
      </ListItem>
      <Divider />
      {user ? (
        <>
          {isSuperUser ? (
            <ListItem component={RouterLink} to="/admin">
              <ListItemText
                primary="Admin Dashboard"
                sx={{ color: "#4A4A48" }}
              />
            </ListItem>
          ) : (
            <ListItem component={RouterLink} to="/profile">
              <ListItemText primary="Profile" sx={{ color: "#4A4A48" }} />
            </ListItem>
          )}
          <ListItem onClick={handleLogout}>
            <ListItemText primary="Logout" sx={{ color: "#4A4A48" }} />
          </ListItem>
        </>
      ) : (
        <>
          <ListItem component={RouterLink} to="/login">
            <ListItemText primary="Login" sx={{ color: "#4A4A48" }} />
          </ListItem>
          <ListItem component={RouterLink} to="/register">
            <ListItemText primary="Register" sx={{ color: "#4A4A48" }} />
          </ListItem>
        </>
      )}
    </>
  );

  return (
    <AppBar position="static" sx={{ backgroundColor: "#4A4A48" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, color: "#F0E5D8" }}>
          Gong Fu Tea Scheduler
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              edge="end"
              onClick={toggleDrawer(true)}
              sx={{ color: "#F0E5D8" }}
            >
              <MenuIcon />
            </IconButton>

            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              <Box
                role="presentation"
                onClick={toggleDrawer(false)}
                onKeyDown={toggleDrawer(false)}
                sx={{
                  width: 250,
                  backgroundColor: "#F0E5D8",
                  height: "100%",
                  color: "#4A4A48",
                }}
              >
                <List>{navLinks}</List>
              </Box>
            </Drawer>
          </>
        ) : (
          <>
            <Button sx={{ color: "#F0E5D8" }} component={RouterLink} to="/">
              Home
            </Button>
            <Button
              sx={{ color: "#F0E5D8" }}
              component={RouterLink}
              to="/about"
            >
              About
            </Button>
            <Button
              sx={{ color: "#F0E5D8" }}
              component={RouterLink}
              to="/catalog"
            >
              Catalog
            </Button>
            <Button
              sx={{ color: "#F0E5D8" }}
              component={RouterLink}
              to="/appointments"
            >
              Appointments
            </Button>
            {user ? (
              <>
                {isSuperUser ? (
                  <Button
                    sx={{ color: "#F0E5D8" }}
                    component={RouterLink}
                    to="/admin"
                  >
                    Admin Dashboard
                  </Button>
                ) : (
                  <Button
                    sx={{ color: "#F0E5D8" }}
                    component={RouterLink}
                    to="/profile"
                  >
                    Profile
                  </Button>
                )}
                <Button sx={{ color: "#F0E5D8" }} onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  sx={{ color: "#F0E5D8" }}
                  component={RouterLink}
                  to="/login"
                >
                  Login
                </Button>
                <Button
                  sx={{ color: "#F0E5D8" }}
                  component={RouterLink}
                  to="/register"
                >
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
