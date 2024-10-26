import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Box,
  Tooltip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
} from "@mui/material";
import { Save, Delete, Flag, Edit, ExpandMore } from "@mui/icons-material";
import TempleBuddhistIcon from "@mui/icons-material/TempleBuddhist";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import axios from "axios";
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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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

  const { user, logout } = useContext(AuthContext);

  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [username, setUsername] = useState(user?.username || "");
  const [phoneNumber, setPhoneNumber] = useState(
    user?.profile?.phone_number || ""
  );
  const [tokens] = useState(user?.profile?.tokens || 0);
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
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token"); // Include authentication if necessary
        const response = await axios.get(
          `http://localhost:8000/api/appointments/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Filter appointments based on status
        const filteredAppointments = response.data.filter((appointment) =>
          ["Pending", "Confirmed", "Flagged"].includes(
            appointment.status_display
          )
        );

        // Sort appointments by date in ascending order (earliest first)
        const sortedAppointments = filteredAppointments.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        setAppointments(sortedAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, [user, navigate]);

  const handleUpdate = async () => {
    try {
      const updatedFields = {};

      if (firstName !== user.first_name) updatedFields.first_name = firstName;
      if (lastName !== user.last_name) updatedFields.last_name = lastName;
      if (email !== user.email) updatedFields.email = email;
      if (username !== user.username) updatedFields.username = username;
      if (phoneNumber !== user.profile.phone_number) {
        updatedFields.profile = { phone_number: phoneNumber };
      }

      await axios.put(
        `http://localhost:8000/api/users/update/`,
        updatedFields
      );

      // Show success modal
      setModalTitle("Success");
      setModalMessage("Profile updated successfully.");
      setModalIsOpen(true);
      setIsEditing(false);
    } catch (error) {
      // Show error modal
      setModalTitle("Error");
      setModalMessage("Error updating profile. Please try again.");
      setModalIsOpen(true);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await axios.post(`http://localhost:8000/api/users/password-reset/`, {
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
      await axios.post(
        `http://localhost:8000/api/appointments/${selectedAppointmentId}/flag/`,
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
            ? { ...appointment, status: "flagged" }
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
      await axios.post(
        `http://localhost:8000/api/users/account-deletion-request/`,
        { password },
        { withCredentials: true }
      );
      setDeleteModalStep(3); // Move to next step on success
    } catch (error) {
      setModalTitle("Error");
      setModalMessage("Error initiating account deletion.");
      setModalIsOpen(true);
    } finally {
      setLoading(false); // Stop loading spinner after request
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: "#333333" }}
      >
        Your Profile
      </Typography>
  
{/* Username and Tokens Section */}
<Card
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center", // Ensure both items are aligned vertically in the center
    backgroundColor: "#F0E5D8",
    borderRadius: "8px",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
    mb: 4,
    p: 2,
  }}
>
  {/* Username Section */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center", // Center align the username vertically
    }}
  >
    <Typography variant="h5" sx={{ color: "#333333" }}>
      {username}
    </Typography>
  </Box>

  {/* Tokens Section */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center", // Center align the tokens and icon vertically
    }}
  >
    <Typography variant="h5" mr={1} sx={{ color: "#333333" }}>
      Tokens: {tokens}
    </Typography>
    <TempleBuddhistIcon fontSize="large" sx={{ color: "#8B5E3C" }} />
  </Box>
</Card>

  
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 2, mb: 3 }}>
  <Tabs
    value={tabIndex}
    onChange={handleTabChange}
    aria-label="profile tabs"
    sx={{
      ".MuiTabs-indicator": {
        backgroundColor: "#8B5E3C", // Earthy brown for the indicator
      },
    }}
  >
    <Tab
      label="Account Details"
      sx={{
        color: tabIndex === 0 ? "#8B5E3C" : "#4A4A48", // Earthy brown for selected, gray for unselected
        "&.Mui-selected": {
          color: "#8B5E3C", // Earthy brown for selected tab
        },
      }}
    />
    <Tab
      label="Appointments"
      sx={{
        color: tabIndex === 1 ? "#8B5E3C" : "#4A4A48", // Adjust text color based on selected index
        "&.Mui-selected": {
          color: "#8B5E3C", // Earthy brown for selected tab
        },
      }}
    />
    <Tab
      label="Settings"
      sx={{
        color: tabIndex === 2 ? "#8B5E3C" : "#4A4A48", // Same color logic
        "&.Mui-selected": {
          color: "#8B5E3C",
        },
      }}
    />
  </Tabs>
