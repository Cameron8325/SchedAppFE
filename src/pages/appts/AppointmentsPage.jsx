// src/pages/appts/AppointmentsPage.jsx

import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment-timezone';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Container, Typography } from '@mui/material';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext
import CustomModal from '../../components/modal/CustomModal';
import CustomToolbar from '../../components/calendar/customToolbar';
import './AppointmentsPage.css';

const localizer = momentLocalizer(moment);

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function AppointmentsPage() {
    const { user } = useContext(AuthContext); // Access user from context
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
            // Fetch appointments
            const appointmentsResponse = await axios.get('http://localhost:8000/api/appointments/', {
                withCredentials: true  // Ensures cookies are sent automatically
            });
            console.log('Appointments Data:', appointmentsResponse.data);
            const appointmentsData = appointmentsResponse.data;

            // Fetch available days
            const availableDaysResponse = await axios.get('http://localhost:8000/api/available-days/', {
                withCredentials: true  // Ensures cookies are sent automatically
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
                        backgroundColor: spotsLeft === 0 ? '#546E7A' : '#3174ad',
                        type: null // This event is purely for status
                    }
                ];
            });

            // Sort and set events
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
            // Filter for day type events
            const dayTypeEvents = events.filter(event => event.type === selectedDayType);
    
            // Filter for booking status events and ensure they are for the same days as the day type events
            const spotsLeftEvents = events.filter(event =>
                event.title.includes('spots left') || event.title === 'Fully Booked'
            ).filter(event =>
                dayTypeEvents.some(dayEvent => moment(dayEvent.start).isSame(event.start, 'day'))
            );
    
            const combinedEvents = sortEvents([...dayTypeEvents, ...spotsLeftEvents]);
            setFilteredEvents(combinedEvents);
        }
    }, [selectedDayType, events]);

    const getBackgroundColor = (type) => {
        switch (type) {
            case 'tea_tasting':
                return '#5B3758';  // Muted plum
            case 'intro_gongfu':
                return '#A04E2E';  // Sage green
            case 'guided_meditation':
                return '#495C8D';  // Subdued indigo
            default:
                return '#4A6A8F';  // Desaturated blue
        }
    };

    const handleSelectSlot = ({ start }) => {
        const today = moment().startOf('day');
        const selected = moment(start).startOf('day');

        if (!user) {
            // Show modal to sign in or register if not logged in
            setModalTitle('Please Sign In to Continue');
            setModalMessage("To reserve an appointment, you need to sign in or create an account.");
            setIsConfirmVisible(true);  // Show confirm button
            setConfirmButtonText('Sign In'); // You can also dynamically set button text here if needed
            setModalIsOpen(true);
            return;
        }

        const isFullyBooked = filteredEvents.some(event => 
            moment(event.start).isSame(start, 'day') && event.title === 'Fully Booked'
        );
        
        const isAvailable = filteredEvents.some(event => 
            moment(event.start).isSame(start, 'day') && event.title !== 'Fully Booked'
        );
        
        if (selected.isBefore(today)) {
            setModalTitle('Invalid Selection');
            setModalMessage("You cannot select today or past dates for appointments.");
            setIsConfirmVisible(false);
            setModalIsOpen(true);
        } else if (isFullyBooked) {
            setModalTitle('Fully Booked');
            setModalMessage("We're sorry, this date is fully booked.");
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

    const handleReserve = async () => {
        if (!user) {
            setModalTitle('Authentication Required');
            setModalMessage("Please log in to reserve an appointment.");
            setIsConfirmVisible(false);
            return;
        }

        const newEvent = {
            user: user.id,
            date: moment(selectedDate).format('YYYY-MM-DD'),
            status: 'pending',
        };

        try {
            await axios.post('http://localhost:8000/api/appointments/', newEvent, {
                withCredentials: true, // Ensure cookies are sent
            });
            await fetchAppointmentsAndAvailableDays(); // Refresh events
            setModalTitle('Appointment Confirmed');
            setModalMessage("Your appointment has been confirmed! We've sent a reminder to your email.");
            setIsConfirmVisible(false);
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
            setModalTitle('Error');
            setModalMessage("Something went wrong. Please try to reserve your appointment again.");
            setIsConfirmVisible(false);
        }
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
            <Typography variant="h4" component="h1" gutterBottom sx={{ marginTop: '2vh' }}>
                Schedule an Appointment
            </Typography>

            <Calendar
                localizer={localizer}
                events={filteredEvents}
                views={['month']}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectSlot}
                style={{ height: 500 }}
                eventPropGetter={eventPropGetter}
                longPressThreshold={1}
                components={{
                    toolbar: (props) => (
                        <CustomToolbar
                            {...props}
                            handleDayTypeChange={handleDayTypeChange}
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
            />
        </Container>
    );
}

export default AppointmentsPage;
