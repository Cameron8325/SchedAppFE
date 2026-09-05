import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  Grid,
  IconButton,
  Box,
  Tooltip,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from "@mui/material";
import { Delete, Flag, Edit, Visibility } from "@mui/icons-material";
import TempleBuddhistIcon from "@mui/icons-material/TempleBuddhist";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import moment from "moment";
import api from "../api/client";
import CustomModal from "../components/modal/CustomModal";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
      {value === index && <Box sx={{ px: { xs: 0, sm: 3 }, py: { xs: 2, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

function ProfilePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [tabIndex, setTabIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const { user, logout, refreshUser } = useContext(AuthContext);

  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [username, setUsername] = useState(user?.username || "");
  const [phoneNumber, setPhoneNumber] = useState(
    user?.profile?.phone_number || ""
  );
  const tokens = user?.profile?.tokens || 0;
  const [appointments, setAppointments] = useState([]);

  const [modalStep, setModalStep] = useState(1);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // State variables for the reason modal
  const [reasonModalIsOpen, setReasonModalIsOpen] = useState(false);
  const [reasonModalContent, setReasonModalContent] = useState("");

  // State variables for the account deletion modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteModalStep, setDeleteModalStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [saving, setSaving] = useState(false);

  const restoreSavedDetails = () => {
    setFirstName(user?.first_name || '');
    setLastName(user?.last_name || '');
    setEmail(user?.email || '');
    setUsername(user?.username || '');
    setPhoneNumber(user?.profile?.phone_number || '');
  };

  const toggleEditing = () => {
    restoreSavedDetails();
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchAppointments = async () => {
      setAppointmentsLoading(true);
      setAppointmentsError('');
      try {
        // Authentication rides on the HttpOnly cookies handled by the API client.
        const response = await api.get(`/api/users/appointments/`);

        // Only show appointments that are still upcoming/active
        const filteredAppointments = response.data.filter((appointment) =>
          ["pending", "confirmed", "flagged"].includes(appointment.status) &&
          moment(appointment.date).isSameOrAfter(moment().startOf('day'), 'day')
        );

        // Sort appointments by date in ascending order (earliest first)
        const sortedAppointments = filteredAppointments.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        setAppointments(sortedAppointments);
      } catch (error) {
        setAppointmentsError('We could not load your appointments. Please refresh to try again.');
        console.error("Error fetching appointments:", error);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    fetchAppointments();
  }, [user, navigate]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const updatedFields = {};

      if (firstName !== user.first_name) updatedFields.first_name = firstName;
      if (lastName !== user.last_name) updatedFields.last_name = lastName;
      if (email !== user.email) updatedFields.email = email;
      if (username !== user.username) updatedFields.username = username;
      if (phoneNumber !== user.profile.phone_number) {
        updatedFields.profile = { phone_number: phoneNumber };
      }

      await api.put(`/api/users/update/`, updatedFields);
      await refreshUser(); // keep the rest of the app in sync with the new details

      // Show success modal
      setModalTitle("Success");
      setModalMessage("Profile updated successfully.");
      setModalIsOpen(true);
      setIsEditing(false);
    } catch (error) {
      // Show error modal with the server's explanation when available
      setModalTitle("Error");
      setModalMessage(
        error.response?.data?.error || "Error updating profile. Please try again."
      );
      setModalIsOpen(true);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsPasswordLoading(true);
    try {
      await api.post(`/api/users/password-reset/`, {
        email,
      });

      // Show success modal
      setModalTitle("Success");
      setModalMessage("Password reset link sent to your email.");
      setModalIsOpen(true);
    } catch (error) {
      // Show error modal
      setModalTitle("Error");
      setModalMessage("Error sending password reset email.");
      setModalIsOpen(true);
    } finally {
      setIsPasswordLoading(false);
    }
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
    try {
      await api.post(
        `/api/admin-panel/appointments/${selectedAppointmentId}/flag/`,
        { reason: flagReason }
      );

      // Show success modal
      setModalTitle("Success");
      setModalMessage("Appointment flagged successfully.");
      setModalIsOpen(true);

      handleCloseFlagModal();
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === selectedAppointmentId
            ? { ...appointment, status: "flagged", status_display: "Flagged", reason: flagReason.trim() }
            : appointment
        )
      );
    } catch (error) {
      // Show error modal
      setModalTitle("Error");
      setModalMessage("Error flagging appointment.");
      setModalIsOpen(true);
    }
  };

  // Functions to handle the reason modal
  const openReasonModal = (reason) => {
    setReasonModalContent(reason);
    setReasonModalIsOpen(true);
  };

  const handleCloseReasonModal = () => {
    setReasonModalIsOpen(false);
    setReasonModalContent("");
  };

  // Functions to handle the account deletion modal
  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
    setDeleteModalStep(1);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPassword("");
    setDeleteModalStep(1);
  };

  const handleDeleteModalConfirm = () => {
    if (deleteModalStep === 1) {
      setDeleteModalStep(2);
    } else if (deleteModalStep === 2) {
      handleAccountDeletionRequest();
    } else if (deleteModalStep === 3) {
      handleCloseDeleteModal();
    }
  };

  const handleAccountDeletionRequest = async () => {
    setLoading(true); // Start loading spinner
    try {
      await api.post(`/api/users/account-deletion-request/`, { password });
      setDeleteModalStep(3); // Move to next step on success
    } catch (error) {
      setModalTitle("Error");
      setModalMessage(
        error.response?.data?.error || "Error initiating account deletion."
      );
      setModalIsOpen(true);
    } finally {
      setLoading(false); // Stop loading spinner after request
    }
  };

  return (
    <Container maxWidth="md" className="tea-profile-shell" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
    <Typography
      variant="h4"
      component="h1"
      align="center"
      sx={{ color: "#333333", mb: { xs: 2, sm: 3 }, fontSize: { xs: '2rem', sm: '2.4rem' } }}
    >
      Profile Overview
    </Typography>
  
    <Card
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F9F6F3",
        borderRadius: 2,
        boxShadow: 2,
        p: { xs: 2, sm: 3 },
        mb: 3,
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ color: "#333333" }}>
          {username}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center">
        <Typography variant="h6" mr={1} sx={{ color: "#333333" }}>
          Tokens: {tokens}
        </Typography>
        <TempleBuddhistIcon fontSize="large" sx={{ color: "#8B5E3C" }} />
      </Box>
    </Card>
  
    <Tabs
      value={tabIndex}
      onChange={handleTabChange}
      aria-label="profile tabs"
      centered={!isMobile}
      variant={isMobile ? "fullWidth" : "standard"}
      sx={{
        ".MuiTabs-indicator": {
          backgroundColor: "#8B5E3C",
        },
        mb: 3,
        minHeight: { xs: 44, sm: 48 },
      }}
    >
      <Tab label="Account" sx={{ minWidth: 0, px: { xs: 0.5, sm: 2 }, fontSize: { xs: '0.72rem', sm: '0.875rem' }, color: tabIndex === 0 ? "#8B5E3C" : "#4A4A48" }} />
      <Tab label="Appointments" sx={{ minWidth: 0, px: { xs: 0.5, sm: 2 }, fontSize: { xs: '0.72rem', sm: '0.875rem' }, color: tabIndex === 1 ? "#8B5E3C" : "#4A4A48" }} />
      <Tab label="Settings" sx={{ minWidth: 0, px: { xs: 0.5, sm: 2 }, fontSize: { xs: '0.72rem', sm: '0.875rem' }, color: tabIndex === 2 ? "#8B5E3C" : "#4A4A48" }} />
    </Tabs>
  
    <TabPanel value={tabIndex} index={0}>
      <Card sx={{ backgroundColor: "#FAF8F6", borderRadius: 2, p: { xs: 2, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ color: "#333333" }}>
            Account Details
          </Typography>
          <IconButton
            onClick={toggleEditing}
            aria-label={isEditing ? 'Cancel editing' : 'Edit account details'}
            disabled={saving}
            sx={{ color: "#8B5E3C" }}
          >
            <Edit />
          </IconButton>
        </Box>
        <Grid container spacing={2}>
          {[
            { label: "First Name", value: firstName, setter: setFirstName },
            { label: "Last Name", value: lastName, setter: setLastName },
            { label: "Username", value: username, setter: setUsername },
            { label: "Email", value: email, setter: setEmail },
            { label: "Phone Number", value: phoneNumber, setter: setPhoneNumber },
          ].map((field, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <TextField
                label={field.label}
                variant="outlined"
                fullWidth
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                InputProps={{ readOnly: !isEditing }}
              />
            </Grid>
          ))}
          {isEditing && (
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#8B5E3C",
                  color: "#FFF",
                  "&:hover": {
                    backgroundColor: "#704A35",
                  },
                }}
                onClick={handleUpdate}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </Grid>
          )}
        </Grid>
      </Card>
    </TabPanel>
  
    <TabPanel value={tabIndex} index={1}>
  <Card sx={{ backgroundColor: "#F9F6F3", borderRadius: 2, p: { xs: 2, sm: 3 } }}>
    <Typography variant="h6" sx={{ color: "#333333", mb: 2 }}>
      Upcoming Appointments
    </Typography>
    {appointmentsLoading ? (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    ) : appointmentsError ? (
      <Alert severity="error">{appointmentsError}</Alert>
    ) : appointments.length === 0 ? (
      <Box textAlign="center" py={3}>
        <Typography variant="body1" sx={{ color: "#666666", mb: 2 }}>
          You have no upcoming appointments.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/appointments")}
          sx={{
            backgroundColor: "#8B5E3C",
            color: "#FFF",
            "&:hover": { backgroundColor: "#704A35" },
          }}
        >
          Book an Appointment
        </Button>
      </Box>
    ) : (
    <Grid container spacing={2}>
      {appointments.map((appointment) => (
        <Grid item xs={12} key={appointment.id}>
          <Card
            sx={{
              backgroundColor: "#FFF",
              borderRadius: 2,
              boxShadow: 1,
              p: 2,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 1.5,
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ color: "#333333" }}>
                {moment(appointment.date).format("MM/DD/YYYY")} - {appointment.day_type_display}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666666" }}>
                Status: {appointment.status_display}
              </Typography>
            </Box>
            <Box>
              {appointment.status === "flagged" ? (
                isMobile ? (
                  <Tooltip title="View Reason">
                    <IconButton
                      sx={{ color: "#8B5E3C" }}
                      onClick={() => openReasonModal(appointment.reason)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Button
                    variant="outlined"
                    sx={{ borderColor: "#8B5E3C", color: "#8B5E3C" }}
                    onClick={() => openReasonModal(appointment.reason)}
                  >
                    View Reason
                  </Button>
                )
              ) : (
                <Tooltip title="Flag appointment">
                  <IconButton onClick={() => handleOpenFlagModal(appointment.id)}>
                    <Flag sx={{ color: "#8B5E3C" }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
    )}
  </Card>
</TabPanel>

  
    <TabPanel value={tabIndex} index={2}>
      <Card sx={{ backgroundColor: "#FAF8F6", borderRadius: 2, p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" sx={{ color: "#333333", mb: 2 }}>
          Account Settings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
          <Button
  variant="contained"
  fullWidth
  sx={{
    backgroundColor: "#8B5E3C",
    color: "#FFF",
    "&:hover": { backgroundColor: "#704A35" },
  }}
  onClick={handlePasswordReset}
  disabled={isPasswordLoading} // Disable button while loading
>
  {isPasswordLoading ? <CircularProgress size={20} color="inherit" /> : "Change Password"}
</Button>


          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Delete />}
              sx={{
                backgroundColor: "#8B5E3C",
                color: "#FFF",
                "&:hover": { backgroundColor: "#704A35" },
              }}
              onClick={handleOpenDeleteModal}
            >
              Delete Account
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              fullWidth
              sx={{ color: "#8B5E3C", borderColor: "#8B5E3C" }}
              onClick={logout}
            >
              Logout
            </Button>
          </Grid>
        </Grid>
      </Card>
    </TabPanel>
  
    <CustomModal
      open={modalIsOpen}
      onClose={() => setModalIsOpen(false)}
      title={modalTitle}
      description={modalMessage}
      isConfirmVisible={false}
      confirmButtonText="Close"
    />
  
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
          ? "Please provide a reason for flagging this appointment."
          : "Your appointment has been flagged successfully."
      }
      isConfirmVisible={modalStep !== 3}
      confirmButtonText={modalStep === 1 ? "Confirm" : modalStep === 2 ? "Submit" : "Close"}
      onConfirm={handleModalConfirm}
      confirmButtonDisabled={modalStep === 2 && !flagReason.trim()}
      showTextInput={modalStep === 2}
      inputValue={flagReason}
      handleInputChange={(e) => setFlagReason(e.target.value)}
    />
  
    <CustomModal
      open={reasonModalIsOpen}
      onClose={handleCloseReasonModal}
      title="Flagged Appointment Reason"
      description={reasonModalContent}
      isConfirmVisible={false}
    />
  
    <CustomModal
      open={isDeleteModalOpen}
      onClose={handleCloseDeleteModal}
      onConfirm={handleDeleteModalConfirm}
      title={
        deleteModalStep === 1
          ? "Confirm Account Deletion"
          : deleteModalStep === 2
          ? "Enter Password"
          : "Email Sent"
      }
      isConfirmVisible={deleteModalStep !== 3}
      confirmButtonText={loading ? <CircularProgress size={20} /> : "Submit"}
      confirmButtonDisabled={loading}
    >
      {deleteModalStep === 1 && (
        <Typography sx={{ color: "#333333" }}>
          Are you sure you want to delete your account? This action cannot be undone.
        </Typography>
      )}
      {deleteModalStep === 2 && (
        <>
          <Typography sx={{ color: "#333333", mb: 2 }}>
            Please enter your password to confirm.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </>
      )}
      {deleteModalStep === 3 && (
        <Typography sx={{ color: "#333333" }}>
          An email has been sent that will allow you to permanently delete your account.
        </Typography>
      )}
    </CustomModal>
  </Container>
  
  );
  
  
}

export default ProfilePage;
