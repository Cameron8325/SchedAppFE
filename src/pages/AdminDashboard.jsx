import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
} from "@mui/material";
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
  const [dayType, setDayType] = useState("");
  const [selectedUserTokens, setSelectedUserTokens] = useState(0);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchFirstName, setSearchFirstName] = useState("");
  const [searchLastName, setSearchLastName] = useState("");

  const [searchResult, setSearchResult] = useState(null);

  // Modal states
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [isConfirmVisible, setIsConfirmVisible] = useState(true);
  const [confirmButtonText, setConfirmButtonText] = useState("");
  const [dateList, setDateList] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);

  // Edit Day Types Modal states
  const [editDayTypesModalIsOpen, setEditDayTypesModalIsOpen] = useState(false);
  const [editDayTypesData, setEditDayTypesData] = useState([]);

  // Confirmation Modal states
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  // User Details Modal states
  const [userDetailsModalIsOpen, setUserDetailsModalIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    tokens: 0,
  });

  // Reason Modal states
  const [reasonModalIsOpen, setReasonModalIsOpen] = useState(false);
  const [reasonModalContent, setReasonModalContent] = useState("");

  //Reason Modal handler
  const openReasonModal = (reason) => {
    setReasonModalContent(reason);
    setReasonModalIsOpen(true);
  };

  // Error Modal states
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Error modal handler
  const showErrorModal = (message) => {
    setErrorMessage(message);
    setErrorModalIsOpen(true);
  };

  const fetchAppointments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8000/api/appointments/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const sortedAppointments = response.data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      if (Array.isArray(sortedAppointments)) {
        setIncomingRequests(
          sortedAppointments.filter((a) => a.status === "pending")
        );
        setProcessedRequests(
          sortedAppointments.filter(
            (a) => a.status === "confirmed" || a.status === "denied"
          )
        );
        setFlaggedRequests(
          sortedAppointments.filter((a) => a.status === "flagged")
        );
        setToCompletionRequests(
          sortedAppointments.filter((a) => a.status === "to_completion")
        );
      } else {
        console.error("Unexpected data format:", sortedAppointments);
      }
    } catch (error) {
      showErrorModal("Error fetching appointments. Please try again later.");
      console.error("Error fetching appointments:", error);
    }
  }, []);

  const fetchAvailableDays = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8000/api/available-days/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      const sortedData = data.sort((a, b) =>
        moment(a.date).diff(moment(b.date))
      );
      const groupedData = groupConsecutiveDates(sortedData);
      setAvailableDays(groupedData);
    } catch (error) {
      showErrorModal("Error fetching available days. Please try again later.");
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
      const isConsecutive = currDay.diff(prevDay, "days") === 1;
      const hasSameType = days[i].type === days[i - 1].type;

      if (isConsecutive && hasSameType) {
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
      await axios.post(
        `http://localhost:8000/api/appointments/${id}/${status}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchAppointments(); // Refresh appointments
    } catch (error) {
      showErrorModal(
        `Error updating appointment to ${status}. Please try again later.`
      );
      console.error(`Error updating appointment to ${status}:`, error);
    }
  };

  const markAvailable = async () => {
    try {
      const token = localStorage.getItem("token");

      const start = moment(startDate);
      const end = endDate ? moment(endDate) : start;
      const today = moment().startOf("day");

      // Check if the start or end date is in the past
      if (start.isBefore(today) || end.isBefore(today)) {
        showErrorModal(
          "You cannot set availability for a past date. Please select a future date."
        );
        return;
      }

      // Fetch existing available days
      const response = await axios.get(
        "http://localhost:8000/api/available-days/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const existingDays = response.data;

      // Filter existing days to only include those within the selected date range
      const conflictingDays = existingDays.filter((day) => {
        const dayDate = moment(day.date);
        return (
          day.type !== dayType && dayDate.isBetween(start, end, "day", "[]")
        ); // '[]' includes start and end dates
      });

      if (conflictingDays.length > 0) {
        // If there are conflicting days, show an error modal with only those dates
        const conflictingDates = conflictingDays
          .map((day) => moment(day.date).format("MM/DD/YYYY"))
          .join(", ");
        setModalTitle("Conflict Detected");
        setModalDescription(
          `The following date(s) already have a different day type: ${conflictingDates}. Please adjust your selection.`
        );
        setIsConfirmVisible(false);
        setModalIsOpen(true);
      } else {
        // If no conflicts, proceed with setting availability
        await axios.post(
          "http://localhost:8000/api/set-availability/",
          {
            start_date: startDate,
            end_date: endDate || startDate, // Use startDate if endDate is not provided
            type: dayType,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setModalTitle("Availability");
        setModalDescription("Availability updated successfully.");
        setIsConfirmVisible(false);
        setModalIsOpen(true);
        fetchAvailableDays(); // Refresh available days

        // Clear the date fields and day type after success
        setStartDate("");
        setEndDate("");
        setDayType("");
      }
    } catch (error) {
      showErrorModal("Error updating availability. Please try again later.");
      console.error("Error updating availability:", error);
    }
  };

  const handleRemoveAvailable = async () => {
    try {
      const token = localStorage.getItem("token");

      if (selectedDates.length === 1) {
        const apiFormattedDate = moment(selectedDates[0], "MM/DD/YYYY").format(
          "YYYY-MM-DD"
        );
        await axios.delete(
          `http://localhost:8000/api/remove-availability/?start_date=${apiFormattedDate}&end_date=${apiFormattedDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        for (let date of selectedDates) {
          const apiFormattedDate = moment(date, "MM/DD/YYYY").format(
            "YYYY-MM-DD"
          );
          await axios.delete(
            `http://localhost:8000/api/remove-availability/?start_date=${apiFormattedDate}&end_date=${apiFormattedDate}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      }

      setModalTitle("Availability");
      setModalDescription("Availability removed");
      setIsConfirmVisible(false);
      setModalIsOpen(true);
      fetchAvailableDays(); // Refresh available days
    } catch (error) {
      showErrorModal("Error removing available days. Please try again later.");
      console.error("Error removing available days:", error);
    }
  };

  const handleDateSelection = (date) => {
    if (Array.isArray(date)) {
      // Handle "Select All" functionality
      setSelectedDates(date);
    } else {
      setSelectedDates((prevDates) =>
        prevDates.includes(date)
          ? prevDates.filter((d) => d !== date)
          : [...prevDates, date]
      );
    }
  };

  const confirmRemoveSelectedDates = () => {
    const selected = selectedDates.join(", ");
    setDateList([]); // Clear the date list
    setModalDescription(
      `Are you sure you want to remove ${selected} from your availability?`
    );
    setConfirmButtonText("Confirm");
    setIsConfirmVisible(true);
    setModalIsOpen(true);
  };

  const openRemoveAvailabilityModal = (group) => {
    if (group.length === 1) {
      const date = moment(group[0].date).format("MM/DD/YYYY");
      setSelectedDates([date]);
      setModalTitle("Availability");
      setModalDescription(
        `Are you sure you want to remove ${date} from your availability?`
      );
      setIsConfirmVisible(true);
      setConfirmButtonText("Confirm");
      setModalIsOpen(true);
    } else {
      const displayDates = group.map((day) =>
        moment(day.date).format("MM/DD/YYYY")
      );
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

  const openEditDayTypesModal = (group) => {
    const displayDates = group.map((day) => ({
      date: moment(day.date).format("MM/DD/YYYY"),
      oldType: day.type,
      newType: day.type, // Initialize with the old type
    }));
    setEditDayTypesData(displayDates);
    setEditDayTypesModalIsOpen(true);
  };

  const closeEditDayTypesModal = () => {
    setEditDayTypesModalIsOpen(false);
    setEditDayTypesData([]);
  };

  const handleDayTypeChange = (index, newType) => {
    const updatedData = [...editDayTypesData];
    updatedData[index].newType = newType;
    setEditDayTypesData(updatedData);
  };

  const confirmEditDayTypes = () => {
    const changes = editDayTypesData
      .filter((item) => item.oldType !== item.newType)
      .map(
        (item) =>
          `${item.date} from ${dayTypeMap[item.oldType]} to ${
            dayTypeMap[item.newType]
          }`
      )
      .join(", ");

    setConfirmMessage(
      `Are you sure you want to make the following changes: ${changes}?`
    );
    setConfirmModalIsOpen(true);
  };

  const handleConfirmChanges = async () => {
    try {
      const token = localStorage.getItem("token");

      for (let item of editDayTypesData) {
        if (item.oldType !== item.newType) {
          const apiFormattedDate = moment(item.date, "MM/DD/YYYY").format(
            "YYYY-MM-DD"
          );
          await axios.post(
            `http://localhost:8000/api/set-availability/`,
            {
              start_date: apiFormattedDate,
              end_date: apiFormattedDate,
              type: item.newType,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      }

      setConfirmModalIsOpen(false);
      closeEditDayTypesModal();

      // Refresh and regroup available days
      fetchAvailableDays();
    } catch (error) {
      showErrorModal("Error updating day types. Please try again later.");
      console.error("Error updating day types:", error);
    }
  };

  const openUserDetailsModal = (user) => {
    const userWithPhoneNumber = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.profile?.phone_number || "N/A",
      tokens: user.profile?.tokens || 0,
    };

    setSelectedUser(userWithPhoneNumber);
    setSelectedUserTokens(userWithPhoneNumber.tokens);
    setUserDetailsModalIsOpen(true);
  };

  const formatPhoneNumber = (phoneNumber) => {
    // Remove any non-digit characters
    const cleaned = ("" + phoneNumber).replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }

    return phoneNumber; // Return the original input if it's not 10 digits
  };

  const searchUser = async () => {
    // Check if all search fields are empty
    if (!searchUsername && !searchFirstName && !searchLastName) {
      return; // Do nothing if all search fields are empty
    }

    try {
      const token = localStorage.getItem("token");
      let query = "";

      // Construct the query string based on the provided search fields
      if (searchUsername) {
        query += `username=${searchUsername}`;
      }
      if (searchFirstName) {
        query += `${query ? "&" : ""}first_name=${searchFirstName}`;
      }
      if (searchLastName) {
        query += `${query ? "&" : ""}last_name=${searchLastName}`;
      }

      // Make the API call to search for the user
      const response = await axios.get(
        `http://localhost:8000/api/users/search/?${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.length > 0) {
        const user = response.data[0]; // Get the first user object

        // Format the user details and set the state
        const userWithDetails = {
          ...user,
          phone_number: user.profile?.phone_number
            ? formatPhoneNumber(user.profile.phone_number)
            : "N/A",
          tokens: user.profile?.tokens || 0,
        };

        setSearchResult(userWithDetails);
        setSelectedUser(userWithDetails);
        setSelectedUserTokens(userWithDetails.tokens); // Set current token count
      } else {
        setSearchResult(null);
        showErrorModal("User not found.");
      }
    } catch (error) {
      console.error("Error searching for user:", error);
      showErrorModal("Error searching for user.");
    }
  };

  const handleTokenUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      // Ensure selectedUserTokens is a valid number
      if (isNaN(selectedUserTokens) || selectedUserTokens < 0) {
        showErrorModal("Invalid token count. Please enter a valid number.");
        return;
      }

      const response = await axios.post(
        `http://localhost:8000/api/admin-panel/update-tokens/${selectedUser.id}/`,
        { tokens: parseInt(selectedUserTokens) }, // Ensure it's an integer
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        showErrorModal("Tokens updated successfully.");
      }
    } catch (error) {
      console.error("Error updating tokens:", error.response.data || error);
      showErrorModal("Error updating tokens. Please try again later.");
    }
  };

  const dayTypeMap = useMemo(
    () => ({
      tea_tasting: "Tea Tasting",
      intro_gongfu: "Intro to Gongfu",
      guided_meditation: "Guided Meditation",
    }),
    []
  );

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Search User Section */}
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchUsername}
        onChange={(e) => setSearchUsername(e.target.value)}
      />
      <TextField
        label="First Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchFirstName}
        onChange={(e) => setSearchFirstName(e.target.value)}
      />
      <TextField
        label="Last Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchLastName}
        onChange={(e) => setSearchLastName(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={searchUser}
        fullWidth
      >
        Search User
      </Button>

      {searchResult && (
        <div>
          <Typography variant="h6" component="h3" gutterBottom>
            User Details
          </Typography>
          <Typography variant="body1">
            <strong>Name:</strong> {selectedUser.first_name}{" "}
            {selectedUser.last_name}
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {selectedUser.email}
          </Typography>
          <Typography variant="body1">
            <strong>Phone Number:</strong> {selectedUser.phone_number}
          </Typography>
          <TextField
            label="Token Count"
            variant="outlined"
            fullWidth
            margin="normal"
            type="number"
            value={selectedUserTokens}
            onChange={(e) => setSelectedUserTokens(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleTokenUpdate}
            fullWidth
          >
            Update Tokens
          </Button>
        </div>
      )}

      {/* Incoming Requests Section */}
      <Typography variant="h5" component="h2" gutterBottom>
        Incoming Requests
      </Typography>
      <Table style={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: "20%" }}>User</TableCell>
            <TableCell style={{ width: "20%" }}>Date</TableCell>
            <TableCell style={{ width: "20%" }}>Day Type</TableCell>
            <TableCell style={{ width: "20%" }}>Status</TableCell>
            <TableCell style={{ width: "20%" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {incomingRequests.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell onClick={() => openUserDetailsModal(appointment.user)}>
                {appointment.user.first_name} {appointment.user.last_name}
              </TableCell>
              <TableCell>
                {moment(appointment.date).format("MM/DD/YYYY")}
              </TableCell>
              <TableCell>{dayTypeMap[appointment.day_type]}</TableCell>
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
            <TableCell style={{ width: "20%" }}>Day Type</TableCell>
            <TableCell style={{ width: "20%" }}>Status</TableCell>
            <TableCell style={{ width: "20%" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {processedRequests.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell onClick={() => openUserDetailsModal(appointment.user)}>
                {appointment.user.username}
              </TableCell>
              <TableCell>
                {moment(appointment.date).format("MM/DD/YYYY")}
              </TableCell>
              <TableCell>{dayTypeMap[appointment.day_type]}</TableCell>
              <TableCell>{appointment.status_display}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleStatusChange(appointment.id, "flagged")}
                  disabled={appointment.status === "flagged"}
                >
                  Flag
                </Button>
                <Button
                  onClick={() =>
                    handleStatusChange(appointment.id, "to_completion")
                  }
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
            <TableCell style={{ width: "20%" }}>Day Type</TableCell>
            <TableCell style={{ width: "20%" }}>Reason</TableCell>
            <TableCell style={{ width: "20%" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {flaggedRequests.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell onClick={() => openUserDetailsModal(appointment.user)}>
                {appointment.user.username}
              </TableCell>
              <TableCell>
                {moment(appointment.date).format("MM/DD/YYYY")}
              </TableCell>
              <TableCell>{dayTypeMap[appointment.day_type]}</TableCell>
              <TableCell>
                <Button
                  onClick={() => openReasonModal(appointment.reason)}
                  variant="outlined"
                >
                  View Reason
                </Button>
              </TableCell>

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
            <TableCell style={{ width: "20%" }}>Day Type</TableCell>
            <TableCell style={{ width: "20%" }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {toCompletionRequests.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell onClick={() => openUserDetailsModal(appointment.user)}>
                {appointment.user.username}
              </TableCell>
              <TableCell>
                {moment(appointment.date).format("MM/DD/YYYY")}
              </TableCell>
              <TableCell>{dayTypeMap[appointment.day_type]}</TableCell>
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
          value={startDate} // Bind the state value to the field
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          type="date"
          label="End Date"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{ placeholder: "" }}
          value={endDate} // Bind the state value to the field
          onChange={(e) => setEndDate(e.target.value)}
        />

        <Select
          value={dayType}
          onChange={(e) => setDayType(e.target.value)}
          displayEmpty
        >
          <MenuItem value="" disabled>
            Select Day Type
          </MenuItem>
          <MenuItem value="tea_tasting">Tea Tasting</MenuItem>
          <MenuItem value="intro_gongfu">Intro to Gongfu</MenuItem>
          <MenuItem value="guided_meditation">Guided Meditation</MenuItem>
        </Select>
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
              <TableCell style={{ width: "20%" }}>Day Type</TableCell>
              <TableCell style={{ width: "20%" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availableDays.map((group, index) => (
              <TableRow key={index}>
                <TableCell>
                  {group.length === 1
                    ? moment(group[0].date).format("MM/DD/YYYY")
                    : `${moment(group[0].date).format("MM/DD/YYYY")} - ${moment(
                        group[group.length - 1].date
                      ).format("MM/DD/YYYY")}`}
                </TableCell>
                <TableCell>{dayTypeMap[group[0].type]}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => openEditDayTypesModal(group)}
                  >
                    Edit Day Types
                  </Button>
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
        onConfirm={
          confirmButtonText === "Remove Selected Date(s)"
            ? confirmRemoveSelectedDates
            : handleRemoveAvailable
        }
        isConfirmVisible={isConfirmVisible}
        confirmButtonText={confirmButtonText}
        dateList={dateList}
        selectedDates={selectedDates}
        handleDateSelection={handleDateSelection}
      />

      {/* Edit Day Types Modal */}
      <CustomModal
        open={editDayTypesModalIsOpen}
        onClose={closeEditDayTypesModal}
        title="Edit Day Types"
        description="Update the day types for the selected dates:"
        isConfirmVisible={true}
        confirmButtonText="Save Changes"
        onConfirm={confirmEditDayTypes}
      >
        {editDayTypesData.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <Typography variant="body1" style={{ flex: 1 }}>
              {item.date}
            </Typography>
            <Select
              value={item.newType}
              onChange={(e) => handleDayTypeChange(index, e.target.value)}
              style={{ flex: 1, marginLeft: "8px" }}
            >
              <MenuItem value="tea_tasting">Tea Tasting</MenuItem>
              <MenuItem value="intro_gongfu">Intro to Gongfu</MenuItem>
              <MenuItem value="guided_meditation">Guided Meditation</MenuItem>
            </Select>
          </div>
        ))}
      </CustomModal>

      {/* Confirmation Modal */}
      <CustomModal
        open={confirmModalIsOpen}
        onClose={() => setConfirmModalIsOpen(false)}
        title="Confirm Changes"
        description={confirmMessage}
        isConfirmVisible={true}
        confirmButtonText="Confirm"
        onConfirm={handleConfirmChanges}
      />

      {/* User Details Modal */}
      <CustomModal
        open={userDetailsModalIsOpen}
        onClose={() => setUserDetailsModalIsOpen(false)}
        title="User Details"
        description={`Here are the details for ${selectedUser.first_name} ${selectedUser.last_name}:`}
        isConfirmVisible={true}
        confirmButtonText="Update Tokens"
        onConfirm={handleTokenUpdate}
      >
        <Typography variant="body1">
          <strong>Email:</strong> {selectedUser.email}
        </Typography>
        <Typography variant="body1">
          <strong>Phone Number:</strong>{" "}
          {selectedUser.phone_number
            ? selectedUser.phone_number.replace(
                /(\d{3})(\d{3})(\d{4})/,
                "($1) $2-$3"
              )
            : "N/A"}
        </Typography>

        <TextField
          label="Token Count"
          variant="outlined"
          fullWidth
          margin="normal"
          type="number"
          value={selectedUserTokens}
          onChange={(e) => setSelectedUserTokens(e.target.value)}
        />
      </CustomModal>

      {/* Error Modal */}
      <CustomModal
        open={errorModalIsOpen}
        onClose={() => setErrorModalIsOpen(false)}
        title="Error"
        description={errorMessage}
        isConfirmVisible={false} // No need for a confirm button
      />

      {/* Reason Modal */}
      <CustomModal
        open={reasonModalIsOpen}
        onClose={() => setReasonModalIsOpen(false)}
        title="Flagged Request Reason"
        description={reasonModalContent}
        isConfirmVisible={false} // No confirm button needed
      />
    </Container>
  );
}

export default AdminDashboard;
