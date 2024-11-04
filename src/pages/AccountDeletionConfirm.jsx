import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function AccountDeletionConfirm() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleAccountDeletion = async () => {
    setIsDeleting(true);
    try {
      await axios.post(
        `http://localhost:8000/api/users/account-deletion-confirm/${uidb64}/${token}/`
      );

      setSnackbarMessage("Your account has been deleted successfully. You will be automatically redirected.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      setSnackbarMessage(
        error.response?.data?.error || "Error deleting account."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
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
          Confirm Account Deletion
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: '#4A4A48' }}>
          Click the button below to permanently delete your account.
        </Typography>
        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#8B5E3C',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#C2A773',
            },
            mt: 2,
          }}
          onClick={handleAccountDeletion}
          disabled={isDeleting}
        >
          {isDeleting ? <CircularProgress size={24} /> : "Delete My Account"}
        </Button>

        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default AccountDeletionConfirm;
