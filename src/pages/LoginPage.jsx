import React, { useState } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import authService from '../services/authService';

function LoginPage() {
    const [usernameEmail, setUsernameEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        authService.login(usernameEmail, password).then(
            (data) => {
                window.location.href = '/appointments';
            },
            (error) => {
                setMessage('Invalid credentials');
            }
        );
    };

    return (
        <Container maxWidth="sm" sx={{ backgroundColor: '#F0E5D8', padding: '2rem', borderRadius: '8px', marginTop: '10vh', }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#4A4A48' }}>
                Login
            </Typography>
            <form onSubmit={handleLogin}>
                <TextField
                    label="Username or Email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={usernameEmail}
                    onChange={(e) => setUsernameEmail(e.target.value)}
                    required
                    InputLabelProps={{ style: { color: '#4A4A48' } }}  // Label color
                    InputProps={{
                        style: { backgroundColor: '#fff', color: '#4A4A48' },  // Input text color
                    }}
                />
                <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    InputLabelProps={{ style: { color: '#4A4A48' } }}
                    InputProps={{
                        style: { backgroundColor: '#fff', color: '#4A4A48' },
                    }}
                />
                <Button
                    variant="contained"
                    type="submit"
                    fullWidth
                    sx={{
                        backgroundColor: '#8B5E3C',  // Earthy Brown
                        color: '#F0E5D8',  // Warm Cream
                        '&:hover': {
                            backgroundColor: '#C2A773',  // Muted Gold
                        },
                    }}
                >
                    Login
                </Button>
            </form>
            {message && (
                <Typography color="error" sx={{ marginTop: '1rem' }}>
                    {message}
                </Typography>
            )}
        </Container>
    );
}

export default LoginPage;
