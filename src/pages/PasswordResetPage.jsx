import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Container, TextField, Button, Typography, Box, Grid } from '@mui/material';
import axios from 'axios';

function PasswordResetPage() {
    const { uidb64, token } = useParams();
    const navigate = useNavigate(); // Initialize navigate
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }
    
        try {
            const response = await axios.post(
                `http://localhost:8000/api/users/reset/${uidb64}/${token}/`,
                {
                    new_password1: newPassword,
                    new_password2: confirmPassword,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            setMessage('Password reset successful. You can now log in.');
            setSuccess(true);

            // Clear any stored tokens if necessary
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');

            // Redirect to the login page after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error) {
            if (error.response && error.response.data) {
                setMessage(error.response.data.error || 'Failed to reset password.');
            } else {
                setMessage('Failed to reset password. Please try again later.');
            }
        }
    };

    return (
        <Container maxWidth="sm" sx={{ marginTop: '10vh' }}>
            <Box
                sx={{
                    backgroundColor: '#F0E5D8',
                    padding: { xs: '1.5rem', sm: '2rem' },
                    borderRadius: '8px',
                    boxShadow: 3,
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#4A4A48' }}>
                    Reset Password
                </Typography>

                <form onSubmit={handlePasswordReset}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="New Password"
                                variant="outlined"
                                type="password"
                                fullWidth
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                InputLabelProps={{ style: { color: '#4A4A48' } }}
                                InputProps={{
                                    style: { backgroundColor: '#fff', color: '#4A4A48' },
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Confirm New Password"
                                variant="outlined"
                                type="password"
                                fullWidth
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                InputLabelProps={{ style: { color: '#4A4A48' } }}
                                InputProps={{
                                    style: { backgroundColor: '#fff', color: '#4A4A48' },
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                type="submit"
                                fullWidth
                                sx={{
                                    backgroundColor: '#8B5E3C',
                                    color: '#F0E5D8',
                                    '&:hover': {
                                        backgroundColor: '#C2A773',
                                    },
                                }}
                            >
                                Reset Password
                            </Button>
                        </Grid>
                    </Grid>
                </form>

                {/* Error/Success Message */}
                {message && (
                    <Typography
                        color={success ? "success" : "error"}
                        sx={{ marginTop: '1rem' }}
                    >
                        {message}
                        {success && (
                            <Typography variant="body2">
                                Redirecting to login page...
                            </Typography>
                        )}
                    </Typography>
                )}
            </Box>
        </Container>
    );
}

export default PasswordResetPage;
