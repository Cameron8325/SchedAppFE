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
import { Container, Typography } from "@mui/material";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext
import CustomModal from "../../components/modal/CustomModal";
import CustomToolbar from "../../components/calendar/toolbar/customToolbar.jsx";
import CustomAdminAgenda from "../../components/calendar/agenda/CustomAdminAgenda.jsx";
import "./AppointmentsPage.css";

const localizer = momentLocalizer(moment);

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function AppointmentsPage() {
  const { user, isSuperUser } = useContext(AuthContext); // Access user and isSuperUser from context
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isConfirmVisible, setIsConfirmVisible] = useState(true);
  const [confirmButtonText, setConfirmButtonText] = useState("Confirm");
  const [selectedDayType, setSelectedDayType] = useState("all");
  const [walkInDetails, setWalkInDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  }); // State for walk-in details
  const [isReservationStep, setIsReservationStep] = useState(false); // New state to track the reservation step
  const [currentView, setCurrentView] = useState("month");

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

  const fetchAppointmentsAndAvailableDays = useCallback(async () => {
    try {
      // Fetch appointments and available days without authentication
      const appointmentsResponse = await axios.get(
        "http://localhost:8000/api/appointments/"
      );
      const availableDaysResponse = await axios.get(
        "http://localhost:8000/api/available-days/"
      );

      const appointmentsData = appointmentsResponse.data;
      const availableDaysData = availableDaysResponse.data;

      // Process and combine appointments and available days
      const groupedAppointments = appointmentsData.reduce(
        (acc, appointment) => {
          const date = moment(appointment.date)
            .startOf("day")
            .format("YYYY-MM-DD");
          if (!acc[date]) acc[date] = [];
          acc[date].push(appointment);
          return acc;
        },
        {}
      );

      const eventsData = availableDaysData.flatMap((day) => {
        const date = moment(day.date).startOf("day").format("YYYY-MM-DD");
        const appointments = groupedAppointments[date] || [];
        const spotsLeft = 4 - appointments.length;
        const dayType = dayTypeMap[day.type];

        return [
          {
            start: moment(day.date).toDate(),
            end: moment(day.date).toDate(),
            title: dayType,
            allDay: true,
            backgroundColor: getBackgroundColor(day.type),
            type: day.type,
          },
          {
            start: moment(day.date).toDate(),
            end: moment(day.date).toDate(),
            title: spotsLeft === 0 ? "Fully Booked" : `${spotsLeft} spots left`,
            allDay: true,
            backgroundColor: spotsLeft === 0 ? "#6B7B7A" : "#2389DA",
            type: null,
          },
        ];
      });

      setEvents(eventsData);
      setFilteredEvents(eventsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [dayTypeMap]);

  useEffect(() => {
    fetchAppointmentsAndAvailableDays();
  }, [fetchAppointmentsAndAvailableDays]);

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
        .filter(
          (event) =>
            event.title.includes("spots left") || event.title === "Fully Booked"
        )
        .filter((event) =>
          dayTypeEvents.some((dayEvent) =>
            moment(dayEvent.start).isSame(event.start, "day")
          )
        );
      setFilteredEvents([...dayTypeEvents, ...spotsLeftEvents]);
    }
  }, [selectedDayType, events]);

  const getBackgroundColor = (type) => {
    switch (type) {
      case "tea_tasting":
        return "#8C4A6A"; // Plum Wine
      case "intro_gongfu":
        return "#BF7433"; // Amber
      case "guided_meditation":
        return "#2E706F"; // Deep Sea Green
      default:
        return "#FFF"; // White
    }
  };

  const handleSelectSlot = ({ start }) => {
    const today = moment().startOf("day");
    const selected = moment(start).startOf("day");

    if (!user) {
      setModalTitle("Authentication Required");
      setModalMessage("Please log in or register to reserve an appointment.");
      setIsConfirmVisible(false);
      setIsReservationStep(false); // Not a reservation step
      setModalIsOpen(true);
      return;
    }

    if (selected.isBefore(today)) {
      setModalTitle("Invalid Selection");
      setModalMessage(
        "You cannot select today or past dates for appointments."
      );
      setIsConfirmVisible(false);
      setIsReservationStep(false); // Not a reservation step
      setModalIsOpen(true);
      return;
    }

    const selectedEvent = events.find(
      (event) => moment(event.start).isSame(selected, "day") && event.type
    );

    if (!selectedEvent) {
      setModalTitle("Unavailable Date");
      setModalMessage("The selected date is not available for appointments.");
      setIsConfirmVisible(false);
      setIsReservationStep(false); // Not a reservation step
      setModalIsOpen(true);
      return;
    }

    const isFullyBooked = events.some(
      (event) =>
        moment(event.start).isSame(selected, "day") &&
        event.title === "Fully Booked"
    );

    if (isFullyBooked) {
      setModalTitle("Fully Booked");
      setModalMessage(
        "Sorry, this date is fully booked. Please choose another date."
      );
      setIsConfirmVisible(false);
      setIsReservationStep(false); // Not a reservation step
      setModalIsOpen(true);
      return;
    }

    // Valid reservation step
    setSelectedDate(start);
    setModalTitle("Reserve Appointment");
    setModalMessage(
      `Would you like to reserve your appointment for ${start.toDateString()}?`
    );
    setIsConfirmVisible(true);
    setConfirmButtonText("Confirm");
    setIsReservationStep(true); // This is now a valid reservation step
    setModalIsOpen(true);
  };

  const handleReserve = async () => {
    try {
      if (
        isSuperUser &&
        walkInDetails.firstName &&
        walkInDetails.lastName &&
        walkInDetails.email &&
        walkInDetails.phone
      ) {
        const walkInEvent = {
          walk_in_first_name: walkInDetails.firstName,
          walk_in_last_name: walkInDetails.lastName,
          walk_in_email: walkInDetails.email,
          walk_in_phone: walkInDetails.phone,
          date: moment(selectedDate).format("YYYY-MM-DD"),
          status: "pending",
        };

        await axios.post(
          "http://localhost:8000/api/appointments/",
          walkInEvent,
          { withCredentials: true }
        );
      } else if (user) {
        const newEvent = {
          user: user.id,
          date: moment(selectedDate).format("YYYY-MM-DD"),
          status: "pending",
        };

        await axios.post("http://localhost:8000/api/appointments/", newEvent, {
          withCredentials: true,
        });
      } else {
        throw new Error("Unauthorized");
      }

      await fetchAppointmentsAndAvailableDays(); // Refresh events after booking
      setModalTitle("Appointment Confirmed");
      setModalMessage(
        "Your appointment has been confirmed! We've sent a reminder to your email."
      );
      setIsConfirmVisible(false);
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      setModalTitle("Error");
      setModalMessage(
        "Something went wrong. Please try to reserve your appointment again."
      );
      setIsConfirmVisible(false);
    }
  };

  return (
    <Container>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ marginTop: "2vh" }}
      >
        Schedule an Appointment
      </Typography>

      <Calendar
        localizer={localizer}
        events={filteredEvents}
        views={{ month: true, agenda: CustomAdminAgenda }}
        onView={(view) => setCurrentView(view)}
        view={currentView}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectSlot}
        style={{ height: 500 }}
        eventPropGetter={(event) => ({
          style: { backgroundColor: event.backgroundColor },
        })}
        longPressThreshold={1}
        components={{
          toolbar: (props) => (
            <CustomToolbar
              {...props}
              currentView={currentView}
              isSuperUser={isSuperUser}
              handleDayTypeChange={(type) =>
                navigate(`/appointments?dayType=${type}`)
              }
            />
          ),
        }}
      />

      <CustomModal
        open={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        title={modalTitle}
        description={modalMessage}
        onConfirm={handleReserve}
        isConfirmVisible={isConfirmVisible}
        confirmButtonText={confirmButtonText}
        isSuperUser={isSuperUser} // Pass isSuperUser
        isReservationStep={isReservationStep} // Pass isReservationStep
        walkInDetails={walkInDetails} // Pass walk-in details
        handleWalkInInputChange={(field, value) =>
          setWalkInDetails({ ...walkInDetails, [field]: value })
        } // Handle changes to walk-in details
      ></CustomModal>
    </Container>
  );
}

export default AppointmentsPage;
