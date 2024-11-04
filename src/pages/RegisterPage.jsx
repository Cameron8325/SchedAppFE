import React, { useState, useContext } from 'react';
import { Container, TextField, Button, Typography, Box, Grid, CircularProgress, Alert } from '@mui/material';
import { AuthContext } from "../context/AuthContext"; // Updated import
import { useNavigate } from 'react-router-dom';
import CustomModal from '../components/modal/CustomModal'; // Import CustomModal component

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false); // Modal visibility state

    const navigate = useNavigate();
    const { register } = useContext(AuthContext); // Access register and login from AuthContext

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            await register(username, firstName, lastName, email, password, passwordConfirm, phoneNumber);
            setModalOpen(true); // Show modal after successful registration
        } catch (error) {
            if (error.response && error.response.data) {
                // Extract error messages from response data
                let errorMessages = [];
                for (const key in error.response.data) {
                    if (Array.isArray(error.response.data[key])) {
                        errorMessages = errorMessages.concat(error.response.data[key]);
                    } else {
                        errorMessages.push(error.response.data[key]);
                    }
                }
                setMessage(errorMessages.join(' '));
            } else {
                setMessage('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setModalOpen(false);
        navigate('/login'); // Optionally, redirect to login page after closing the modal
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
                                InputLabelProps={{ style: { color: '#4A4A48' } }}
                                InputProps={{
                                    style: { backgroundColor: '#fff', color: '#4A4A48' },
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
                                InputLabelProps={{ style: { color: '#4A4A48' } }}
                                InputProps={{
                                    style: { backgroundColor: '#fff', color: '#4A4A48' },
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
                                InputLabelProps={{ style: { color: '#4A4A48' } }}
                                InputProps={{
                                    style: { backgroundColor: '#fff', color: '#4A4A48' },
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
                                InputLabelProps={{ style: { color: '#4A4A48' } }}
                                InputProps={{
                                    style: { backgroundColor: '#fff', color: '#4A4A48' },
                                }}
                            />
                        </Grid>

                        {/* Phone Number Field */}
                        <Grid item xs={12}>
                            <TextField
                                label="Phone Number"
                                variant="outlined"
                                fullWidth
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                                InputLabelProps={{ style: { color: '#4A4A48' } }}
                                InputProps={{
                                    style: { backgroundColor: '#fff', color: '#4A4A48' },
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
                                InputLabelProps={{ style: { color: '#4A4A48' } }}
                                InputProps={{
                                    style: { backgroundColor: '#fff', color: '#4A4A48' },
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
                                InputLabelProps={{ style: { color: '#4A4A48' } }}
                                InputProps={{
                                    style: { backgroundColor: '#fff', color: '#4A4A48' },
                                }}
                            />
                        </Grid>

                        {/* Register Button */}
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                type="submit"
                                fullWidth
                                disabled={loading}
                                sx={{
                                    backgroundColor: '#8B5E3C',
                                    color: '#FFF',
                                    '&:hover': {
                                        backgroundColor: '#C2A773',
                                    },
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
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

            {/* CustomModal to notify user to check their email */}
            <CustomModal
                open={modalOpen}
                onClose={handleModalClose}
                title="Verify Your Email"
                description="Thank you for registering! A verification link has been sent to your email. Please check your inbox to complete the registration."
                isConfirmVisible={false} // Hides the confirm button
            />
        </Container>
    );
}

export default RegisterPage;
