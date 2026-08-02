import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import api from '../../api/client';
import { useTheme } from '@mui/material/styles';

const formatPhone = (phone) =>
  phone ? phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : 'N/A';

const UserSearch = ({ showErrorModal }) => {
  const [searchUsername, setSearchUsername] = useState('');
  const [searchFirstName, setSearchFirstName] = useState('');
  const [searchLastName, setSearchLastName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserTokens, setSelectedUserTokens] = useState(0);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const searchUser = async () => {
    if (!searchUsername && !searchFirstName && !searchLastName) {
      showErrorModal('Enter a username, first name, or last name to search.');
      return;
    }

    setSearching(true);
    setSelectedUser(null);
    try {
      const params = new URLSearchParams();
      if (searchUsername) params.append('username', searchUsername);
      if (searchFirstName) params.append('first_name', searchFirstName);
      if (searchLastName) params.append('last_name', searchLastName);

      const response = await api.get(`/api/admin-panel/search/?${params.toString()}`);
      const users = response.data.map((user) => ({
        ...user,
        phone_number: user.profile?.phone_number || '',
        tokens: user.profile?.tokens ?? 0,
      }));
      setSearchResults(users);
      if (users.length === 1) {
        selectUser(users[0]);
      }
    } catch (error) {
      setSearchResults([]);
      if (error.response?.status === 404) {
        // No matches — the empty state below explains it.
      } else {
        console.error('Error searching for user:', error);
        showErrorModal('Error searching for user.');
      }
    } finally {
      setSearching(false);
      setHasSearched(true);
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setSelectedUserTokens(user.tokens);
  };

  const handleTokenUpdate = async () => {
    const tokens = parseInt(selectedUserTokens, 10);
    if (Number.isNaN(tokens) || tokens < 0) {
      showErrorModal('Invalid token count. Please enter a non-negative number.');
      return;
    }

    try {
      const response = await api.post(
        `/api/admin-panel/update-tokens/${selectedUser.id}/`,
        { tokens }
      );

      if (response.status === 200) {
        showErrorModal(
          `Tokens for ${selectedUser.username} set to ${tokens}.`,
          'Success'
        );
        setSearchResults((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, tokens } : u))
        );
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
        maxWidth: '600px',
        margin: '0 auto',
        padding: isMobile ? '1rem' : '2rem',
        backgroundColor: '#F0E5D8',
        borderRadius: '8px',
        boxSizing: 'border-box',
      }}
    >
      <Typography variant="h6" component="h3" sx={{ color: '#4A4A48', mb: 1 }}>
        Find a User
      </Typography>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchUsername}
        onChange={(e) => setSearchUsername(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && searchUser()}
        InputLabelProps={{ style: { color: '#4A4A48' } }}
        InputProps={{ style: { backgroundColor: '#fff', color: '#4A4A48' } }}
        sx={{ mb: 2 }}
      />
      <TextField
        label="First Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchFirstName}
        onChange={(e) => setSearchFirstName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && searchUser()}
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
        onKeyDown={(e) => e.key === 'Enter' && searchUser()}
        InputLabelProps={{ style: { color: '#4A4A48' } }}
        InputProps={{ style: { backgroundColor: '#fff', color: '#4A4A48' } }}
        sx={{ mb: 3 }}
      />
      <Button
        variant="contained"
        fullWidth
        disabled={searching}
        sx={{
          backgroundColor: '#8B5E3C',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#704A35',
          },
          mb: 3,
        }}
        onClick={searchUser}
      >
        {searching ? <CircularProgress size={22} color="inherit" /> : 'Search User'}
      </Button>

      {hasSearched && !searching && searchResults.length === 0 && (
        <Typography variant="body1" sx={{ color: '#4A4A48', textAlign: 'center' }}>
          No users matched your search.
        </Typography>
      )}

      {searchResults.length > 1 && (
        <>
          <Typography variant="subtitle1" sx={{ color: '#4A4A48' }}>
            {searchResults.length} matches — select a user:
          </Typography>
          <List dense sx={{ backgroundColor: '#FAF8F6', borderRadius: 1, mb: 2 }}>
            {searchResults.map((user) => (
              <ListItemButton
                key={user.id}
                selected={selectedUser?.id === user.id}
                onClick={() => selectUser(user)}
              >
                <ListItemText
                  primary={`${user.first_name} ${user.last_name} (${user.username})`}
                  secondary={user.email}
                />
              </ListItemButton>
            ))}
          </List>
        </>
      )}

      {selectedUser && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#4A4A48' }}>
            User Details
          </Typography>
          <Typography variant="body1" sx={{ color: '#4A4A48' }}>
            <strong>Name:</strong> {selectedUser.first_name} {selectedUser.last_name}
          </Typography>
          <Typography variant="body1" sx={{ color: '#4A4A48' }}>
            <strong>Username:</strong> {selectedUser.username}
          </Typography>
          <Typography variant="body1" sx={{ color: '#4A4A48' }}>
            <strong>Email:</strong> {selectedUser.email}
          </Typography>
          <Typography variant="body1" sx={{ color: '#4A4A48' }}>
            <strong>Phone Number:</strong> {formatPhone(selectedUser.phone_number)}
          </Typography>
          <TextField
            label="Token Count"
            variant="outlined"
            fullWidth
            margin="normal"
            type="number"
            inputProps={{ min: 0 }}
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
              backgroundColor: '#8B5E3C',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#704A35',
              },
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
