import React, { useState, useContext } from 'react';
import { Container, TextField, Button, Typography, Box, Grid, CircularProgress, Alert } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginPage() {
    const [usernameEmail, setUsernameEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [resendMessage, setResendMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showResend, setShowResend] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setResendMessage('');
        setShowResend(false);
        try {
            await login(usernameEmail, password);
            navigate('/appointments'); // Redirect to appointments page after successful login
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setMessage(error.response.data.error);
                if (error.response.data.error === 'Email is not verified.') {
                    setShowResend(true);
                }
            } else {
                setMessage('Invalid credentials or server error');
            }
        } finally {
            setLoading(false);
        }
    };

    const resendVerificationEmail = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/users/resend-verification-email/', {
                email: usernameEmail  // 'usernameEmail' can be either email or username
            });
            if (response.data.message) {
                setResendMessage(response.data.message);
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setResendMessage(error.response.data.error);
            } else {
                setResendMessage('Failed to resend verification email.');
            }
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
                                    color: '#fff',  // Warm Cream
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
                    <Alert severity={showResend ? "warning" : "error"} sx={{ marginTop: '1rem' }}>
                        {message}
                    </Alert>
                )}

                {/* Resend Verification Button */}
                {showResend && (
                    <Box sx={{ marginTop: '1rem' }}>
                        <Typography variant="body2" sx={{ color: '#4A4A48' }}>
                            Didn't receive the verification email?
                        </Typography>
                        <Button
                            variant="text"
                            onClick={resendVerificationEmail}
                            sx={{
                                textTransform: 'none',
                                color: '#8B5E3C',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            Resend Verification Email
                        </Button>
                        {resendMessage && (
                            <Alert 
                                severity={resendMessage.includes('sent') ? "success" : "error"} 
                                sx={{ marginTop: '0.5rem' }}
                            >
                                {resendMessage}
                            </Alert>
                        )}
                    </Box>
                )}
            </Box>
        </Container>
    );
}

export default LoginPage;