</Box>

  
      {/* Account Details Tab */}
      <TabPanel value={tabIndex} index={0}>
        <Card
          sx={{
            position: "relative",
            backgroundColor: "#FAF8F6",
            borderRadius: "8px",
            boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
            mt: 2,
          }}
        >
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" sx={{ color: "#333333" }}>
                Account Details
              </Typography>
              <IconButton
                aria-label="edit account details"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit sx={{ color: "#8B5E3C" }} />
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
                    sx={{
                      backgroundColor: "#8B5E3C",
                      color: "#F0E5D8",
                      "&:hover": {
                        backgroundColor: "#704A35",
                      },
                    }}
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
          <Accordion
            sx={{
              backgroundColor: "#F0E5D8",
              borderRadius: "8px",
              mt: 2,
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore sx={{ color: "#8B5E3C" }} />}
              aria-controls="appointments-content"
              id="appointments-header"
            >
              <Typography variant="h6" sx={{ color: "#333333" }}>
                Your Appointments
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {appointments.map((appointment) => (
                  <Grid item xs={12} key={appointment.id}>
                    <Card
                      sx={{
                        backgroundColor: "#FAF8F6",
                        borderRadius: "8px",
                        mb: 2,
                        boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <CardContent>
                        <Typography variant="body1" sx={{ color: "#333333" }}>
                          {new Date(appointment.date).toLocaleDateString()} -{" "}
                          {appointment.day_type_display}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#666666" }}>
                          Status: {appointment.status_display}
                        </Typography>
                        <Box display="flex" justifyContent="flex-end">
                          {appointment.status === "flagged" ? (
                            <Button
                              variant="outlined"
                              sx={{
                                borderColor: "#8B5E3C",
                                color: "#8B5E3C",
                                "&:hover": {
                                  backgroundColor: "#F0E5D8",
                                },
                              }}
                              onClick={() => openReasonModal(appointment.reason)}
                            >
                              View Reason
                            </Button>
                          ) : (
                            <Tooltip title="Flag this appointment">
                              <IconButton
                                onClick={() =>
                                  handleOpenFlagModal(appointment.id)
                                }
                              >
                                <Flag sx={{ color: "#8B5E3C" }} />
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
          <Card
            sx={{
              backgroundColor: "#F0E5D8",
              borderRadius: "8px",
              mt: 2,
              boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ color: "#333333", mb: 2 }}>
                Your Appointments
              </Typography>
              <Grid container spacing={2}>
                {appointments.map((appointment) => (
                  <Grid item xs={12} key={appointment.id}>
                    <Card
                      sx={{
                        backgroundColor: "#FAF8F6",
                        borderRadius: "8px",
                        mb: 2,
                        boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <CardContent>
                        <Typography variant="body1" sx={{ color: "#333333" }}>
                          {new Date(appointment.date).toLocaleDateString()} -{" "}
                          {appointment.day_type_display}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#666666" }}>
                          Status: {appointment.status_display}
                        </Typography>
                        <Box display="flex" justifyContent="flex-end">
                          {appointment.status === "flagged" ? (
                            <Button
                              variant="outlined"
                              sx={{
                                borderColor: "#8B5E3C",
                                color: "#8B5E3C",
                                "&:hover": {
                                  backgroundColor: "#F0E5D8",
                                },
                              }}
                              onClick={() => openReasonModal(appointment.reason)}
                            >
                              View Reason
                            </Button>
                          ) : (
                            <Tooltip title="Flag this appointment">
                              <IconButton
                                onClick={() =>
                                  handleOpenFlagModal(appointment.id)
                                }
                              >
                                <Flag sx={{ color: "#8B5E3C" }} />
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
  <Card
    sx={{
      backgroundColor: "#FAF8F6",
      borderRadius: "8px",
      mt: 2,
      boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
      padding: 3, // Add padding for better spacing
    }}
  >
    <CardContent>
      <Typography variant="h5" sx={{ color: "#333333", mb: 3 }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Password Section */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              backgroundColor: "#FFF",
              padding: 2,
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h6" sx={{ color: "#333333", mb: 1 }}>
              Account Security
            </Typography>
            <Typography variant="body2" sx={{ color: "#666666", mb: 2 }}>
              Update your password regularly to keep your account secure.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={handlePasswordReset}
              sx={{
                backgroundColor: "#8B5E3C",
                color: "#FFF",
                "&:hover": {
                  backgroundColor: "#704A35",
                },
              }}
            >
              Change Password
            </Button>
          </Card>
        </Grid>

        {/* Delete Account Section */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              backgroundColor: "#FFF",
              padding: 2,
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h6" sx={{ color: "#333333", mb: 1 }}>
              Account Management
            </Typography>
            <Typography variant="body2" sx={{ color: "#666666", mb: 2 }}>
              Permanently delete your account if you no longer wish to use the service.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Delete />}
              onClick={handleOpenDeleteModal}
              sx={{
                backgroundColor: "#8B5E3C",
                color: "#FFF",
                "&:hover": {
                  backgroundColor: "#704A35",
                },
              }}
            >
              Delete Account
            </Button>
          </Card>
        </Grid>

        {/* Logout Section */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              backgroundColor: "#FFF",
              padding: 2,
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h6" sx={{ color: "#333333", mb: 1 }}>
              Logout
            </Typography>
            <Typography variant="body2" sx={{ color: "#666666", mb: 2 }}>
              You can logout of your account and sign in again later.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={logout}
              sx={{
                backgroundColor: "#8B5E3C",
                color: "#FFF",
                "&:hover": {
                  backgroundColor: "#704A35",
                },
              }}
            >
              Logout
            </Button>
          </Card>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
</TabPanel>

  
      {/* Feedback Modal */}
      <CustomModal
        open={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        title={modalTitle}
        description={modalMessage}
        isConfirmVisible={false}
        confirmButtonText="Close"
      />
  
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
  
      {/* Reason Modal */}
      <CustomModal
        open={reasonModalIsOpen}
        onClose={handleCloseReasonModal}
        title="Flagged Appointment Reason"
        description={reasonModalContent}
        isConfirmVisible={false} // No confirm button needed
      />
  
      {/* Account Deletion Modal */}
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
      isConfirmVisible={deleteModalStep !== 3} // Hide Confirm button on step 3
      confirmButtonText={loading ? <CircularProgress size={20} /> : "Submit"} // Show spinner while loading
      confirmButtonDisabled={loading} // Disable button while loading
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
