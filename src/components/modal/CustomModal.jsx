// src/components/CustomModal.js
import React from 'react';
import { Modal, Button, Typography } from '@mui/material';

function CustomModal({ open, onClose, title, description, onConfirm, isConfirmVisible, confirmButtonText }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="custom-modal-title"
      aria-describedby="custom-modal-description"
    >
      <div style={{ margin: '20px', padding: '20px', backgroundColor: 'white' }}>
        <Typography variant="h6" id="custom-modal-title">
          {title}
        </Typography>
        <Typography variant="body1" id="custom-modal-description">
          {description}
        </Typography>
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
