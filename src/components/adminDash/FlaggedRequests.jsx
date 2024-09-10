import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Typography } from '@mui/material';
import moment from 'moment';

const FlaggedRequests = ({
  flaggedRequests,
  dayTypeMap,
  openUserDetailsModal,
  openReasonModal,
  handleStatusChange,
}) => {
  return (
    <div>
      <Typography variant="h5" component="h2" gutterBottom>
        Flagged Requests
      </Typography>
      <Table style={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: '20%' }}>User</TableCell>
            <TableCell style={{ width: '20%' }}>Date</TableCell>
            <TableCell style={{ width: '20%' }}>Day Type</TableCell>
            <TableCell style={{ width: '20%' }}>Reason</TableCell>
            <TableCell style={{ width: '20%' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {flaggedRequests.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell onClick={() => openUserDetailsModal(appointment.user)}>
              {appointment.user.first_name} {appointment.user.last_name} 
              </TableCell>
              <TableCell>
                {moment(appointment.date).format('MM/DD/YYYY')}
              </TableCell>
              <TableCell>{dayTypeMap[appointment.day_type]}</TableCell>
              <TableCell>
                <Button
                  onClick={() => openReasonModal(appointment.reason)}
                  variant="outlined"
                >
                  View Reason
                </Button>
              </TableCell>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FlaggedRequests;
