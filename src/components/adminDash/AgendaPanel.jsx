import React, { useEffect, useState } from "react";
import api from "../../api/client";
import { Box, Typography, Divider, CircularProgress } from "@mui/material";
import moment from "moment";

const AgendaPanel = () => {
  const [availableDays, setAvailableDays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map the day types to their human-readable version
  const dayTypeMap = {
    tea_tasting: "Tea Tasting",
    intro_gongfu: "Intro to Gongfu",
    guided_meditation: "Guided Meditation",
  };

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const response = await api.get("/api/available-days/");
        setAvailableDays(response.data);
      } catch (error) {
        console.error("Error fetching agenda:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgenda();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {availableDays.length === 0 ? (
        <Typography sx={{ color: "#4A4A48" }}>No available days to display</Typography>
      ) : (
        availableDays.map((day) => {
          const appointments = day.appointments || [];
          const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
          const pendingCount = appointments.filter((a) => a.status === "pending").length;
          const flaggedCount = appointments.filter((a) => a.status === "flagged").length;

          return (
            <Box
              key={day.date}
              mb={2}
              p={2}
              border="1px solid #C2A773" // Muted gold border
              borderRadius="8px"
              sx={{
                backgroundColor: "#FAF8F6", // Light background color for cards
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: "#4A4A48" }}>
                {moment(day.date).format("MMMM Do, YYYY")}
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ color: "#4A4A48" }}>
                {dayTypeMap[day.type] || day.type}:{" "}
                {day.spots_left > 0 ? `${day.spots_left} Spots Left` : "Fully Booked"}
              </Typography>
              <Divider sx={{ my: 1, borderColor: "#C2A773" }} />
              {confirmedCount > 0 || pendingCount > 0 || flaggedCount > 0 ? (
                <Typography variant="body2" sx={{ color: "#4A4A48" }}>
                  {confirmedCount > 0 && `${confirmedCount} Confirmed`}
                  {confirmedCount > 0 && pendingCount > 0 && ", "}
                  {pendingCount > 0 && `${pendingCount} Pending`}
                  {(confirmedCount > 0 || pendingCount > 0) && flaggedCount > 0 && ", "}
                  {flaggedCount > 0 && `${flaggedCount} Flagged`}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ color: "#4A4A48" }}>
                  No confirmed, pending, or flagged appointments
                </Typography>
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default AgendaPanel;
