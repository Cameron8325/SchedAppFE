import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import moment from 'moment';

const ToCompletionRequests = ({
  toCompletionRequests,
  dayTypeMap,
  openUserDetailsModal,
}) => {
  return (
    <div>
      <Typography variant="h5" component="h2" gutterBottom>
        To Completion
      </Typography>
      <Table style={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: '20%' }}>User</TableCell>
            <TableCell style={{ width: '20%' }}>Date</TableCell>
            <TableCell style={{ width: '20%' }}>Day Type</TableCell>
            <TableCell style={{ width: '20%' }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {toCompletionRequests.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell onClick={() => openUserDetailsModal(appointment.user)}>
                {appointment.user.username}
              </TableCell>
              <TableCell>
                {moment(appointment.date).format('MM/DD/YYYY')}
              </TableCell>
              <TableCell>{dayTypeMap[appointment.day_type]}</TableCell>
              <TableCell>{appointment.status_display}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ToCompletionRequests;
