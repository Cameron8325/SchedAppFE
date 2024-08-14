import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment-timezone';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Container, Typography, ButtonGroup, Button } from '@mui/material';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import CustomModal from '../components/modal/CustomModal';

const localizer = momentLocalizer(moment);

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function AppointmentsPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(true);
  const [confirmButtonText, setConfirmButtonText] = useState('Confirm');
  const [selectedDayType, setSelectedDayType] = useState('all');

  const dayTypeMap = useMemo(() => ({
    tea_tasting: 'Tea Tasting',
    intro_gongfu: 'Intro to Gongfu',
    guided_meditation: 'Guided Meditation',
  }), []);

  const query = useQuery();
  const navigate = useNavigate();

  const fetchAppointmentsAndAvailableDays = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
  
      // Fetch appointments
      const appointmentsResponse = await axios.get('http://localhost:8000/api/appointments/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const appointmentsData = appointmentsResponse.data;
  
      // Fetch available days
      const availableDaysResponse = await axios.get('http://localhost:8000/api/available-days/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const availableDaysData = availableDaysResponse.data;
  
      // Group appointments by date and calculate spots left
      const groupedAppointments = appointmentsData.reduce((acc, appointment) => {
        const date = moment(appointment.date).startOf('day').format('YYYY-MM-DD');
        if (!acc[date]) acc[date] = [];
        acc[date].push(appointment);
        return acc;
      }, {});
  
      // Create events combining appointments and available days
      const eventsData = availableDaysData.flatMap(day => {
        const date = moment(day.date).startOf('day').format('YYYY-MM-DD');
        const appointments = groupedAppointments[date] || [];
        const spotsLeft = 4 - appointments.length;
        const dayType = dayTypeMap[day.type]; // Get day type from available days
  
        return [
          {
            start: moment(day.date).toDate(),
            end: moment(day.date).toDate(),
            title: dayType, // Event for day type
            allDay: true,
            backgroundColor: getBackgroundColor(day.type),
            type: day.type
          },
          {
            start: moment(day.date).toDate(),
            end: moment(day.date).toDate(),
            title: spotsLeft === 0 ? 'Fully Booked' : `${spotsLeft} spots left`, // Event for booking status
            allDay: true,
            backgroundColor: spotsLeft === 0 ? '#ff9800' : '#3174ad',
            type: null // This event is purely for status
          }
        ];
      });
  
      const sortedEvents = sortEvents(eventsData); // Apply sorting on initial load
      setEvents(sortedEvents);
      setFilteredEvents(sortedEvents); // Initially show all events
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [dayTypeMap]);
  

  const sortEvents = (events) => {
    return events.sort((a, b) => {
      if (a.type && !b.type) return -1;
      if (!a.type && b.type) return 1;
      return 0;
    });
  };

  useEffect(() => {
    fetchAppointmentsAndAvailableDays();
  }, [fetchAppointmentsAndAvailableDays]);

  useEffect(() => {
    const dayTypeQuery = query.get('dayType');
    if (dayTypeQuery) {
      setSelectedDayType(dayTypeQuery);
    } else {
      setSelectedDayType('all');
    }
  }, [query]);

  useEffect(() => {
    if (selectedDayType === 'all') {
      const sortedEvents = sortEvents(events); // Re-apply sorting when showing all events
      setFilteredEvents(sortedEvents);
    } else {
      const dayTypeEvents = events.filter(event => event.type === selectedDayType);

      const spotsLeftEvents = events.filter(event =>
        event.title.includes('spots left') &&
        dayTypeEvents.some(dayEvent => moment(dayEvent.start).isSame(event.start, 'day'))
      );

      const combinedEvents = sortEvents([...dayTypeEvents, ...spotsLeftEvents]);
      setFilteredEvents(combinedEvents);
    }
  }, [selectedDayType, events]);

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'tea_tasting':
        return '#af4c91';
      case 'intro_gongfu':
        return '#4caf50';
      case 'guided_meditation':
        return '#3f51b5';
      default:
        return '#3174ad';
    }
  };

  const handleSelectSlot = ({ start }) => {
    const today = moment().startOf('day');
    const selected = moment(start).startOf('day');
    const isAvailable = filteredEvents.some(event => moment(event.start).isSame(start, 'day') && event.title !== 'Fully Booked');

    if (selected.isBefore(today)) {
      setModalTitle('Invalid Selection');
      setModalMessage("You cannot select today or past dates for appointments.");
      setIsConfirmVisible(false);
      setModalIsOpen(true);
    } else if (!isAvailable) {
      setModalTitle('Unavailable');
      setModalMessage("We're sorry, this date is currently unavailable.");
      setIsConfirmVisible(false);
      setModalIsOpen(true);
    } else {
      setSelectedDate(start);
      setModalTitle('Reserve Appointment');
      setModalMessage(`Would you like to reserve your appointment for ${start.toDateString()}?`);
      setIsConfirmVisible(true);
      setConfirmButtonText('Confirm');
      setModalIsOpen(true);
    }
  };

  const handleReserve = () => {
    const user = authService.getCurrentUser();

    if (!user || !user.id) {
      console.error('User is not logged in or user ID is missing');
      return;
    }

    const newEvent = {
      user: user.id,
      date: moment(selectedDate).format('YYYY-MM-DD'),
      status: 'pending',
    };

    axios.post('http://localhost:8000/api/appointments/', newEvent, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(response => {
      fetchAppointmentsAndAvailableDays();
      setModalTitle('Appointment Confirmed');
      setModalMessage("Your appointment has been confirmed! We've sent a reminder to your email.");
      setIsConfirmVisible(false);
    }).catch(error => {
      console.error('Error:', error.response ? error.response.data : error.message);
      setModalTitle('Error');
      setModalMessage("Something went wrong. Please try to reserve your appointment again.");
      setIsConfirmVisible(false);
    });
  };

  const eventPropGetter = (event) => {
    return { style: { backgroundColor: event.backgroundColor } };
  };

  const handleDayTypeChange = (type) => {
    setSelectedDayType(type);
    navigate(`/appointments?dayType=${type}`);
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Schedule an Appointment
      </Typography>

      {/* Day Type Filter Buttons */}
      <ButtonGroup variant="contained" color="primary" style={{ marginBottom: '1rem' }}>
        <Button onClick={() => handleDayTypeChange('all')}>All</Button>
        <Button onClick={() => handleDayTypeChange('tea_tasting')}>Tea Tasting</Button>
        <Button onClick={() => handleDayTypeChange('intro_gongfu')}>Intro to Gongfu</Button>
        <Button onClick={() => handleDayTypeChange('guided_meditation')}>Guided Meditation</Button>
      </ButtonGroup>

      <Calendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        style={{ height: 500 }}
        eventPropGetter={eventPropGetter}
      />
      <CustomModal
        open={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        title={modalTitle}
        description={modalMessage}
        onConfirm={handleReserve}
        isConfirmVisible={isConfirmVisible}
        confirmButtonText={confirmButtonText}
      />
    </Container>
  );
}

export default AppointmentsPage;
