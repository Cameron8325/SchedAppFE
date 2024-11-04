import React, { useEffect, useContext } from 'react';
import { Modal, Button, Typography, TextField, Checkbox, FormControlLabel, FormGroup, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function CustomModal({
  open,
  onClose,
  title,
  description,
  onConfirm,
  isConfirmVisible,
  confirmButtonText,
  dateList,
  selectedDates,
  handleDateSelection,
  showTextInput, 
  inputValue,    
  handleInputChange,
  isSuperUser, // Add isSuperUser prop
  isReservationStep, // Add isReservationStep prop
  walkInDetails, // Add walkInDetails prop
  handleWalkInInputChange, // Add handleWalkInInputChange to manage walk-in details
  children,
}) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      handleDateSelection(dateList);
    } else {
      handleDateSelection([]);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="custom-modal-title"
      aria-describedby="custom-modal-description"
      disableScrollLock={true}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          bgcolor: '#F0E5D8',
          boxShadow: 24,
          p: 4,
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 2,
          margin: '0 16px',
          borderColor: '#8B5E3C',
        }}
      >
        <Typography variant="h6" id="custom-modal-title" sx={{ color: '#4A4A48' }}>
          {title}
        </Typography>
        <Typography variant="body1" id="custom-modal-description" gutterBottom sx={{ color: '#4A4A48' }}>
          {description}
        </Typography>

        {dateList && dateList.length > 0 && (
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox 
                  onChange={handleSelectAll} 
                  checked={selectedDates.length === dateList.length} 
                  sx={{ color: '#8B5E3C' }}
                />
              }
              label="Select All"
              sx={{ color: '#4A4A48' }}
            />
            {dateList.map((date) => (
              <FormControlLabel
                key={date}
                control={
                  <Checkbox 
                    checked={selectedDates.includes(date)}
                    onChange={() => handleDateSelection(date)}
                    sx={{ color: '#8B5E3C' }}
                  />
                }
                label={date}
                sx={{ color: '#4A4A48' }}
              />
            ))}
          </FormGroup>
        )}

        {showTextInput && (
          <TextField
            label="Reason for flagging"
            fullWidth
            margin="normal"
            value={inputValue}
            onChange={handleInputChange}
            InputLabelProps={{ style: { color: '#4A4A48' } }}
            InputProps={{
              style: { backgroundColor: '#fff', color: '#4A4A48' },
            }}
          />
        )}

        {isReservationStep && isSuperUser && (
          <>
            <TextField
              label="First Name"
              value={walkInDetails.firstName}
              onChange={(e) => handleWalkInInputChange('firstName', e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Last Name"
              value={walkInDetails.lastName}
              onChange={(e) => handleWalkInInputChange('lastName', e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              value={walkInDetails.email}
              onChange={(e) => handleWalkInInputChange('email', e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Phone"
              value={walkInDetails.phone}
              onChange={(e) => handleWalkInInputChange('phone', e.target.value)}
              fullWidth
              margin="normal"
            />
          </>
        )}

        {children}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          {user ? (
            <>
              {isConfirmVisible && (
                <Button
                  variant="contained"
                  onClick={onConfirm}
                  sx={{
                    backgroundColor: '#8B5E3C',
                    color: '#FFF',
                    '&:hover': {
                      backgroundColor: '#C2A773',
                    },
                    mr: 2,
                  }}
                >
                  {confirmButtonText || 'Confirm'}
                </Button>
              )}
              <Button 
                variant="contained" 
                onClick={onClose}
                sx={{
                  backgroundColor: '#4A4A48',
                  color: '#FFF',
                  '&:hover': {
                    backgroundColor: '#C2A773',
                  },
                }}
              >
                Close
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  backgroundColor: '#8B5E3C',
                  color: '#FFF',
                  '&:hover': {
                    backgroundColor: '#C2A773',
                  },
                  mr: 2,
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: '#8B5E3C',
                  color: '#FFF',
                  '&:hover': {
                    backgroundColor: '#C2A773',
                  },
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
}

export default CustomModal;
