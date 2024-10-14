import React from "react";
import { ButtonGroup, Button } from "@mui/material";
import './customToolbar.css';

const CustomToolbar = ({ label, onNavigate, onView, handleDayTypeChange, isSuperUser, currentView }) => {
  const handleViewSwitch = () => {
    // Switch between "agenda" and "month" view
    const newView = currentView === "agenda" ? "month" : "agenda";
    onView(newView); // Trigger the onView handler to switch views
  };

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
          {/* Conditionally render Agenda button for admin/superuser */}
          {isSuperUser && (
            <Button sx={{ textTransform: 'none' }} onClick={handleViewSwitch}>
              {currentView === "agenda" ? "Month" : "Agenda"}
            </Button>
          )}
        </ButtonGroup>
      </span>
    </div>
  );
};

export default CustomToolbar;
