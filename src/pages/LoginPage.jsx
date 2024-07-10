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
        <Container maxWidth="sm">
            <Typography variant="h4" component="h1" gutterBottom>
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
                />
                <Button variant="contained" color="primary" type="submit" fullWidth>
                    Login
                </Button>
            </form>
            {message && <Typography color="error">{message}</Typography>}
        </Container>
    );
}

export default LoginPage;
