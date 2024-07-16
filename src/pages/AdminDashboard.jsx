import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import axios from 'axios';
import moment from 'moment';

function AdminDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [unavailableDays, setUnavailableDays] = useState([]);
    const [unavailableDate, setUnavailableDate] = useState(null);
    const [reason, setReason] = useState('');

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
            if (Array.isArray(data)) {
                const transformedData = data.map(appointment => ({
                    ...appointment,
                    date: moment(appointment.date).format('YYYY-MM-DD')
                }));
                setAppointments(transformedData);
            } else {
                console.error('Unexpected data format:', data);
            }
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
            setUnavailableDays(response.data);
        } catch (error) {
            console.error('Error fetching unavailable days:', error);
        }
    };

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8000/api/appointments/${id}/approve/`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchAppointments(); // Refresh appointments
        } catch (error) {
            console.error('Error approving appointment:', error);
        }
    };

    const handleDeny = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8000/api/appointments/${id}/deny/`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchAppointments(); // Refresh appointments
        } catch (error) {
            console.error('Error denying appointment:', error);
        }
    };

    const markUnavailable = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8000/api/unavailable-days/', { date: unavailableDate, reason }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            alert('Date marked as unavailable');
            fetchUnavailableDays(); // Refresh unavailable days
        } catch (error) {
            console.error('Error marking date as unavailable:', error);
        }
    };

    const handleRemoveUnavailable = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/unavailable-days/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            alert('Unavailable day removed');
            fetchUnavailableDays(); // Refresh unavailable days
        } catch (error) {
            console.error('Error removing unavailable day:', error);
        }
    };

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Admin Dashboard
            </Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {appointments.map(appointment => (
                        <TableRow key={appointment.id}>
                            <TableCell>{appointment.user.username}</TableCell>
                            <TableCell>{moment(appointment.date).format('MM/DD/YYYY')}</TableCell>
                            <TableCell>{appointment.status}</TableCell>
                            <TableCell>
                                <Button onClick={() => handleApprove(appointment.id)} disabled={appointment.status === 'confirmed'}>
                                    Approve
                                </Button>
                                <Button onClick={() => handleDeny(appointment.id)} disabled={appointment.status === 'denied'}>
                                    Deny
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div>
                <Typography variant="h6" component="h2" gutterBottom>
                    Mark a Date as Unavailable
                </Typography>
                <input type="date" onChange={(e) => setUnavailableDate(e.target.value)} />
                <input type="text" placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
                <Button variant="contained" color="primary" onClick={markUnavailable}>
                    Mark Unavailable
                </Button>
            </div>
            <div>
                <Typography variant="h6" component="h2" gutterBottom>
                    Unavailable Days
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Reason</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {unavailableDays.map(day => (
                            <TableRow key={day.id}>
                                <TableCell>{moment(day.date).format('MM/DD/YYYY')}</TableCell>
                                <TableCell>{day.reason}</TableCell>
                                <TableCell>
                                    <Button variant="contained" color="secondary" onClick={() => handleRemoveUnavailable(day.id)}>
                                        Remove Unavailable
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Container>
    );
}

export default AdminDashboard;
