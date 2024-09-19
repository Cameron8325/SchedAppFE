import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Button, Typography, useMediaQuery, Card, CardContent, Box } from '@mui/material';
import moment from 'moment';
import { useTheme } from '@mui/material/styles';

const IncomingRequests = ({ incomingRequests, dayTypeMap, openUserDetailsModal, handleStatusChange, handleOpenFlagModal }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Adjust for mobile screens

  return (
    <>
      <Typography variant="h5" component="h2" gutterBottom>
        Incoming Requests
      </Typography>
      {!isMobile ? (
        <Table style={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '20%' }}>User</TableCell>
              <TableCell style={{ width: '20%' }}>Date</TableCell>
              <TableCell style={{ width: '20%' }}>Day Type</TableCell>
              <TableCell style={{ width: '20%' }}>Status</TableCell>
              <TableCell style={{ width: '20%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incomingRequests.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell onClick={() => openUserDetailsModal(appointment.user)}>
                  {appointment.user.first_name} {appointment.user.last_name}
                </TableCell>
                <TableCell>{moment(appointment.date).format('MM/DD/YYYY')}</TableCell>
                <TableCell>{dayTypeMap[appointment.day_type]}</TableCell>
                <TableCell>{appointment.status_display}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleStatusChange(appointment.id, 'approve')}
                    disabled={appointment.status === 'confirmed'}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(appointment.id, 'deny')}
                    disabled={appointment.status === 'denied'}
                  >
                    Deny
                  </Button>
                  <Button
                    onClick={() => handleOpenFlagModal(appointment.id)}
                    disabled={appointment.status === 'flagged'}
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
            <Card key={appointment.id} variant="outlined" sx={{ mb: 2 }}>
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
                    size="medium"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(appointment.id, 'deny')}
                    disabled={appointment.status === 'denied'}
                    size="medium"
                  >
                    Deny
                  </Button>
                  <Button
                    onClick={() => handleOpenFlagModal(appointment.id)}
                    disabled={appointment.status === 'flagged'}
                    size="medium"
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
