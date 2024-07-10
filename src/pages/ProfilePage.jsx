import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import authService from '../services/authService';

function ProfilePage() {
    const [user, setUser] = useState({});
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            setEmail(currentUser.email);
            setUsername(currentUser.username);
        }
    }, []);

    const handleUpdate = () => {
        const updatedUser = { email, username, password };
        fetch(`http://localhost:8000/api/users/${user.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser),
        }).then(response => response.json())
          .then(data => {
              setUser(data);
              setMessage('Profile updated successfully');
          });
    };

    const handleDelete = () => {
        fetch(`http://localhost:8000/api/users/${user.id}/`, {
            method: 'DELETE',
        }).then(() => {
            authService.logout();
            window.location.href = '/register';
        });
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" component="h1" gutterBottom>
                Your Profile
            </Typography>
            <form>
                <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                />
                <Button variant="contained" color="primary" onClick={handleUpdate} fullWidth>
                    Update Profile
                </Button>
            </form>
            <Button variant="contained" color="secondary" onClick={handleDelete} fullWidth>
                Delete Account
            </Button>
            {message && <Typography color="error">{message}</Typography>}
        </Container>
    );
}

export default ProfilePage;
