import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  Box,
  Tooltip,
  Avatar,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
} from "@mui/material";
import { Save, Delete, Flag, ExpandMore } from "@mui/icons-material";
import TempleBuddhistIcon from "@mui/icons-material/TempleBuddhist";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import CustomModal from "../components/modal/CustomModal";
import authService from "../services/authService";

function ProfilePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [user, setUser] = useState({});
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [tokens, setTokens] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [flagReason, setFlagReason] = useState("");
  const [modalStep, setModalStep] = useState(1);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setEmail(currentUser.email);
      setUsername(currentUser.username);
      setTokens(currentUser.profile.tokens || 0);
    }
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8000/api/users/appointments/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const filteredAppointments = response.data.filter((appointment) =>
          ["pending", "confirmed", "flagged"].includes(appointment.status)
        );
        const sortedAppointments = filteredAppointments.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setAppointments(sortedAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, []);

  const handleUpdate = () => {
    if (password !== confirmPassword) {
      setSnackbarMessage("Passwords do not match");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const updatedUser = { email, username, password };
    fetch(`http://localhost:8000/api/users/${user.id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    })
      .then((response) => response.json())
      .then((data) => {
        setUser(data);
        setSnackbarMessage("Profile updated successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      });
  };

  const handleDelete = () => {
    fetch(`http://localhost:8000/api/users/${user.id}/`, {
      method: "DELETE",
    }).then(() => {
      authService.logout();
      window.location.href = "/register";
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleOpenFlagModal = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setIsFlagModalOpen(true);
    setModalStep(1);
  };

  const handleCloseFlagModal = () => {
    setIsFlagModalOpen(false);
    setSelectedAppointmentId(null);
    setFlagReason("");
    setModalStep(1);
  };

  const handleModalConfirm = () => {
    if (modalStep === 1) {
      setModalStep(2);
    } else if (modalStep === 2 && flagReason.trim()) {
      handleSubmitFlag();
    } else {
      setSnackbarMessage("Please provide a reason for flagging.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSubmitFlag = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8000/api/appointments/${selectedAppointmentId}/flagged/`,
        { reason: flagReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackbarMessage("Appointment flagged successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === selectedAppointmentId
            ? { ...appointment, status: "flagged", status_display: "Flagged" }
            : appointment
        )
      );
      setModalStep(3);
    } catch (error) {
      setSnackbarMessage("Error flagging appointment");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Your Profile
      </Typography>

      {/* Avatar and Username Section */}
      <Card
        style={{ display: "flex", justifyContent: "space-between" }}
        sx={{ marginBottom: 4 }}
      >
        <CardContent>
          <Avatar
            alt={username}
            src="/path-to-avatar-image.jpg"
            sx={{ width: 100, height: 100 }}
          />
          <Typography variant="h5">{username}</Typography>
        </CardContent>

        <CardContent
          style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}
        >
          <Typography variant="h4" mr={1}>
            Tokens: {tokens}
          </Typography>
            <TempleBuddhistIcon
              fontSize="large"
            />
        </CardContent>
      </Card>

      {/* Account Details Section */}
      {isMobile ? (
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="account-details-content"
            id="account-details-header"
          >
            <Typography variant="h6">Account Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Password"
                  variant="outlined"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Confirm Password"
                  variant="outlined"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  onClick={handleUpdate}
                >
                  Update Profile
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Delete />}
                  onClick={handleDelete}
                >
                  Delete Account
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ) : (
        <Card sx={{ marginBottom: 4 }}>
          <CardContent>
            <Typography variant="h6">Account Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Password"
                  variant="outlined"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Confirm Password"
                  variant="outlined"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  onClick={handleUpdate}
                >
                  Update Profile
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Delete />}
                  onClick={handleDelete}
                >
                  Delete Account
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tokens Section */}
      <Card sx={{ marginBottom: 4 }}>
        <CardContent>
          <Typography variant="h6">
            Tokens: {tokens}{" "}
            <TempleBuddhistIcon
              fontSize="large"
              sx={{ verticalAlign: "middle" }}
            />
          </Typography>
        </CardContent>
      </Card>

      {/* Appointments Section */}
      {isMobile ? (
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="appointments-content"
            id="appointments-header"
          >
            <Typography variant="h6">Your Appointments</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {appointments.map((appointment) => (
                <Grid item xs={12} key={appointment.id}>
                  <Card sx={{ marginBottom: 4, paddingBottom: 2 }}>
                    <CardContent>
                      <Typography variant="body1">
                        {new Date(appointment.date).toLocaleDateString()} -{" "}
                        {appointment.day_type_display}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: {appointment.status_display}
                      </Typography>
                      <Box display="flex" justifyContent="flex-end">
                        {appointment.status !== "flagged" && (
                          <Tooltip title="Flag this appointment">
                            <IconButton
                              onClick={() =>
                                handleOpenFlagModal(appointment.id)
                              }
                            >
                              <Flag />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ) : (
        <Card sx={{ marginBottom: 4 }}>
          <CardContent>
            <Typography variant="h6">Your Appointments</Typography>
            <Grid container spacing={2}>
              {appointments.map((appointment) => (
                <Grid item xs={12} key={appointment.id}>
                  <Card sx={{ marginBottom: 4, paddingBottom: 2 }}>
                    <CardContent>
                      <Typography variant="body1">
                        {new Date(appointment.date).toLocaleDateString()} -{" "}
                        {appointment.day_type_display}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: {appointment.status_display}
                      </Typography>
                      <Box display="flex" justifyContent="flex-end">
                        {appointment.status !== "flagged" && (
                          <Tooltip title="Flag this appointment">
                            <IconButton
                              onClick={() =>
                                handleOpenFlagModal(appointment.id)
                              }
                            >
                              <Flag />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Flag Modal */}
      <CustomModal
        open={isFlagModalOpen}
        onClose={handleCloseFlagModal}
        title={
          modalStep === 1
            ? "Confirm Flagging"
            : modalStep === 2
            ? "Provide Reason"
            : "Flagged"
        }
        description={
          modalStep === 1
            ? "Are you sure you want to flag this appointment?"
            : modalStep === 2
            ? "Please provide a reason for flagging this appointment."
            : "Your appointment has been flagged successfully."
        }
        isConfirmVisible={modalStep !== 3}
        confirmButtonText={
          modalStep === 1 ? "Confirm" : modalStep === 2 ? "Submit" : "Close"
        }
        onConfirm={handleModalConfirm}
        showTextInput={modalStep === 2}
        inputValue={flagReason}
        handleInputChange={(e) => setFlagReason(e.target.value)}
      />
    </Container>
  );
}

export default ProfilePage;
