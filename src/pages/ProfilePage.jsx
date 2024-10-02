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
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Save, Delete, Flag, Edit, ExpandMore } from "@mui/icons-material";
import TempleBuddhistIcon from "@mui/icons-material/TempleBuddhist";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import axios from "axios";
import CustomModal from "../components/modal/CustomModal";
import authService from "../services/authService";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function ProfilePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [tabIndex, setTabIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const [user, setUser] = useState({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [tokens, setTokens] = useState(0);
  const [appointments, setAppointments] = useState([]);

  const [modalStep, setModalStep] = useState(1);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFirstName(currentUser.first_name || "");
      setLastName(currentUser.last_name || "");
      setEmail(currentUser.email);
      setUsername(currentUser.username);
      setPhoneNumber(currentUser.profile.phone_number || "");
      setTokens(currentUser.profile.tokens || 0);
    }

    const fetchAppointments = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `http://localhost:8000/api/appointments/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const filteredAppointments = response.data.filter((appointment) =>
          ["pending", "confirmed", "flagged"].includes(appointment.status)
        );

        setAppointments(filteredAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const updatedFields = {};

      if (firstName !== user.first_name) updatedFields.first_name = firstName;
      if (lastName !== user.last_name) updatedFields.last_name = lastName;
      if (email !== user.email) updatedFields.email = email;
      if (username !== user.username) updatedFields.username = username;
      if (phoneNumber !== user.profile.phone_number) {
        updatedFields.profile = { phone_number: phoneNumber };
      }

      await axios.put(
        `http://localhost:8000/api/users/${user.id}/`,
        updatedFields,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update user state with only updated fields
      setUser((prevUser) => ({ ...prevUser, ...updatedFields }));
      setSnackbarMessage("Profile updated successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setIsEditing(false);
    } catch (error) {
      setSnackbarMessage("Error updating profile");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8000/api/users/password-reset/`,
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSnackbarMessage("Password reset link sent to your email");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Error sending password reset email");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
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
    }
  };

  const handleSubmitFlag = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:8000/api/appointments/${selectedAppointmentId}/flag/`,
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
      handleCloseFlagModal();
      // Update the appointment status locally
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === selectedAppointmentId
            ? { ...appointment, status: "flagged" }
            : appointment
        )
      );
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
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" mr={1}>
            Tokens: {tokens}
          </Typography>
          <TempleBuddhistIcon fontSize="large" />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="profile tabs">
          <Tab label="Account Details" />
          <Tab label="Appointments" />
          <Tab label="Settings" />
        </Tabs>
      </Box>

      {/* Account Details Tab */}
      <TabPanel value={tabIndex} index={0}>
        <Card sx={{ position: "relative" }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Account Details</Typography>
              <IconButton
                aria-label="edit account details"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit />
              </IconButton>
            </Box>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  variant="outlined"
                  fullWidth
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  InputProps={{ readOnly: !isEditing }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  variant="outlined"
                  fullWidth
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  InputProps={{ readOnly: !isEditing }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  InputProps={{ readOnly: !isEditing }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{ readOnly: !isEditing }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Phone Number"
                  variant="outlined"
                  fullWidth
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  InputProps={{ readOnly: !isEditing }}
                />
              </Grid>
              {isEditing && (
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Save />}
                    onClick={handleUpdate}
                  >
                    Save
                  </Button>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Appointments Tab */}
      <TabPanel value={tabIndex} index={1}>
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
                                onClick={() => handleOpenFlagModal(appointment.id)}
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
                                onClick={() => handleOpenFlagModal(appointment.id)}
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
      </TabPanel>

      {/* Settings Tab */}
      <TabPanel value={tabIndex} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6">Settings</Typography>
            <Box display="flex" flexDirection="column" alignItems="flex-start">
              <Button
                variant="contained"
                color="primary"
                onClick={handlePasswordReset}
                sx={{ mb: 2 }}
              >
                Change Password
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Delete />}
                // onClick={handleDelete}
              >
                Delete Account
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

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
            : "Success"
        }
        description={
          modalStep === 1
            ? "Are you sure you want to flag this appointment?"
            : modalStep === 2
            ? "Please provide a reason for flagging this appointment, along with your contact information and preferences."
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
