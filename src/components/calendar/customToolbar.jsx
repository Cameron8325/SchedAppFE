import React from "react";
import { ButtonGroup, Button } from "@mui/material";
import './customToolbar.css';

const FILTERS = [
  { value: "all", label: "All" },
  { value: "tea_tasting", label: "Tea Tasting" },
  { value: "intro_gongfu", label: "Intro to Gongfu" },
  { value: "guided_meditation", label: "Guided Meditation" },
];

const CustomToolbar = ({ label, onNavigate, handleDayTypeChange, activeDayType = "all" }) => {
  return (
    <div className="rbc-toolbar">
      {/* Navigation Buttons */}
      <span className="rbc-btn-group navigation-buttons">
        <ButtonGroup aria-label="calendar navigation">
          <Button onClick={() => onNavigate("PREV")} sx={{ textTransform: 'none'}}>Back</Button>
          <Button onClick={() => onNavigate("TODAY")} sx={{ textTransform: 'none'}}>Today</Button>
          <Button onClick={() => onNavigate("NEXT")} sx={{ textTransform: 'none'}}>Next</Button>
        </ButtonGroup>
      </span>

      {/* Current Date Label */}
      <span className="rbc-toolbar-label">{label}</span>

      {/* Filter Buttons */}
      <span className="rbc-btn-group filter-buttons">
        <ButtonGroup color="primary" aria-label="filter by session type">
          {FILTERS.map((filter) => (
            <Button
              key={filter.value}
              className={activeDayType === filter.value ? "filter-active" : ""}
              sx={{ textTransform: 'none' }}
              onClick={() => handleDayTypeChange(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </ButtonGroup>
      </span>
    </div>
  );
};

export default CustomToolbar;
