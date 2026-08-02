import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment-timezone";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Alert,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { AuthContext } from "../../context/AuthContext";
import CustomModal from "../../components/modal/CustomModal";
import CustomToolbar from "../../components/calendar/customToolbar";
import "./AppointmentsPage.css";

const localizer = momentLocalizer(moment);

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const getBackgroundColor = (type) => {
  switch (type) {
    case "tea_tasting":
      return "#5B3758"; // muted plum
    case "intro_gongfu":
      return "#A04E2E"; // terracotta
    case "guided_meditation":
      return "#495C8D"; // subdued indigo
    default:
      return "#4A6A8F"; // desaturated blue
  }
};

function AppointmentsPage() {
  const { user, isSuperUser } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isConfirmVisible, setIsConfirmVisible] = useState(true);
  const [confirmButtonText, setConfirmButtonText] = useState("Confirm");
  const [selectedDayType, setSelectedDayType] = useState("all");
  const [loading, setLoading] = useState(false); // reserve action in flight
  const [fetching, setFetching] = useState(true); // calendar data loading
  const [fetchError, setFetchError] = useState("");
  const [walkInDetails, setWalkInDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [isReservationStep, setIsReservationStep] = useState(false);

  const dayTypeMap = useMemo(
    () => ({
      tea_tasting: "Tea Tasting",
      intro_gongfu: "Intro to Gongfu",
      guided_meditation: "Guided Meditation",
    }),
    []
  );

  const query = useQuery();
  const navigate = useNavigate();

  const fetchAvailableDays = useCallback(async () => {
    setFetching(true);
    setFetchError("");
    try {
      // The server returns each available day with its remaining spots, so no
      // appointment data (or PII) is needed on the public calendar.
      const response = await api.get("/api/available-days/");

      const eventsData = response.data.flatMap((day) => {
        const start = moment(day.date).startOf("day").toDate();
        const spotsLeft = day.spots_left;
        return [
          {
            start,
            end: start,
            title: dayTypeMap[day.type] || day.type,
            allDay: true,
            backgroundColor: getBackgroundColor(day.type),
            type: day.type,
          },
          {
            start,
            end: start,
            title: spotsLeft === 0 ? "Fully Booked" : `${spotsLeft} spots left`,
            allDay: true,
            backgroundColor: spotsLeft === 0 ? "#546E7A" : "#3174ad",
            type: null,
            spotsLeft,
          },
        ];
      });

      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching available days:", error);
      setFetchError(
        "We couldn't load the appointment calendar. Please refresh the page or try again later."
      );
    } finally {
      setFetching(false);
    }
  }, [dayTypeMap]);

  useEffect(() => {
    fetchAvailableDays();
  }, [fetchAvailableDays]);

  useEffect(() => {
    const dayTypeQuery = query.get("dayType");
    setSelectedDayType(dayTypeQuery || "all");
  }, [query]);

  useEffect(() => {
    if (selectedDayType === "all") {
      setFilteredEvents(events);
    } else {
      const dayTypeEvents = events.filter(
        (event) => event.type === selectedDayType
      );
      const spotsLeftEvents = events
        .filter((event) => event.type === null)
        .filter((event) =>
          dayTypeEvents.some((dayEvent) =>
            moment(dayEvent.start).isSame(event.start, "day")
          )
        );
      setFilteredEvents([...dayTypeEvents, ...spotsLeftEvents]);
    }
  }, [selectedDayType, events]);

  const showInfoModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsConfirmVisible(false);
    setIsReservationStep(false);
    setModalIsOpen(true);
  };

  const handleSelectSlot = ({ start }) => {
    const today = moment().startOf("day");
    const selected = moment(start).startOf("day");

    if (!user) {
      showInfoModal(
        "Authentication Required",
        "Please log in or register to reserve an appointment."
      );
      return;
    }

    if (selected.isSameOrBefore(today)) {
      showInfoModal(
        "Invalid Selection",
        "Appointments must be booked at least one day in advance."
      );
      return;
    }

    const selectedEvent = events.find(
      (event) => moment(event.start).isSame(selected, "day") && event.type
    );

    if (!selectedEvent) {
      showInfoModal(
        "Unavailable Date",
        "The selected date is not available for appointments."
      );
      return;
    }

    const isFullyBooked = events.some(
      (event) =>
        moment(event.start).isSame(selected, "day") &&
        event.title === "Fully Booked"
    );

    if (isFullyBooked) {
      showInfoModal(
        "Fully Booked",
        "Sorry, this date is fully booked. Please choose another date."
      );
      return;
    }

    // Valid reservation step
    setSelectedDate(start);
    setModalTitle(isSuperUser ? "Reserve Walk-In Appointment" : "Reserve Appointment");
    setModalMessage(
      isSuperUser
        ? `Enter the walk-in guest's details to reserve ${selected.format(
            "MMMM Do, YYYY"
          )} (${dayTypeMap[selectedEvent.type]}).`
        : `Would you like to request an appointment for ${selected.format(
            "MMMM Do, YYYY"
          )} (${dayTypeMap[selectedEvent.type]})?`
    );
    setIsConfirmVisible(true);
    setConfirmButtonText("Confirm");
    setIsReservationStep(true);
    setModalIsOpen(true);
  };

  const handleReserve = async () => {
    if (
      isSuperUser &&
      (!walkInDetails.firstName ||
        !walkInDetails.lastName ||
        !walkInDetails.email ||
        !walkInDetails.phone)
    ) {
      showInfoModal(
        "Missing Information",
        "Please fill out all walk-in details before submitting the reservation."
      );
      return;
    }

    setLoading(true);
    try {
      const payload = isSuperUser
        ? {
            walk_in_first_name: walkInDetails.firstName,
            walk_in_last_name: walkInDetails.lastName,
            walk_in_email: walkInDetails.email,
            walk_in_phone: walkInDetails.phone,
            date: moment(selectedDate).format("YYYY-MM-DD"),
          }
        : {
            date: moment(selectedDate).format("YYYY-MM-DD"),
          };

      await api.post("/api/appointments/", payload);

      await fetchAvailableDays();
      setWalkInDetails({ firstName: "", lastName: "", email: "", phone: "" });
      showInfoModal(
        "Request Submitted",
        "Your appointment request has been submitted and is pending approval. We'll email you once it's confirmed."
      );
    } catch (error) {
      const serverMessage = error.response?.data?.error;
      showInfoModal(
        "Unable to Reserve",
        serverMessage ||
          "Something went wrong. Please try to reserve your appointment again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="tea-calendar-shell">
      <header className="tea-page-heading">
        <div>
          <p className="tea-kicker" style={{ color: "#B33A24" }}>Reservations</p>
          <Typography variant="h2" component="h1" sx={{ mt: 1, fontSize: { xs: '2.7rem', md: '4.6rem' }, lineHeight: 1 }}>
            Find your seat.
          </Typography>
        </div>
        <p>
          Open dates show the session and remaining capacity. Choose a day to
          request one of four seats at the table.
        </p>
      </header>

      {fetchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {fetchError}
        </Alert>
      )}

      {fetching ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {events.length === 0 && !fetchError && (
            <Alert severity="info" sx={{ mb: 2 }}>
              No available days have been posted yet. Please check back soon.
            </Alert>
          )}
          <div className="tea-calendar-frame">
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              views={["month"]}
              startAccessor="start"
              endAccessor="end"
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectSlot}
              style={{ height: 620 }}
              eventPropGetter={(event) => ({
                style: { backgroundColor: event.backgroundColor },
              })}
              longPressThreshold={1}
              components={{
                toolbar: (props) => (
                  <CustomToolbar
                    {...props}
                    activeDayType={selectedDayType}
                    handleDayTypeChange={(type) =>
                      navigate(
                        type === "all"
                          ? "/appointments"
                          : `/appointments?dayType=${type}`
                      )
                    }
                  />
                ),
              }}
            />
          </div>
        </>
      )}

      <CustomModal
        open={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        title={modalTitle}
        description={modalMessage}
        onConfirm={handleReserve}
        isConfirmVisible={isConfirmVisible}
        confirmButtonText={
          loading ? <CircularProgress size={20} /> : confirmButtonText
        }
        confirmButtonDisabled={loading}
        isSuperUser={isSuperUser}
        isReservationStep={isReservationStep}
        walkInDetails={walkInDetails}
        handleWalkInInputChange={(field, value) =>
          setWalkInDetails({ ...walkInDetails, [field]: value })
        }
      />
    </Container>
  );
}

export default AppointmentsPage;
