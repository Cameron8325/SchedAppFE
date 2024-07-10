import React, { useState, useEffect } from 'react';
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
    const [unavailableDays, setUnavailableDays] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        fetchAppointments();
        fetchUnavailableDays();
    }, []);

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/appointments/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = response.data;
            const aggregatedData = {};
            data.forEach(event => {
                const date = moment(event.date).format('YYYY-MM-DD');
                if (!aggregatedData[date]) {
                    aggregatedData[date] = { date, spots_left: 4 };
                }
                aggregatedData[date].spots_left -= 1;
            });
            const transformedData = Object.values(aggregatedData).map(event => {
                let title = `${event.spots_left} spots left`;
                let backgroundColor = '#3174ad';
                if (event.spots_left === 0) {
                    title = 'Fully Booked';
                    backgroundColor = '#4caf50';
                }
                return {
                    start: moment(event.date).toDate(),
                    end: moment(event.date).toDate(),
                    title,
                    allDay: true,
                    backgroundColor,
                    spots_left: event.spots_left
                };
            });
            setEvents(transformedData);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const fetchUnavailableDays = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/unavailable-days/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = response.data;
            const transformedData = data.map(day => ({
                start: new Date(day.date),
                end: new Date(day.date),
                title: day.reason || 'Unavailable',
                allDay: true,
                backgroundColor: '#d3d3d3',
            }));
            setUnavailableDays(transformedData);
        } catch (error) {
            console.error('Error fetching unavailable days:', error);
        }
    };

    const handleSelectSlot = ({ start }) => {
        const today = moment().startOf('day');
        const selected = moment(start).startOf('day');
        const isUnavailable = unavailableDays.some(day => moment(day.start).isSame(start, 'day'));
        const isFullyBooked = events.some(event => moment(event.start).isSame(start, 'day') && event.spots_left === 0);
        
        if (selected.isBefore(today)) {
            setModalMessage("You cannot select today or past dates for appointments.");
            setModalIsOpen(true);
        } else if (isUnavailable) {
            setModalMessage("We're sorry, this date is currently unavailable.");
            setModalIsOpen(true);
        } else if (isFullyBooked) {
            setModalMessage("We're sorry, this date is currently fully booked.");
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
            fetchAppointments();
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
                events={[...events, ...unavailableDays]}
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
