import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment-timezone';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Container, Typography, Modal, Button } from '@mui/material';
import authService from '../services/authService';
import axios from 'axios';

const localizer = momentLocalizer(moment);

function AppointmentsPage() {
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

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
            setModalMessage("You cannot select today or past dates for appointments.");
            setModalIsOpen(true);
        } else if (!isAvailable) {
            setModalMessage("We're sorry, this date is currently unavailable.");
            setModalIsOpen(true);
        } else {
            setSelectedDate(start);
            setModalMessage(`Would you like to reserve your appointment for ${start.toDateString()}?`);
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
            setModalIsOpen(false);
        }).catch(error => {
            console.error('Error:', error.response ? error.response.data : error.message);
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
            <Modal
                open={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div style={{ margin: '20px', padding: '20px', backgroundColor: 'white' }}>
                    <h2 id="simple-modal-title">Reserve Appointment</h2>
                    <p id="simple-modal-description">{modalMessage}</p>
                    {selectedDate && modalMessage.includes('Would you like to reserve your appointment for') && (
                        <Button variant="contained" color="primary" onClick={handleReserve}>
                            Reserve
                        </Button>
                    )}
                    <Button variant="contained" color="secondary" onClick={() => setModalIsOpen(false)}>
                        Close
                    </Button>
                </div>
            </Modal>
        </Container>
    );
}

export default AppointmentsPage;
