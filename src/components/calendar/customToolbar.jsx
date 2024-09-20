import React from "react";
import { ButtonGroup, Button } from "@mui/material";

const CustomToolbar = ({ label, onNavigate, handleDayTypeChange }) => {
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        {/* "Back" and "Next" navigation buttons */}
        <button onClick={() => onNavigate("PREV")}>Back</button>
        <button onClick={() => onNavigate("TODAY")}>Today</button>
        <button onClick={() => onNavigate("NEXT")}>Next</button>
      </span>

      {/* Display current date label (Month and Year) */}
      <span className="rbc-toolbar-label">{label}</span>

      {/* Custom Filter Buttons */}
      <span className="rbc-btn-group">
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
