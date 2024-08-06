// src/pages/AppointmentsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment-timezone';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Container, Typography } from '@mui/material';
import axios from 'axios';
import authService from '../services/authService';
import CustomModal from '../components/modal/CustomModal';

const localizer = momentLocalizer(moment);

function AppointmentsPage() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(true);
  const [confirmButtonText, setConfirmButtonText] = useState('Confirm');

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
      const eventsData = Object.keys(groupedAppointments).map(date => {
        const appointments = groupedAppointments[date];
        const spotsLeft = 4 - appointments.length;
        return {
          start: moment(date).toDate(),
          end: moment(date).toDate(),
          title: spotsLeft === 0 ? 'Fully Booked' : `${spotsLeft} spots left`,
          allDay: true,
          backgroundColor: spotsLeft === 0 ? '#ff9800' : '#3174ad'
        };
      });

      const filteredAvailableDays = availableDaysData.filter(day => {
        const date = moment(day.date).startOf('day').format('YYYY-MM-DD');
        return !groupedAppointments[date] || groupedAppointments[date].length < 4;
      });

      const availableDaysEvents = filteredAvailableDays.map(day => ({
        start: moment(day.date).startOf('day').toDate(),
        end: moment(day.date).startOf('day').toDate(),
        title: day.reason || 'Available',
        allDay: true,
        backgroundColor: '#4caf50',
      }));

      setEvents([...eventsData, ...availableDaysEvents]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchAppointmentsAndAvailableDays();
  }, [fetchAppointmentsAndAvailableDays]);

  const handleSelectSlot = ({ start }) => {
    const today = moment().startOf('day');
    const selected = moment(start).startOf('day');
    const isAvailable = events.some(event => moment(event.start).isSame(start, 'day') && event.title !== 'Fully Booked');

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

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Schedule an Appointment
      </Typography>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        style={{ height: 500 }}
        eventPropGetter={(event) => ({
          style: { backgroundColor: event.backgroundColor || '#3174ad' }
        })}
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
