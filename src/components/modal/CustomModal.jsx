import React from 'react';
import { Modal, Button, Typography, Checkbox, FormControlLabel, FormGroup } from '@mui/material';

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
  children 
}) {
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Select all dates
      handleDateSelection(dateList);
    } else {
      // Deselect all dates
      handleDateSelection([]);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="custom-modal-title"
      aria-describedby="custom-modal-description"
    >
      <div style={{ margin: '20px', padding: '20px', backgroundColor: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400 }}>
        <Typography variant="h6" id="custom-modal-title">
          {title}
        </Typography>
        <Typography variant="body1" id="custom-modal-description">
          {description}
        </Typography>
        {dateList && (
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox 
                  onChange={handleSelectAll} 
                  checked={selectedDates.length === dateList.length} // Checked if all dates are selected
                />
              }
              label="Select All"
            />
            {dateList.map(date => (
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
        {children}
        {isConfirmVisible && (
          <Button variant="contained" color="primary" onClick={onConfirm} style={{ marginRight: '10px' }}>
            {confirmButtonText}
          </Button>
        )}
        <Button variant="contained" color="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

export default CustomModal;
