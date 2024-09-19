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
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          width: '100%',
          maxWidth: '500px',  // Limits the width of the modal
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 2,
          margin: '0 16px',  // Ensures some margin on small viewports
          boxSizing: 'border-box',
        }}
      >
        <Typography variant="h6" id="custom-modal-title">
          {title}
        </Typography>
        <Typography variant="body1" id="custom-modal-description" gutterBottom>
          {description}
        </Typography>

        {dateList && dateList.length > 0 && (
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox 
                  onChange={handleSelectAll} 
                  checked={selectedDates.length === dateList.length} 
                />
              }
              label="Select All"
            />
            {dateList.map((date) => (
              <FormControlLabel
                key={date}
                control={
                  <Checkbox 
                    checked={selectedDates.includes(date)}
                    onChange={() => handleDateSelection(date)}
                  />
                }
                label={date}
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
          />
        )}

        {children}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          {isConfirmVisible && (
            <Button
              variant="contained"
              color="primary"
              onClick={onConfirm}
              sx={{ mr: 2 }}
            >
              {confirmButtonText}
            </Button>
          )}
          <Button variant="contained" color="secondary" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default CustomModal;
