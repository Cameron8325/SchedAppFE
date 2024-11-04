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
    <Card 
      sx={{ 
        backgroundColor: 'rgba(240, 229, 216, 0.85)',  // Slightly opaque background (Warm cream color with opacity)
        padding: 3, 
        borderRadius: 2,
        boxShadow: 3,  // Light shadow for depth
        mb: 3,  // Margin bottom for spacing
      }}
    >
      <CardContent>
        {/* Set Availability Section */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#4A4A48' }}>
          Set Availability
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
          <TextField
            type="date"
            label="Start Date"
            InputLabelProps={{
              shrink: true,
            }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ mb: 2, flex: 1 }}
          />
          <TextField
            type="date"
            label="End Date"
            InputLabelProps={{
              shrink: true,
            }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            sx={{ mb: 2, flex: 1 }}
          />
          <Select
            value={dayType}
            onChange={(e) => setDayType(e.target.value)}
            displayEmpty
            sx={{ mb: 2, flex: 1 }}
          >
            <MenuItem value="" disabled>
              Select Day Type
            </MenuItem>
            <MenuItem value="tea_tasting">Tea Tasting</MenuItem>
            <MenuItem value="intro_gongfu">Intro to Gongfu</MenuItem>
            <MenuItem value="guided_meditation">Guided Meditation</MenuItem>
          </Select>
        </Box>
        <Button
          variant="contained"
          onClick={markAvailable}
          sx={{
            mb: 3,
            backgroundColor: '#8B5E3C',  // Earthy Brown
            color: '#FFF',  // White
            '&:hover': {
              backgroundColor: '#704A35',  // Darker brown hover effect
            },
            width: isMobile ? '100%' : 'auto',
          }}
        >
          Set Availability
        </Button>

        {/* Available Days Section */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#4A4A48' }}>
          Available Days
        </Typography>
        {!isMobile ? (
          <Table style={{ tableLayout: 'fixed', marginBottom: '2rem' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#4A4A48', backgroundColor: '#F0E5D8', fontWeight: 'bold' }} style={{ width: '30%' }}>Date Range</TableCell>
                <TableCell sx={{ color: '#4A4A48', backgroundColor: '#F0E5D8', fontWeight: 'bold' }} style={{ width: '30%' }}>Day Type</TableCell>
                <TableCell sx={{ color: '#4A4A48', backgroundColor: '#F0E5D8', fontWeight: 'bold' }} style={{ width: '40%' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availableDays.map((group, index) => (
                <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? '#FAF8F6' : '#fff' }}>
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
                      onClick={() => openEditDayTypesModal(group)}
                      sx={{
                        mr: 2,
                        backgroundColor: '#8B5E3C',  // Earthy Brown
                        color: '#FFF',  // White
                        '&:hover': {
                          backgroundColor: '#704A35',  // Darker brown hover effect
                        },
                      }}
                    >
                      Edit Day Types
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => openRemoveAvailabilityModal(group)}
                      sx={{
                        backgroundColor: '#C2A773',  // Muted Gold
                        color: '#FFF',  // White
                        '&:hover': {
                          backgroundColor: '#A9905E',  // Darker muted gold hover
                        },
                      }}
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
              <Card key={index} variant="outlined" sx={{ mb: 2, backgroundColor: '#F0E5D8', color: '#4A4A48' }}>
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
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      justifyContent: "space-between", // Evenly distribute buttons
                      width: "100%",
                    }}
                  >
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={() => openEditDayTypesModal(group)}
                      sx={{
                        mr: 2,
                        backgroundColor: '#8B5E3C',
                        color: '#F0E5D8',
                        '&:hover': {
                          backgroundColor: '#704A35',
                        },
                      }}
                    >
                      Edit Day Types
                    </Button>
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={() => openRemoveAvailabilityModal(group)}
                      sx={{
                        backgroundColor: '#C2A773',
                        color: '#F0E5D8',
                        '&:hover': {
                          backgroundColor: '#A9905E',
                        },
                      }}
                    >
                      Remove Available
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilitySection;
