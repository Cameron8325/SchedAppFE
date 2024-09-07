import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";
import authService from "../services/authService";

function ProfilePage() {
  const [user, setUser] = useState({});
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [tokens, setTokens] = useState(0);

  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [flagReason, setFlagReason] = useState("");
  const [modalStep, setModalStep] = useState(1); // Track the steps of the modal

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setEmail(currentUser.email);
      setUsername(currentUser.username);
      setTokens(currentUser.profile.tokens || 0); // Access tokens from profile
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

        // Sort appointments by date in ascending order
        const sortedAppointments = response.data.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        setAppointments(sortedAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  // Open the flag modal with the first step (confirmation)
  const handleOpenFlagModal = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setIsFlagModalOpen(true);
    setModalStep(1); // Set the modal step to 1 (confirmation step)
  };

  const handleCloseFlagModal = () => {
    setIsFlagModalOpen(false);
    setSelectedAppointmentId(null);
    setFlagReason("");
    setModalStep(1); // Reset the modal to the first step
  };

  // Move to the next step of the modal (reason input)
  const handleModalConfirm = () => {
    if (modalStep === 1) {
      setModalStep(2); // Move to step 2 to ask for reason
    } else if (modalStep === 2 && flagReason.trim()) {
      handleSubmitFlag(); // Submit flag if on the second step
    } else {
      setMessage("Please provide a reason for flagging.");
    }
  };

  // Submit the flag reason to the backend
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
      setMessage(""); // Clear any existing error messages

      // Update the local state to reflect the flagged appointment
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === selectedAppointmentId
            ? { ...appointment, status: "flagged", status_display: "Flagged" }
            : appointment
        )
      );

      // Proceed to the success step
      setModalStep(3);
    } catch (error) {
      console.error("Error flagging appointment:", error);
      setMessage("Error flagging appointment");
    }
  };

  const handleUpdate = () => {
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
        setMessage("Profile updated successfully");
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
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          fullWidth
        >
          Update Profile
        </Button>
      </form>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleDelete}
        fullWidth
      >
        Delete Account
      </Button>
      {message && <Typography color="error">{message}</Typography>}

      {/* Tokens Section */}
      <Typography variant="h5" component="h2" gutterBottom>
        Tokens: {tokens}
      </Typography>

      {/* Appointments Section */}
      <Typography variant="h5" component="h2" gutterBottom>
        Your Appointments
      </Typography>
      <Table style={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: "20%" }}>Date</TableCell>
            <TableCell style={{ width: "30%" }}>Day Type</TableCell>
            <TableCell style={{ width: "30%" }}>Status</TableCell>
            <TableCell style={{ width: "20%" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments
            .filter((appointment) => appointment.status !== "to_completion")
            .map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  {new Date(appointment.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{appointment.day_type_display}</TableCell>
                <TableCell>{appointment.status_display}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleOpenFlagModal(appointment.id)}
                    disabled={appointment.status === "flagged"}
                  >
                    Flag
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {/* Flag Modal */}
      <Dialog open={isFlagModalOpen} onClose={handleCloseFlagModal}>
        <DialogTitle>
          {modalStep === 1 ? "Confirm Flagging" : modalStep === 2 ? "Provide Reason for Flagging" : "Appointment Flagged"}
        </DialogTitle>
        <DialogContent>
          {modalStep === 1 ? (
            <Typography>Are you sure you want to flag this appointment?</Typography>
          ) : modalStep === 2 ? (
            <TextField
              label="Reason for Flagging"
              fullWidth
              multiline
              rows={4}
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
            />
          ) : (
            <Typography>Your appointment has been successfully flagged.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFlagModal} color="primary">
            {modalStep === 3 ? "Close" : "Cancel"}
          </Button>
          {modalStep === 1 && (
            <Button onClick={handleModalConfirm} color="secondary">
              Confirm
            </Button>
          )}
          {modalStep === 2 && (
            <Button onClick={handleModalConfirm} color="secondary">
              Submit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ProfilePage;
