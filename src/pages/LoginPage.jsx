// src/pages/LoginPage.js

import React, { useState, useContext } from 'react';
import { Container, TextField, Button, Typography, Box, Grid, CircularProgress, Alert } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [usernameEmail, setUsernameEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            await login(usernameEmail, password);
            navigate('/appointments'); // Redirect to appointments page after successful login
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setMessage(error.response.data.error);
            } else {
                setMessage('Invalid credentials or server error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ marginTop: '10vh' }}>
            <Box 
                sx={{ 
                    backgroundColor: '#F0E5D8', 
                    padding: { xs: '1.5rem', sm: '2rem' }, // Responsive padding
                    borderRadius: '8px', 
                    boxShadow: 3, // Adds a subtle shadow for better focus on the form
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#4A4A48' }}>
                    Login
                </Typography>
                
                <form onSubmit={handleLogin}>
                    <Grid container spacing={2}>
                        {/* Username/Email Field */}
                        <Grid item xs={12}>
                            <TextField
                                label="Username or Email"
                                variant="outlined"
                                fullWidth
                                value={usernameEmail}
                                onChange={(e) => setUsernameEmail(e.target.value)}
                                required
                                InputLabelProps={{ style: { color: '#4A4A48' } }}  // Label color
                                InputProps={{
                                    style: { backgroundColor: '#fff', color: '#4A4A48' },  // Input text color
                                }}
                            />
                        </Grid>

                        {/* Password Field */}
                        <Grid item xs={12}>
                            <TextField
                                label="Password"
                                variant="outlined"
                                type="password"
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                InputLabelProps={{ style: { color: '#4A4A48' } }}  // Label color
                                InputProps={{
                                    style: { backgroundColor: '#fff', color: '#4A4A48' },  // Input text color
                                }}
                            />
                        </Grid>

                        {/* Login Button */}
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                type="submit"
                                fullWidth
                                disabled={loading}
                                sx={{
                                    backgroundColor: '#8B5E3C',  // Earthy Brown
                                    color: '#F0E5D8',  // Warm Cream
                                    '&:hover': {
                                        backgroundColor: '#C2A773',  // Muted Gold
                                    },
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>

                {/* Error Message */}
                {message && (
                    <Alert severity="error" sx={{ marginTop: '1rem' }}>
                        {message}
                    </Alert>
                )}
            </Box>
        </Container>
    );
}

export default LoginPage;
