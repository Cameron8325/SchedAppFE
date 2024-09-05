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

  const flagAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8000/api/appointments/${appointmentId}/flag/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Your appointment has successfully been flagged.");

      // Update the local state to reflect the flagged appointment
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: "flagged", status_display: "Flagged" } // Update the status of the flagged appointment
            : appointment
        )
      );
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
            .filter((appointments) => appointments.status !== "to_completion")
            .map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  {new Date(appointment.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{appointment.day_type_display}</TableCell>
                <TableCell>{appointment.status_display}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => flagAppointment(appointment.id)}
                    disabled={appointment.status === "flagged"}
                  >
                    Flag
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Container>
  );
}

export default ProfilePage;
