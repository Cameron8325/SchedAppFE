import React, { useState } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
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
        <Container maxWidth="sm" sx={{ backgroundColor: '#F0E5D8', padding: '2rem', borderRadius: '8px', marginTop: '10vh' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#4A4A48' }}>
                Register
            </Typography>
            <form onSubmit={handleRegister}>
                <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    InputLabelProps={{ style: { color: '#4A4A48' } }}  // Label color
                    InputProps={{
                        style: { backgroundColor: '#fff', color: '#4A4A48' },  // Input text color
                    }}
                />
                <TextField
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    InputLabelProps={{ style: { color: '#4A4A48' } }}
                    InputProps={{
                        style: { backgroundColor: '#fff', color: '#4A4A48' },
                    }}
                />
                <TextField
                    label="Last Name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    InputLabelProps={{ style: { color: '#4A4A48' } }}
                    InputProps={{
                        style: { backgroundColor: '#fff', color: '#4A4A48' },
                    }}
                />
                <TextField
                    label="Email"
                    variant="outlined"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    InputLabelProps={{ style: { color: '#4A4A48' } }}
                    InputProps={{
                        style: { backgroundColor: '#fff', color: '#4A4A48' },
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
                <TextField
                    label="Confirm Password"
                    variant="outlined"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    InputLabelProps={{ style: { color: '#4A4A48' } }}
                    InputProps={{
                        style: { backgroundColor: '#fff', color: '#4A4A48' },
                    }}
                />
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
            </form>
            {message && (
                <Typography color="error" sx={{ marginTop: '1rem' }}>
                    {message}
                </Typography>
            )}
        </Container>
    );
}

export default RegisterPage;
