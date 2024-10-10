import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
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

      setSnackbarMessage("Your account has been deleted successfully.");
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
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        Confirm Account Deletion
      </Typography>
      <Typography variant="body1" paragraph>
        Click the button below to permanently delete your account.
      </Typography>
      <Button
        variant="contained"
        color="secondary"
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
    </Container>
  );
}

export default AccountDeletionConfirm;
