import React, { useState } from 'react';
import { TextField, Button, Typography, Box, useMediaQuery } from '@mui/material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

const UserSearch = ({ openUserDetailsModal, showErrorModal }) => {
  const [searchUsername, setSearchUsername] = useState('');
  const [searchFirstName, setSearchFirstName] = useState('');
  const [searchLastName, setSearchLastName] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [selectedUser, setSelectedUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    tokens: 0,
  });
  const [selectedUserTokens, setSelectedUserTokens] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Responsive hook for mobile screens

  const searchUser = async () => {
    if (!searchUsername && !searchFirstName && !searchLastName) return;

    try {
      const token = localStorage.getItem('token');
      let query = '';
      if (searchUsername) query += `username=${searchUsername}`;
      if (searchFirstName) query += `${query ? '&' : ''}first_name=${searchFirstName}`;
      if (searchLastName) query += `${query ? '&' : ''}last_name=${searchLastName}`;

      const response = await axios.get(
        `http://localhost:8000/api/users/search/?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.length > 0) {
        const user = response.data[0];
        const userWithDetails = {
          ...user,
          phone_number: user.profile?.phone_number || 'N/A',
          tokens: user.profile?.tokens || 0,
        };
        setSearchResult(userWithDetails);
        setSelectedUser(userWithDetails);
        setSelectedUserTokens(userWithDetails.tokens);
      } else {
        setSearchResult(null);
        showErrorModal('User not found.');
      }
    } catch (error) {
      console.error('Error searching for user:', error);
      showErrorModal('Error searching for user.');
    }
  };

  const handleTokenUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      if (isNaN(selectedUserTokens) || selectedUserTokens < 0) {
        showErrorModal('Invalid token count. Please enter a valid number.');
        return;
      }

      const response = await axios.post(
        `http://localhost:8000/api/admin-panel/update-tokens/${selectedUser.id}/`,
        { tokens: parseInt(selectedUserTokens) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        showErrorModal('Tokens updated successfully.');
      }
    } catch (error) {
      console.error('Error updating tokens:', error);
      showErrorModal('Error updating tokens. Please try again later.');
    }
  };

  return (
    <Box
      sx={{
        width: isMobile ? '100%' : '60%',
        maxWidth: '600px',  // Limits the maximum width for smaller viewports
        margin: '0 auto',
        padding: isMobile ? '1rem' : '2rem',
        backgroundColor: '#F0E5D8',
        borderRadius: '8px',
        boxSizing: 'border-box',
      }}
    >
      {/* Search User Section */}
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchUsername}
        onChange={(e) => setSearchUsername(e.target.value)}
        InputLabelProps={{ style: { color: '#4A4A48' } }}  // Deep Charcoal for label
        InputProps={{ style: { backgroundColor: '#fff', color: '#4A4A48' } }}  // Input text color and background
        sx={{ mb: 2 }}
      />
      <TextField
        label="First Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchFirstName}
        onChange={(e) => setSearchFirstName(e.target.value)}
        InputLabelProps={{ style: { color: '#4A4A48' } }}
        InputProps={{ style: { backgroundColor: '#fff', color: '#4A4A48' } }}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Last Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchLastName}
        onChange={(e) => setSearchLastName(e.target.value)}
        InputLabelProps={{ style: { color: '#4A4A48' } }}
        InputProps={{ style: { backgroundColor: '#fff', color: '#4A4A48' } }}
        sx={{ mb: 3 }}
      />
      <Button
        variant="contained"
        fullWidth
        sx={{
          backgroundColor: '#8B5E3C',  // Earthy Brown
          color: '#F0E5D8',  // Warm Cream
          '&:hover': {
            backgroundColor: '#C2A773',  // Muted Gold on hover
          },
          mb: 3
        }}
        onClick={searchUser}
      >
        Search User
      </Button>

      {searchResult && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#4A4A48' }}>
            User Details
          </Typography>
          <Typography variant="body1" sx={{ color: '#4A4A48' }}>
            <strong>Name:</strong> {selectedUser.first_name} {selectedUser.last_name}
          </Typography>
          <Typography variant="body1" sx={{ color: '#4A4A48' }}>
            <strong>Email:</strong> {selectedUser.email}
          </Typography>
          <Typography variant="body1" sx={{ color: '#4A4A48' }}>
            <strong>Phone Number:</strong>{' '}
            {selectedUser.phone_number
              ? selectedUser.phone_number.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
              : 'N/A'}
          </Typography>
          <TextField
            label="Token Count"
            variant="outlined"
            fullWidth
            margin="normal"
            type="number"
            value={selectedUserTokens}
            onChange={(e) => setSelectedUserTokens(e.target.value)}
            InputLabelProps={{ style: { color: '#4A4A48' } }}
            InputProps={{ style: { backgroundColor: '#fff', color: '#4A4A48' } }}
            sx={{ mb: 3 }}
          />
          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: '#8B5E3C',  // Earthy Brown
              color: '#F0E5D8',  // Warm Cream
              '&:hover': {
                backgroundColor: '#C2A773',  // Muted Gold on hover
              }
            }}
            onClick={handleTokenUpdate}
          >
            Update Tokens
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default UserSearch;
