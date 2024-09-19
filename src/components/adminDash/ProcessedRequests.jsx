import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Typography, useMediaQuery, Card, CardContent, Box } from '@mui/material';
import moment from 'moment';
import { useTheme } from '@mui/material/styles';

const ProcessedRequests = ({
  processedRequests,
  dayTypeMap,
  openUserDetailsModal,
  handleOpenFlagModal,
  handleStatusChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Adjust for mobile screens

  return (
    <div>
      <Typography variant="h5" component="h2" gutterBottom>
        Processed Requests
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
            {processedRequests.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell onClick={() => openUserDetailsModal(appointment.user)}>
                  {appointment.user.first_name} {appointment.user.last_name} 
                </TableCell>
                <TableCell>
                  {moment(appointment.date).format('MM/DD/YYYY')}
                </TableCell>
                <TableCell>{dayTypeMap[appointment.day_type]}</TableCell>
                <TableCell>{appointment.status_display}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleOpenFlagModal(appointment.id)}
                    disabled={appointment.status === 'flagged'}
                  >
                    Flag
                  </Button>
                  <Button
                    onClick={() =>
                      handleStatusChange(appointment.id, 'to_completion')
                    }
                    disabled={appointment.status === 'to_completion'}
                  >
                    Mark as Completed
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        // Mobile View
        <Box>
          {processedRequests.map((appointment) => (
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
                <Box sx={{ mt: 2 }}>
                  <Button
                    onClick={() => handleOpenFlagModal(appointment.id)}
                    disabled={appointment.status === 'flagged'}
                    size="small"
                  >
                    Flag
                  </Button>
                  <Button
                    onClick={() =>
                      handleStatusChange(appointment.id, 'to_completion')
                    }
                    disabled={appointment.status === 'to_completion'}
                    size="small"
                  >
                    Mark as Completed
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </div>
  );
};

export default ProcessedRequests;
