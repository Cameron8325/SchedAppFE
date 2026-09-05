import React, { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Container, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await api.post('/api/users/password-reset/', { email: email.trim() });
      setMessage('If an account uses that email, a password reset link has been sent. Check your inbox and spam folder.');
    } catch (failure) {
      setError(failure.response?.data?.error || 'We could not send a reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: '10vh', mb: 4 }}>
      <Box sx={{ bgcolor: 'background.paper', p: { xs: 3, sm: 4 }, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>Forgot your password?</Typography>
        <Typography sx={{ mb: 3 }}>Enter your account email and we will send you a reset link.</Typography>
        <Box component="form" onSubmit={submit}>
          <TextField label="Email" type="email" autoComplete="email" required fullWidth value={email} onChange={(event) => setEmail(event.target.value)} />
          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send reset link'}
          </Button>
        </Box>
        {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Button component={RouterLink} to="/login" sx={{ mt: 2 }}>Back to sign in</Button>
      </Box>
    </Container>
  );
}
