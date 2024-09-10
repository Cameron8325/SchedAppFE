import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Button, Typography } from '@mui/material';
import moment from 'moment';

const IncomingRequests = ({ incomingRequests, dayTypeMap, openUserDetailsModal, handleStatusChange, handleOpenFlagModal }) => {
  return (
    <>
      <Typography variant="h5" component="h2" gutterBottom>
        Incoming Requests
      </Typography>
      <Table style={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: "20%" }}>User</TableCell>
            <TableCell style={{ width: "20%" }}>Date</TableCell>
            <TableCell style={{ width: "20%" }}>Day Type</TableCell>
            <TableCell style={{ width: "20%" }}>Status</TableCell>
            <TableCell style={{ width: "20%" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {incomingRequests.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell onClick={() => openUserDetailsModal(appointment.user)}>
                {appointment.user.first_name} {appointment.user.last_name}
              </TableCell>
              <TableCell>
                {moment(appointment.date).format("MM/DD/YYYY")}
              </TableCell>
              <TableCell>{dayTypeMap[appointment.day_type]}</TableCell>
              <TableCell>{appointment.status_display}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleStatusChange(appointment.id, "approve")}
                  disabled={appointment.status === "confirmed"}
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleStatusChange(appointment.id, "deny")}
                  disabled={appointment.status === "denied"}
                >
                  Deny
                </Button>
                <Button
                  onClick={() => handleOpenFlagModal(appointment.id)}
                  disabled={appointment.status === "flagged"}
                >
                  Flag
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default IncomingRequests;
