import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Typography } from '@mui/material';
import moment from 'moment';

const ProcessedRequests = ({
  processedRequests,
  dayTypeMap,
  openUserDetailsModal,
  handleOpenFlagModal,
  handleStatusChange,
}) => {
  return (
    <div>
      <Typography variant="h5" component="h2" gutterBottom>
        Processed Requests
      </Typography>
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
                {appointment.user.username}
              </TableCell>
              <TableCell>
                {moment(appointment.date).format('MM/DD/YYYY')}
              </TableCell>
              <TableCell>{dayTypeMap[appointment.day_type]}</TableCell>
              <TableCell>{appointment.status_display}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleOpenFlagModal(appointment.id)} // Updated here
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
    </div>
  );
};

export default ProcessedRequests;
