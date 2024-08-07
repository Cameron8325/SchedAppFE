import React, { useState, useEffect, useCallback } from "react";
import { Container, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material";
import axios from "axios";
import moment from "moment";
import CustomModal from "../components/modal/CustomModal";

function AdminDashboard() {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [processedRequests, setProcessedRequests] = useState([]);
  const [flaggedRequests, setFlaggedRequests] = useState([]);
  const [toCompletionRequests, setToCompletionRequests] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  
  // Modal state
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [isConfirmVisible, setIsConfirmVisible] = useState(true);
  const [confirmButtonText, setConfirmButtonText] = useState("");
  const [dateList, setDateList] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);

  const fetchAppointments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/api/appointments/", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = response.data;
      if (Array.isArray(data)) {
        setIncomingRequests(data.filter((a) => a.status === "pending"));
        setProcessedRequests(data.filter((a) => a.status === "confirmed" || a.status === "denied"));
        setFlaggedRequests(data.filter((a) => a.status === "flagged"));
        setToCompletionRequests(data.filter((a) => a.status === "to_completion"));
      } else {
        console.error("Unexpected data format:", data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  }, []);

  const fetchAvailableDays = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/api/available-days/", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = response.data;
      const sortedData = data.sort((a, b) => moment(a.date).diff(moment(b.date)));
      const groupedData = groupConsecutiveDates(sortedData);
      setAvailableDays(groupedData);
    } catch (error) {
      console.error("Error fetching available days:", error);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchAvailableDays();
  }, [fetchAppointments, fetchAvailableDays]);

  const groupConsecutiveDates = (days) => {
    if (!days.length) return [];
    const grouped = [];
    let group = [days[0]];

    for (let i = 1; i < days.length; i++) {
      const prevDay = moment(days[i - 1].date);
      const currDay = moment(days[i].date);

      if (currDay.diff(prevDay, "days") === 1) {
        group.push(days[i]);
      } else {
        grouped.push(group);
        group = [days[i]];
      }
    }
    grouped.push(group);
    return grouped;
  };

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:8000/api/appointments/${id}/${status}/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      fetchAppointments(); // Refresh appointments
    } catch (error) {
      console.error(`Error updating appointment to ${status}:`, error);
    }
  };

  const markAvailable = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/api/set-availability/", {
        start_date: startDate,
        end_date: endDate || startDate, // Use startDate if endDate is not provided
        reason,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setModalTitle("Availability");
      setModalDescription("Availability updated");
      setIsConfirmVisible(false);
      setModalIsOpen(true);
      fetchAvailableDays(); // Refresh available days
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  const handleRemoveAvailable = async () => {
    try {
      const token = localStorage.getItem("token");
      for (let date of selectedDates) {
        const apiFormattedDate = moment(date, "MM/DD/YYYY").format("YYYY-MM-DD");
        await axios.delete(`http://localhost:8000/api/remove-availability/?start_date=${apiFormattedDate}&end_date=${apiFormattedDate}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
      }
      setModalTitle("Availability");
      setModalDescription("Availability removed");
      setIsConfirmVisible(false);
      setModalIsOpen(true);
      fetchAvailableDays(); // Refresh available days
    } catch (error) {
      console.error("Error removing available days:", error);
    }
  };

  const handleDateSelection = (date) => {
    setSelectedDates(prevDates => prevDates.includes(date)
      ? prevDates.filter(d => d !== date)
      : [...prevDates, date]
    );
  };

  const confirmRemoveSelectedDates = () => {
    const selected = selectedDates.join(', ');
    setDateList([]);  // Clear the date list
    setModalDescription(`Are you sure you want to remove ${selected} from your availability?`);
    setConfirmButtonText("Confirm");
    setIsConfirmVisible(true);
    setModalIsOpen(true);
  };

  const openRemoveAvailabilityModal = (group) => {
    if (group.length === 1) {
      const date = moment(group[0].date).format("YYYY-MM-DD");
      setModalTitle("Availability");
      setModalDescription(`Are you sure you want to remove ${moment(date).format("MM/DD/YYYY")} from your availability?`);
      setIsConfirmVisible(true);
      setConfirmButtonText("Confirm");
      setModalIsOpen(true);
    } else {
      const displayDates = group.map(day => moment(day.date).format("MM/DD/YYYY"));
      setDateList(displayDates);
      setSelectedDates([]);
      setModalTitle("Availability");
      setModalDescription("Select dates to remove from availability:");
      setIsConfirmVisible(true);
      setConfirmButtonText("Remove Selected Date(s)");
      setModalIsOpen(true);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalTitle("");
    setModalDescription("");
    setDateList([]);
    setSelectedDates([]);
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Incoming Requests Section */}
      <Typography variant="h5" component="h2" gutterBottom>
        Incoming Requests
      </Typography>
      <Table style={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: "20%" }}>User</TableCell>
            <TableCell style={{ width: "20%" }}>Date</TableCell>
            <TableCell style={{ width: "20%" }}>Status</TableCell>
            <TableCell style={{ width: "40%" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {incomingRequests.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>{appointment.user.username}</TableCell>
              <TableCell>
                {moment(appointment.date).format("MM/DD/YYYY")}
              </TableCell>
              <TableCell>{appointment.status_display}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleStatusChange(appointment.id, "approve")}
                  disabled={appointment.status === "confirmed"}
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleStatusChange(appointment.id, "deny")}
                  disabled={appointment.status === "denied"}
                >
                  Deny
                </Button>
                <Button
                  onClick={() => handleStatusChange(appointment.id, "flagged")}
                  disabled={appointment.status === "flagged"}
                >
                  Flag
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Processed Requests Section */}
      <Typography variant="h5" component="h2" gutterBottom>
        Processed Requests
      </Typography>
      <Table style={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: "20%" }}>User</TableCell>
            <TableCell style={{ width: "20%" }}>Date</TableCell>
            <TableCell style={{ width: "20%" }}>Status</TableCell>
            <TableCell style={{ width: "40%" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {processedRequests.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>{appointment.user.username}</TableCell>
              <TableCell>
                {moment(appointment.date).format("MM/DD/YYYY")}
              </TableCell>
              <TableCell>{appointment.status_display}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleStatusChange(appointment.id, "flagged")}
                  disabled={appointment.status === "flagged"}
                >
                  Flag
                </Button>
                <Button
                  onClick={() => handleStatusChange(appointment.id, "to_completion")}
                  disabled={appointment.status === "to_completion"}
                >
                  Mark as Completed
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Flagged Requests Section */}
      <Typography variant="h5" component="h2" gutterBottom>
        Flagged Requests
      </Typography>
      <Table style={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: "20%" }}>User</TableCell>
            <TableCell style={{ width: "20%" }}>Date</TableCell>
            <TableCell style={{ width: "20%" }}>Status</TableCell>
            <TableCell style={{ width: "40%" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {flaggedRequests.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>{appointment.user.username}</TableCell>
              <TableCell>
                {moment(appointment.date).format("MM/DD/YYYY")}
              </TableCell>
              <TableCell>{appointment.status_display}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleStatusChange(appointment.id, "approve")}
                  disabled={appointment.status === "confirmed"}
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleStatusChange(appointment.id, "deny")}
                  disabled={appointment.status === "denied"}
                >
                  Deny
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* To Completion Section */}
      <Typography variant="h5" component="h2" gutterBottom>
        To Completion
      </Typography>
      <Table style={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: "20%" }}>User</TableCell>
            <TableCell style={{ width: "20%" }}>Date</TableCell>
            <TableCell style={{ width: "20%" }}>Status</TableCell>
            <TableCell style={{ width: "40%" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {toCompletionRequests.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>{appointment.user.username}</TableCell>
              <TableCell>
                {moment(appointment.date).format("MM/DD/YYYY")}
              </TableCell>
              <TableCell>{appointment.status_display}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Set Availability Section */}
      <div>
        <Typography variant="h6" component="h2" gutterBottom>
          Set Availability
        </Typography>
        <TextField
          type="date"
          label="Start Date"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{ placeholder: "" }}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          type="date"
          label="End Date"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{ placeholder: "" }}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <TextField
          type="text"
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={markAvailable}>
          Set Availability
        </Button>
      </div>

      {/* Available Days Section */}
      <div>
        <Typography variant="h6" component="h2" gutterBottom>
          Available Days
        </Typography>
        <Table style={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: "20%" }}>Date Range</TableCell>
              <TableCell style={{ width: "20%" }}></TableCell>
              <TableCell style={{ width: "20%" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availableDays.map((group, index) => (
              <TableRow key={index}>
                <TableCell>
                  {group.length === 1
                    ? moment(group[0].date).format("MM/DD/YYYY")
                    : `${moment(group[0].date).format("MM/DD/YYYY")} - ${moment(group[group.length - 1].date).format("MM/DD/YYYY")}`}
                </TableCell>
                <TableCell>{group[0].reason}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => openRemoveAvailabilityModal(group)}
                  >
                    Remove Available
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal Component */}
      <CustomModal
        open={modalIsOpen}
        onClose={closeModal}
        title={modalTitle}
        description={modalDescription}
        onConfirm={confirmButtonText === "Remove Selected Date(s)" ? confirmRemoveSelectedDates : handleRemoveAvailable}
        isConfirmVisible={isConfirmVisible}
        confirmButtonText={confirmButtonText}
        dateList={dateList}
        selectedDates={selectedDates}
        handleDateSelection={handleDateSelection}
      />
    </Container>
  );
}

export default AdminDashboard;
