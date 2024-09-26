import React, { useEffect } from 'react';
import { Modal, Button, Typography, TextField, Checkbox, FormControlLabel, FormGroup, Box } from '@mui/material';

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
  children,
}) {

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';  // Disable background scroll when modal is open
      document.documentElement.style.overflow = 'hidden'; // Ensure no scroll on html
    } else {
      document.body.style.overflow = '';  // Re-enable scroll when modal is closed
      document.documentElement.style.overflow = ''; // Ensure scroll back on html
    }

    return () => {
      document.body.style.overflow = '';  // Clean up on unmount
      document.documentElement.style.overflow = ''; // Ensure scroll back on html
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
      disableScrollLock={true} // Ensure scroll lock is managed manually
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          bgcolor: '#F0E5D8',  // Warm Cream for background
          boxShadow: 24,
          p: 4,
          width: '100%',
          maxWidth: '500px',  // Limits the width of the modal
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 2,
          margin: '0 16px',  // Ensures some margin on small viewports
          boxSizing: 'border-box',
          borderColor: '#8B5E3C',  // Earthy Brown for the border
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
                  sx={{ color: '#8B5E3C' }}  // Earthy Brown for checkbox
                />
              }
              label="Select All"
              sx={{ color: '#4A4A48' }}  // Deep Charcoal for text
            />
            {dateList.map((date) => (
              <FormControlLabel
                key={date}
                control={
                  <Checkbox 
                    checked={selectedDates.includes(date)}
                    onChange={() => handleDateSelection(date)}
                    sx={{ color: '#8B5E3C' }}  // Earthy Brown for checkbox
                  />
                }
                label={date}
                sx={{ color: '#4A4A48' }}  // Deep Charcoal for text
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
            placeholder="Enter your name, number, and reason"
            InputLabelProps={{ style: { color: '#4A4A48' } }}  // Label color
            InputProps={{
              style: { backgroundColor: '#fff', color: '#4A4A48' },  // Input text and background
            }}
          />
        )}

        {children}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          {isConfirmVisible && (
            <Button
              variant="contained"
              onClick={onConfirm}
              sx={{
                backgroundColor: '#8B5E3C',  // Earthy Brown
                color: '#F0E5D8',  // Warm Cream
                '&:hover': {
                  backgroundColor: '#C2A773',  // Muted Gold hover effect
                },
                mr: 2,
              }}
            >
              {confirmButtonText}
            </Button>
          )}
          <Button 
            variant="contained" 
            onClick={onClose}
            sx={{
              backgroundColor: '#4A4A48',  // Deep Charcoal for secondary action
              color: '#F0E5D8',  // Warm Cream for text
              '&:hover': {
                backgroundColor: '#C2A773',  // Muted Gold hover effect
              },
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default CustomModal;
