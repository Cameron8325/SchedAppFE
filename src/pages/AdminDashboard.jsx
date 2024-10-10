import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Box,
  Badge,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import moment from "moment";
import CustomModal from "../components/modal/CustomModal";
import UserSearch from "../components/adminDash/UserSearch";
import IncomingRequests from "../components/adminDash/IncomingRequests";
import ProcessedRequests from "../components/adminDash/ProcessedRequests";
import FlaggedRequests from "../components/adminDash/FlaggedRequests";
import ToCompletionRequests from "../components/adminDash/ToCompletionRequests";
import AvailabilitySection from "../components/adminDash/AvailabilitySection";
import { useTheme } from "@mui/material/styles";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext

function AdminDashboard() {
  // Access user and authentication state from AuthContext
  const { user, isSuperUser, loading } = useContext(AuthContext);

  // Tab-related states
  const [selectedTab, setSelectedTab] = useState(0);

  // Appointment-related states
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [processedRequests, setProcessedRequests] = useState([]);
  const [flaggedRequests, setFlaggedRequests] = useState([]);
  const [toCompletionRequests, setToCompletionRequests] = useState([]);

  // Availability-related states
  const [availableDays, setAvailableDays] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dayType, setDayType] = useState("");

  // User-related states
  const [selectedUserTokens, setSelectedUserTokens] = useState(0);

  // Modal states
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [isConfirmVisible, setIsConfirmVisible] = useState(true);
  const [confirmButtonText, setConfirmButtonText] = useState("");

  // Date selection modal states
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
    id: null,
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    tokens: 0,
  });

  // Reason Modal states
  const [reasonModalIsOpen, setReasonModalIsOpen] = useState(false);
  const [reasonModalContent, setReasonModalContent] = useState("");

  // Flag Modal states
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [flagReason, setFlagReason] = useState("");
  const [modalStep, setModalStep] = useState(1); // Track the steps of the modal

  // Error Modal states
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Reason Modal handler
  const openReasonModal = (reason) => {
    setReasonModalContent(reason);
    setReasonModalIsOpen(true);
  };

  // Error modal handler
  const showErrorModal = (message) => {
    setErrorMessage(message);
    setErrorModalIsOpen(true);
  };

  // Tab Handler
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Fetch appointments and filter based on status
  const fetchAppointments = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/appointments/"
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

  // Modal handlers for flagging appointments
  const handleOpenFlagModal = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setIsFlagModalOpen(true);
    setModalStep(1); // Start at the first step
  };

  const handleCloseFlagModal = () => {
    setIsFlagModalOpen(false);
    setSelectedAppointmentId(null);
    setFlagReason("");
    setModalStep(1); // Reset modal to the first step
  };

  const handleModalConfirm = () => {
    if (modalStep === 1) {
      setModalStep(2); // Move to reason input step
    } else if (modalStep === 2 && flagReason.trim()) {
      handleSubmitFlag(); // Submit the flag if reason is provided
    } else {
      // Show error if no reason is provided
      setErrorModalIsOpen(true);
      setErrorMessage("Please provide a reason for flagging.");
    }
  };

  const handleSubmitFlag = async () => {
    try {
      await axios.post(
        `http://localhost:8000/api/admin-panel/appointments/${selectedAppointmentId}/flag/`,
        { reason: flagReason }
      );

      // Update flagged requests in the dashboard state
      setFlaggedRequests((prevRequests) =>
        prevRequests.map((appointment) =>
          appointment.id === selectedAppointmentId
            ? { ...appointment, status: "flagged" }
            : appointment
        )
      );

      // Move to the success step
      setModalStep(3);
    } catch (error) {
      setErrorModalIsOpen(true);
      setErrorMessage("Error flagging appointment.");
    }
  };

  // Fetch available days and group by consecutive dates
  const fetchAvailableDays = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/available-days/"
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
    if (user && isSuperUser) {
      fetchAppointments();
      fetchAvailableDays();
    }
  }, [user, isSuperUser, fetchAppointments, fetchAvailableDays]);

  // Helper function to group consecutive dates
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

  // Handle status change of appointments
  const handleStatusChange = async (id, status) => {
    try {
      await axios.post(
        `http://localhost:8000/api/admin-panel/appointments/${id}/${status}/`
      );
      fetchAppointments(); // Refresh appointments
    } catch (error) {
      showErrorModal(
        `Error updating appointment to ${status}. Please try again later.`
      );
      console.error(`Error updating appointment to ${status}:`, error);
    }
  };

  // Handle marking days as available
  const markAvailable = async () => {
    try {
      const start = moment(startDate);
      const end = endDate ? moment(endDate) : start;
      const today = moment().startOf("day");

      if (start.isBefore(today) || end.isBefore(today)) {
        showErrorModal(
          "You cannot set availability for a past date. Please select a future date."
        );
        return;
      }

      await axios.post(
        "http://localhost:8000/api/admin-panel/set-availability/",
        {
          start_date: startDate,
          end_date: endDate || startDate,
          type: dayType,
        }
      );

      setModalTitle("Availability");
      setModalDescription("Availability updated successfully.");
      setIsConfirmVisible(false);
      setModalIsOpen(true);
      fetchAvailableDays(); // Refresh available days

      setStartDate("");
      setEndDate("");
      setDayType("");
    } catch (error) {
      showErrorModal("Error updating availability. Please try again later.");
      console.error("Error updating availability:", error);
    }
  };

  // Handle removal of availability
  const handleRemoveAvailable = async () => {
    try {
      if (selectedDates.length === 1) {
        const apiFormattedDate = moment(selectedDates[0], "MM/DD/YYYY").format(
          "YYYY-MM-DD"
        );
        await axios.delete(
          `http://localhost:8000/api/admin-panel/remove-availability/?start_date=${apiFormattedDate}&end_date=${apiFormattedDate}`
        );
      } else {
        for (let date of selectedDates) {
          const apiFormattedDate = moment(date, "MM/DD/YYYY").format(
            "YYYY-MM-DD"
          );
          await axios.delete(
            `http://localhost:8000/api/admin-panel/remove-availability/?start_date=${apiFormattedDate}&end_date=${apiFormattedDate}`
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

  // Handle date selection for removal
  const handleDateSelection = (date) => {
    if (Array.isArray(date)) {
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

  // Open modal to remove availability
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

  // Close the modal
  const closeModal = () => {
    setModalIsOpen(false);
    setModalTitle("");
    setModalDescription("");
    setDateList([]);
    setSelectedDates([]);
  };

  // Open modal to edit day types
  const openEditDayTypesModal = (group) => {
    const displayDates = group.map((day) => ({
      date: moment(day.date).format("MM/DD/YYYY"),
      oldType: day.type,
      newType: day.type, // Initialize with the old type
    }));
    setEditDayTypesData(displayDates);
    setEditDayTypesModalIsOpen(true);
  };

  // Close the edit day types modal
  const closeEditDayTypesModal = () => {
    setEditDayTypesModalIsOpen(false);
    setEditDayTypesData([]);
  };

  // Handle changes to day type
  const handleDayTypeChange = (index, newType) => {
    const updatedData = [...editDayTypesData];
    updatedData[index].newType = newType;
    setEditDayTypesData(updatedData);
  };

  // Confirm the edit of day types
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

  // Handle confirmation of day type changes
  const handleConfirmChanges = async () => {
    try {
      for (let item of editDayTypesData) {
        if (item.oldType !== item.newType) {
          const apiFormattedDate = moment(item.date, "MM/DD/YYYY").format(
            "YYYY-MM-DD"
          );
          await axios.post(
            `http://localhost:8000/api/admin-panel/set-availability/`,
            {
              start_date: apiFormattedDate,
              end_date: apiFormattedDate,
              type: item.newType,
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

  // Open user details modal
  const openUserDetailsModal = (user) => {
    const userWithPhoneNumber = {
      id: user.id, // Ensure the user ID is available
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

  // Handle token update for a user
  const handleTokenUpdate = async () => {
    try {
      // Ensure selectedUserTokens is a valid number
      if (isNaN(selectedUserTokens) || selectedUserTokens < 0) {
        showErrorModal("Invalid token count. Please enter a valid number.");
        return;
      }

      const response = await axios.post(
        `http://localhost:8000/api/admin-panel/update-tokens/${selectedUser.id}/`,
        { tokens: parseInt(selectedUserTokens) } // Ensure it's an integer
      );

      if (response.status === 200) {
        showErrorModal("Tokens updated successfully.");
      }
    } catch (error) {
      console.error("Error updating tokens:", error.response?.data || error);
      showErrorModal("Error updating tokens. Please try again later.");
    }
  };

  // Map day type values to their display names
  const dayTypeMap = useMemo(
    () => ({
      tea_tasting: "Tea Tasting",
      intro_gongfu: "Intro to Gongfu",
      guided_meditation: "Guided Meditation",
    }),
    []
  );

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg")); // Adjust for mobile screens

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !isSuperUser) {
    return (
      <Container sx={{ marginTop: "2vh" }}>
        <Typography variant="h5" color="error" align="center">
          Access Denied: You do not have admin privileges.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ marginTop: "2vh" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Tabs Section */}
      <Box mt={2} mb={3}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="admin dashboard tabs"
          variant={isMobile ? "scrollable" : "standard"} // Conditionally use scrollable for mobile
          scrollButtons={isMobile ? "auto" : false} // Enable scroll buttons on mobile
          allowScrollButtonsMobile={isMobile} // Only enable scroll buttons for mobile
          sx={{
            ".MuiTabs-indicator": {
              backgroundColor: "#8B5E3C", // Custom indicator color (earthy brown)
            },
          }}
        >
          <Tab
            label="All"
            sx={{
              color: selectedTab === 0 ? "#8B5E3C" : "#4A4A48",
              "&.Mui-selected": {
                color: "#8B5E3C",
              },
            }}
          />
          <Tab
            label="User Search"
            sx={{
              color: selectedTab === 1 ? "#8B5E3C" : "#4A4A48",
              "&.Mui-selected": {
                color: "#8B5E3C",
              },
            }}
          />
          <Tab
            label={
              <Badge
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#8B5E3C", // Earthy brown for the badge background
                    color: "#F0E5D8", // Warm cream for the text
                  },
                }}
                badgeContent={incomingRequests.length}
              >
                <span style={{ paddingRight: "10px" }}>Incoming Requests</span>
              </Badge>
            }
            sx={{
              color: selectedTab === 2 ? "#8B5E3C" : "#4A4A48",
              "&.Mui-selected": {
                color: "#8B5E3C",
              },
            }}
          />
          <Tab
            label="Processed Requests"
            sx={{
              color: selectedTab === 3 ? "#8B5E3C" : "#4A4A48",
              "&.Mui-selected": {
                color: "#8B5E3C",
              },
            }}
          />
          <Tab
            label={
              <Badge
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#8B5E3C", // Earthy brown for the badge background
                    color: "#F0E5D8", // Warm cream for the text
                  },
                }}
                badgeContent={flaggedRequests.length}
              >
                <span style={{ paddingRight: "10px" }}>Flagged Requests</span>
              </Badge>
            }
            sx={{
              color: selectedTab === 4 ? "#8B5E3C" : "#4A4A48",
              "&.Mui-selected": {
                color: "#8B5E3C",
              },
            }}
          />
          <Tab
            label="To Completion"
            sx={{
              color: selectedTab === 5 ? "#8B5E3C" : "#4A4A48",
              "&.Mui-selected": {
                color: "#8B5E3C",
              },
            }}
          />
          <Tab
            label="Availability"
            sx={{
              color: selectedTab === 6 ? "#8B5E3C" : "#4A4A48",
              "&.Mui-selected": {
                color: "#8B5E3C",
              },
            }}
          />
        </Tabs>
      </Box>

      {/* Content Section */}
      <Box p={3}>
        {selectedTab === 0 && (
          <>
            <Box mb={3}>
              {" "}
              {/* Add margin bottom */}
              <UserSearch
                openUserDetailsModal={openUserDetailsModal}
                showErrorModal={showErrorModal}
              />
            </Box>
            <Box mb={3}>
              {" "}
              {/* Add margin bottom */}
              <IncomingRequests
                incomingRequests={incomingRequests}
                dayTypeMap={dayTypeMap}
                openUserDetailsModal={openUserDetailsModal}
                handleStatusChange={handleStatusChange}
                handleOpenFlagModal={handleOpenFlagModal}
              />
            </Box>
            <Box mb={3}>
              {" "}
              {/* Add margin bottom */}
              <ProcessedRequests
                processedRequests={processedRequests}
                dayTypeMap={dayTypeMap}
                openUserDetailsModal={openUserDetailsModal}
                handleOpenFlagModal={handleOpenFlagModal}
                handleStatusChange={handleStatusChange}
              />
            </Box>
            <Box mb={3}>
              {" "}
              {/* Add margin bottom */}
              <FlaggedRequests
                flaggedRequests={flaggedRequests}
                dayTypeMap={dayTypeMap}
                openUserDetailsModal={openUserDetailsModal}
                openReasonModal={openReasonModal}
                handleStatusChange={handleStatusChange}
              />
            </Box>
            <Box mb={3}>
              {" "}
              {/* Add margin bottom */}
              <ToCompletionRequests
                toCompletionRequests={toCompletionRequests}
                dayTypeMap={dayTypeMap}
                openUserDetailsModal={openUserDetailsModal}
              />
            </Box>
            <AvailabilitySection
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              dayType={dayType}
              setDayType={setDayType}
              markAvailable={markAvailable}
              availableDays={availableDays}
              dayTypeMap={dayTypeMap}
              openEditDayTypesModal={openEditDayTypesModal}
              openRemoveAvailabilityModal={openRemoveAvailabilityModal}
            />
          </>
        )}
        {selectedTab === 1 && (
          <Box mb={3}>
            {" "}
            {/* Add margin bottom */}
            <UserSearch
              openUserDetailsModal={openUserDetailsModal}
              showErrorModal={showErrorModal}
            />
          </Box>
        )}
        {selectedTab === 2 && (
          <Box mb={3}>
            {" "}
            {/* Add margin bottom */}
            <IncomingRequests
              incomingRequests={incomingRequests}
              dayTypeMap={dayTypeMap}
              openUserDetailsModal={openUserDetailsModal}
              handleStatusChange={handleStatusChange}
              handleOpenFlagModal={handleOpenFlagModal}
            />
          </Box>
        )}
        {selectedTab === 3 && (
          <Box mb={3}>
            {" "}
            {/* Add margin bottom */}
            <ProcessedRequests
              processedRequests={processedRequests}
              dayTypeMap={dayTypeMap}
              openUserDetailsModal={openUserDetailsModal}
              handleOpenFlagModal={handleOpenFlagModal}
              handleStatusChange={handleStatusChange}
            />
          </Box>
        )}
        {selectedTab === 4 && (
          <Box mb={3}>
            {" "}
            {/* Add margin bottom */}
            <FlaggedRequests
              flaggedRequests={flaggedRequests}
              dayTypeMap={dayTypeMap}
              openUserDetailsModal={openUserDetailsModal}
              openReasonModal={openReasonModal}
              handleStatusChange={handleStatusChange}
            />
          </Box>
        )}
        {selectedTab === 5 && (
          <Box mb={3}>
            {" "}
            {/* Add margin bottom */}
            <ToCompletionRequests
              toCompletionRequests={toCompletionRequests}
              dayTypeMap={dayTypeMap}
              openUserDetailsModal={openUserDetailsModal}
            />
          </Box>
        )}
        {selectedTab === 6 && (
          <AvailabilitySection
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            dayType={dayType}
            setDayType={setDayType}
            markAvailable={markAvailable}
            availableDays={availableDays}
            dayTypeMap={dayTypeMap}
            openEditDayTypesModal={openEditDayTypesModal}
            openRemoveAvailabilityModal={openRemoveAvailabilityModal}
          />
        )}
      </Box>

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
            : "" // No description for the success step
        }
        isConfirmVisible={modalStep !== 3} // Only show confirm button in step 1 and 2
        confirmButtonText={
          modalStep === 1 ? "Confirm" : modalStep === 2 ? "Submit" : "Close"
        }
        onConfirm={handleModalConfirm} // Move through the steps or submit flag
        showTextInput={modalStep === 2} // Show input only on step 2
        inputValue={flagReason}
        handleInputChange={(e) => setFlagReason(e.target.value)} // Handle input change
      >
        {modalStep === 3 && (
          <Typography variant="body1">
            The appointment has been flagged successfully.
          </Typography>
        )}
      </CustomModal>
    </Container>
  );
}

export default AdminDashboard;
