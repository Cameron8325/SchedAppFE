import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Typography, TextField, Select, MenuItem } from '@mui/material';
import moment from 'moment';

const AvailabilitySection = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  dayType,
  setDayType,
  markAvailable,
  availableDays,
  dayTypeMap,
  openEditDayTypesModal,
  openRemoveAvailabilityModal,
}) => {
  return (
    <div>
      {/* Set Availability Section */}
      <Typography variant="h6" component="h2" gutterBottom>
        Set Availability
      </Typography>
      <TextField
        type="date"
        label="Start Date"
        InputLabelProps={{
          shrink: true,
        }}
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <TextField
        type="date"
        label="End Date"
        InputLabelProps={{
          shrink: true,
        }}
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <Select
        value={dayType}
        onChange={(e) => setDayType(e.target.value)}
        displayEmpty
      >
        <MenuItem value="" disabled>
          Select Day Type
        </MenuItem>
        <MenuItem value="tea_tasting">Tea Tasting</MenuItem>
        <MenuItem value="intro_gongfu">Intro to Gongfu</MenuItem>
        <MenuItem value="guided_meditation">Guided Meditation</MenuItem>
      </Select>
      <Button variant="contained" color="primary" onClick={markAvailable}>
        Set Availability
      </Button>

      {/* Available Days Section */}
      <Typography variant="h6" component="h2" gutterBottom>
        Available Days
      </Typography>
      <Table style={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: '20%' }}>Date Range</TableCell>
            <TableCell style={{ width: '20%' }}>Day Type</TableCell>
            <TableCell style={{ width: '20%' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {availableDays.map((group, index) => (
            <TableRow key={index}>
              <TableCell>
                {group.length === 1
                  ? moment(group[0].date).format('MM/DD/YYYY')
                  : `${moment(group[0].date).format('MM/DD/YYYY')} - ${moment(
                      group[group.length - 1].date
                    ).format('MM/DD/YYYY')}`}
              </TableCell>
              <TableCell>{dayTypeMap[group[0].type]}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => openEditDayTypesModal(group)}
                >
                  Edit Day Types
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => openRemoveAvailabilityModal(group)}
                >
                  Remove Available
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AvailabilitySection;
