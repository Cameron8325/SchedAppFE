import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Button, Typography, useMediaQuery, Card, CardContent, Box } from '@mui/material';
import moment from 'moment';
import { useTheme } from '@mui/material/styles';

const IncomingRequests = ({ incomingRequests, dayTypeMap, openUserDetailsModal, handleStatusChange, handleOpenFlagModal }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Adjust for mobile screens

  return (
    <>
      <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#4A4A48' }}>
        Incoming Requests
      </Typography>
      {!isMobile ? (
        <Table style={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '20%', backgroundColor: '#F0E5D8', color: '#4A4A48', fontWeight: 'bold' }}>User</TableCell>
              <TableCell style={{ width: '20%', backgroundColor: '#F0E5D8', color: '#4A4A48', fontWeight: 'bold' }}>Date</TableCell>
              <TableCell style={{ width: '20%', backgroundColor: '#F0E5D8', color: '#4A4A48', fontWeight: 'bold' }}>Day Type</TableCell>
              <TableCell style={{ width: '20%', backgroundColor: '#F0E5D8', color: '#4A4A48', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell style={{ width: '20%', backgroundColor: '#F0E5D8', color: '#4A4A48', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incomingRequests.map((appointment, index) => (
              <TableRow key={appointment.id} style={{ backgroundColor: index % 2 === 0 ? '#FAF8F6' : '#fff' }}>
                <TableCell onClick={() => openUserDetailsModal(appointment.user)} style={{ color: '#4A4A48' }}>
                  {appointment.user.first_name} {appointment.user.last_name}
                </TableCell>
                <TableCell style={{ color: '#4A4A48' }}>{moment(appointment.date).format('MM/DD/YYYY')}</TableCell>
                <TableCell style={{ color: '#4A4A48' }}>{dayTypeMap[appointment.day_type]}</TableCell>
                <TableCell style={{ color: '#4A4A48' }}>{appointment.status_display}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleStatusChange(appointment.id, 'approve')}
                    disabled={appointment.status === 'confirmed'}
                    sx={{
                      backgroundColor: 'inherit',
                      color: '#4A4A48',
                      '&:hover': {
                        backgroundColor: '#E0E0E0',  // Light hover effect
                      },
                      mr: 1,
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(appointment.id, 'deny')}
                    disabled={appointment.status === 'denied'}
                    sx={{
                      backgroundColor: 'inherit',
                      color: '#4A4A48',
                      '&:hover': {
                        backgroundColor: '#E0E0E0',
                      },
                      mr: 1,
                    }}
                  >
                    Deny
                  </Button>
                  <Button
                    onClick={() => handleOpenFlagModal(appointment.id)}
                    disabled={appointment.status === 'flagged'}
                    sx={{
                      backgroundColor: 'inherit',
                      color: '#4A4A48',
                      '&:hover': {
                        backgroundColor: '#E0E0E0',
                      },
                    }}
                  >
                    Flag
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        // Mobile View
        <Box>
          {incomingRequests.map((appointment) => (
            <Card key={appointment.id} variant="outlined" sx={{ mb: 2, backgroundColor: '#F0E5D8', color: '#4A4A48' }}>
              <CardContent>
                <Typography variant="h6">
                  {appointment.user.first_name} {appointment.user.last_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {moment(appointment.date).format('MM/DD/YYYY')}
                </Typography>
                <Typography variant="body2">
                  <strong>Day Type:</strong> {dayTypeMap[appointment.day_type]}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {appointment.status_display}
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "space-between", // Evenly distribute buttons
                    width: "100%",
                  }}
                >
                  <Button
                    onClick={() => handleStatusChange(appointment.id, 'approve')}
                    disabled={appointment.status === 'confirmed'}
                    sx={{
                      backgroundColor: 'inherit',
                      color: '#4A4A48',
                      '&:hover': {
                        backgroundColor: '#E0E0E0',
                      },
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(appointment.id, 'deny')}
                    disabled={appointment.status === 'denied'}
                    sx={{
                      backgroundColor: 'inherit',
                      color: '#4A4A48',
                      '&:hover': {
                        backgroundColor: '#E0E0E0',
                      },
                    }}
                  >
                    Deny
                  </Button>
                  <Button
                    onClick={() => handleOpenFlagModal(appointment.id)}
                    disabled={appointment.status === 'flagged'}
                    sx={{
                      backgroundColor: 'inherit',
                      color: '#4A4A48',
                      '&:hover': {
                        backgroundColor: '#E0E0E0',
                      },
                    }}
                  >
                    Flag
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </>
  );
};

export default IncomingRequests;
