import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Grid } from '@mui/material';
import authService from '../services/authService';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = (e) => {
        e.preventDefault();
        authService.register(username, firstName, lastName, email, password, passwordConfirm).then(
            () => {
                window.location.href = '/login';
            },
            (error) => {
                setMessage('Registration failed');
            }
        );
    };

    return (
        <Container maxWidth="sm" sx={{ marginTop: '10vh' }}>
            <Box 
                sx={{ 
                    backgroundColor: '#F0E5D8', 
                    padding: { xs: '1.5rem', sm: '2rem' },  // Responsive padding
                    borderRadius: '8px', 
                    boxShadow: 3,  // Adds a subtle shadow for better focus on the form
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#4A4A48' }}>
                    Register
                </Typography>

                <form onSubmit={handleRegister}>
                    <Grid container spacing={2}>
                        {/* Username Field */}
                        <Grid item xs={12}>
                            <TextField
                                label="Username"
                                variant="outlined"
                                fullWidth
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                InputLabelProps={{ style: { color: '#4A4A48' } }}  // Label color
                                InputProps={{
                                    style: { backgroundColor: '#fff', color: '#4A4A48' },  // Input text color
                                }}
                            />
                        </Grid>

                        {/* First Name Field */}
                        <Grid item xs={12}>
                            <TextField
                                label="First Name"
                                variant="outlined"
                                fullWidth
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                InputLabelProps={{ style: { color: '#4A4A48' } }}  // Label color
                                InputProps={{
                                    style: { backgroundColor: '#fff', color: '#4A4A48' },  // Input text color
                                }}
                            />
                        </Grid>

                        {/* Last Name Field */}
                        <Grid item xs={12}>
                            <TextField
                                label="Last Name"
                                variant="outlined"
                                fullWidth
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                InputLabelProps={{ style: { color: '#4A4A48' } }}  // Label color
                                InputProps={{
                                    style: { backgroundColor: '#fff', color: '#4A4A48' },  // Input text color
                                }}
                            />
                        </Grid>

                        {/* Email Field */}
                        <Grid item xs={12}>
                            <TextField
                                label="Email"
                                variant="outlined"
                                type="email"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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

                        {/* Confirm Password Field */}
                        <Grid item xs={12}>
                            <TextField
                                label="Confirm Password"
                                variant="outlined"
                                type="password"
                                fullWidth
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                required
                                InputLabelProps={{ style: { color: '#4A4A48' } }}  // Label color
                                InputProps={{
                                    style: { backgroundColor: '#fff', color: '#4A4A48' },  // Input text color
                                }}
                            />
                        </Grid>

                        {/* Register Button */}
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                fullWidth
                                sx={{
                                    backgroundColor: '#8B5E3C',  // Earthy Brown
                                    color: '#F0E5D8',  // Warm Cream
                                    '&:hover': {
                                        backgroundColor: '#C2A773',  // Muted Gold
                                    },
                                }}
                                type="submit"
                            >
                                Register
                            </Button>
                        </Grid>
                    </Grid>
                </form>

                {/* Error Message */}
                {message && (
                    <Typography color="error" sx={{ marginTop: '1rem' }}>
                        {message}
                    </Typography>
                )}
            </Box>
        </Container>
    );
}

export default RegisterPage;
