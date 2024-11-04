import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Button, Alert, Box, TextField } from '@mui/material';

const EmailConfirmed = () => {
  const { uid, token } = useParams();  // Extract uid and token from URL parameters
  const [statusMessage, setStatusMessage] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [emailInput, setEmailInput] = useState('');  // State for email input
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/users/verify/${uid}/${token}/`);  // Use the uid and token from the URL
        if (response.data.message) {
          setStatusMessage('Your email has been verified. You can now log in.');
          setIsVerified(true);
          setTimeout(() => {
            navigate('/login');  // Redirect to login after a few seconds
          }, 3000);
        }
      } catch (error) {
        setStatusMessage('The verification link is invalid or expired.');
        setIsVerified(false);
      }
    };

    verifyEmail();
  }, [uid, token, navigate]);

  const resendVerificationEmail = async () => {
    if (!emailInput) {
      setResendMessage('Please enter your email address.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/api/users/resend-verification-email/', {
        email: emailInput,  // Send the entered email
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
          padding: { xs: '1.5rem', sm: '2rem' }, 
          borderRadius: '8px', 
          boxShadow: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#4A4A48' }}>
          Email Confirmation
        </Typography>
        <Typography variant="body1" sx={{ color: isVerified ? '#4A4A48' : 'error.main', marginTop: '1rem' }}>
          {statusMessage}
        </Typography>
        {!isVerified && (
          <div>
            <Typography variant="body2" sx={{ marginTop: '1rem', color: '#4A4A48' }}>
              If you didn't receive the verification email, please enter your email below to resend it.
            </Typography>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              sx={{ 
                marginTop: '1rem',
                backgroundColor: '#fff',
                '& .MuiInputLabel-root': { color: '#4A4A48' },
                '& .MuiInputBase-input': { color: '#4A4A48' }
              }}
            />
            <Button 
              variant="contained" 
              onClick={resendVerificationEmail} 
              sx={{ 
                marginTop: '1rem', 
                backgroundColor: '#8B5E3C', 
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#C2A773',
                }
              }}
            >
              Resend Verification Email
            </Button>
            {resendMessage && (
              <Alert 
                severity={resendMessage.includes('sent') ? "success" : "error"} 
                sx={{ marginTop: '1rem' }}
              >
                {resendMessage}
              </Alert>
            )}
          </div>
        )}
      </Box>
    </Container>
  );
};

export default EmailConfirmed;
