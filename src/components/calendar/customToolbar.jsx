import React from "react";
import { ButtonGroup, Button } from "@mui/material";
import './customToolbar.css';

const CustomToolbar = ({ label, onNavigate, handleDayTypeChange }) => {
  return (
    <div className="rbc-toolbar">
      {/* Navigation Buttons */}
      <span className="rbc-btn-group navigation-buttons">
        <ButtonGroup>
          <Button onClick={() => onNavigate("PREV")} sx={{ textTransform: 'none'}}>Back</Button>
          <Button onClick={() => onNavigate("TODAY")} sx={{ textTransform: 'none'}}>Today</Button>
          <Button onClick={() => onNavigate("NEXT")} sx={{ textTransform: 'none'}}>Next</Button>
        </ButtonGroup>
      </span>

      {/* Current Date Label */}
      <span className="rbc-toolbar-label">{label}</span>

      {/* Filter Buttons */}
      <span className="rbc-btn-group filter-buttons">
        <ButtonGroup color="primary">
          <Button sx={{ textTransform: 'none' }} onClick={() => handleDayTypeChange("all")}>All</Button>
          <Button sx={{ textTransform: 'none' }} onClick={() => handleDayTypeChange("tea_tasting")}>
            Tea Tasting
          </Button>
          <Button sx={{ textTransform: 'none' }} onClick={() => handleDayTypeChange("intro_gongfu")}>
            Intro to Gongfu
          </Button>
          <Button sx={{ textTransform: 'none' }} onClick={() => handleDayTypeChange("guided_meditation")}>
            Guided Meditation
          </Button>
        </ButtonGroup>
      </span>
    </div>
  );
};

export default CustomToolbar;
