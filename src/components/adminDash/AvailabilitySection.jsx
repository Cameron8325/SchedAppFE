import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Typography, TextField, Select, MenuItem, Card, CardContent, Box, useMediaQuery } from '@mui/material';
import moment from 'moment';
import { useTheme } from '@mui/material/styles';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Adjust for mobile screens

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
        sx={{ mb: 2, width: isMobile ? '100%' : 'auto' }}
      />
      <TextField
        type="date"
        label="End Date"
        InputLabelProps={{
          shrink: true,
        }}
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        sx={{ mb: 2, ml: isMobile ? 0 : 2, width: isMobile ? '100%' : 'auto' }}
      />
      <Select
        value={dayType}
        onChange={(e) => setDayType(e.target.value)}
        displayEmpty
        sx={{ mb: 2, width: isMobile ? '100%' : 'auto' }}
      >
        <MenuItem value="" disabled>
          Select Day Type
        </MenuItem>
        <MenuItem value="tea_tasting">Tea Tasting</MenuItem>
        <MenuItem value="intro_gongfu">Intro to Gongfu</MenuItem>
        <MenuItem value="guided_meditation">Guided Meditation</MenuItem>
      </Select>
      <Button variant="contained" color="primary" onClick={markAvailable} sx={{ mb: 3, width: isMobile ? '100%' : 'auto' }}>
        Set Availability
      </Button>

      {/* Available Days Section */}
      <Typography variant="h6" component="h2" gutterBottom>
        Available Days
      </Typography>
      {!isMobile ? (
        <Table style={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '30%' }}>Date Range</TableCell>
              <TableCell style={{ width: '30%' }}>Day Type</TableCell>
              <TableCell style={{ width: '40%' }}>Actions</TableCell>
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
                    sx={{ mr: 2 }}
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
      ) : (
        // Mobile View - Display as cards
        <Box>
          {availableDays.map((group, index) => (
            <Card key={index} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="body1">
                  <strong>Date Range: </strong>
                  {group.length === 1
                    ? moment(group[0].date).format('MM/DD/YYYY')
                    : `${moment(group[0].date).format('MM/DD/YYYY')} - ${moment(
                        group[group.length - 1].date
                      ).format('MM/DD/YYYY')}`}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Day Type: </strong>
                  {dayTypeMap[group[0].type]}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => openEditDayTypesModal(group)}
                    sx={{ mr: 2 }}
                  >
                    Edit Day Types
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => openRemoveAvailabilityModal(group)}
                  >
                    Remove Available
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

export default AvailabilitySection;
