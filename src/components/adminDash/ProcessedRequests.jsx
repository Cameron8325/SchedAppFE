import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Typography,
  useMediaQuery,
  Card,
  CardContent,
  Box,
} from '@mui/material';
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
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ color: '#4A4A48' }}
      >
        Processed Requests
      </Typography>
      {!isMobile ? (
        <Table style={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  color: '#4A4A48',
                  backgroundColor: '#F0E5D8',
                  fontWeight: 'bold',
                }}
                style={{ width: '20%' }}
              >
                User
              </TableCell>
              <TableCell
                sx={{
                  color: '#4A4A48',
                  backgroundColor: '#F0E5D8',
                  fontWeight: 'bold',
                }}
                style={{ width: '20%' }}
              >
                Date
              </TableCell>
              <TableCell
                sx={{
                  color: '#4A4A48',
                  backgroundColor: '#F0E5D8',
                  fontWeight: 'bold',
                }}
                style={{ width: '20%' }}
              >
                Day Type
              </TableCell>
              <TableCell
                sx={{
                  color: '#4A4A48',
                  backgroundColor: '#F0E5D8',
                  fontWeight: 'bold',
                }}
                style={{ width: '20%' }}
              >
                Status
              </TableCell>
              <TableCell
                sx={{
                  color: '#4A4A48',
                  backgroundColor: '#F0E5D8',
                  fontWeight: 'bold',
                }}
                style={{ width: '20%' }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {processedRequests.map((appointment, index) => (
              <TableRow
                key={appointment.id}
                style={{
                  backgroundColor: index % 2 === 0 ? '#FAF8F6' : '#fff',
                }}
              >
                <TableCell
                  onClick={() => openUserDetailsModal(appointment)}
                  sx={{ color: '#4A4A48', cursor: 'pointer' }}
                >
                  {/* Handle user or walk-in details */}
                  {appointment.user
                    ? `${appointment.user.first_name} ${appointment.user.last_name}`
                    : `${appointment.walk_in_first_name} ${appointment.walk_in_last_name}`}
                </TableCell>
                <TableCell sx={{ color: '#4A4A48' }}>
                  {moment(appointment.date).format('MM/DD/YYYY')}
                </TableCell>
                <TableCell sx={{ color: '#4A4A48' }}>
                  {dayTypeMap[appointment.day_type]}
                </TableCell>
                <TableCell sx={{ color: '#4A4A48' }}>
                  {appointment.status_display}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleOpenFlagModal(appointment.id)}
                    disabled={appointment.status === 'flagged'}
                    sx={{
                      backgroundColor: 'inherit',
                      color: '#4A4A48',
                      '&:hover': {
                        backgroundColor: '#E0E0E0',
                      },
                      mr: 1,
                    }}
                  >
                    Flag
                  </Button>
                  <Button
                    onClick={() =>
                      handleStatusChange(appointment.id, 'to_completion')
                    }
                    disabled={appointment.status === 'to_completion'}
                    sx={{
                      backgroundColor: 'inherit',
                      color: '#4A4A48',
                      '&:hover': {
                        backgroundColor: '#E0E0E0',
                      },
                    }}
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
            <Card
              key={appointment.id}
              variant="outlined"
              sx={{ mb: 2, backgroundColor: '#F0E5D8', color: '#4A4A48' }}
            >
              <CardContent>
                <Typography variant="h6">
                  {appointment.user
                    ? `${appointment.user.first_name} ${appointment.user.last_name}`
                    : `${appointment.walk_in_first_name} ${appointment.walk_in_last_name}`}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong>{' '}
                  {moment(appointment.date).format('MM/DD/YYYY')}
                </Typography>
                <Typography variant="body2">
                  <strong>Day Type:</strong>{' '}
                  {dayTypeMap[appointment.day_type]}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {appointment.status_display}
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
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
                  <Button
                    onClick={() =>
                      handleStatusChange(appointment.id, 'to_completion')
                    }
                    disabled={appointment.status === 'to_completion'}
                    sx={{
                      backgroundColor: 'inherit',
                      color: '#4A4A48',
                      '&:hover': {
                        backgroundColor: '#E0E0E0',
                      },
                    }}
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
