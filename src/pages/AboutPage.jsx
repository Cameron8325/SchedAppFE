import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Divider } from '@mui/material';

function AboutPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Box
        sx={{
          backgroundColor: 'rgba(240, 229, 216, 0.9)',
          borderRadius: 2,
          boxShadow: 3,
          px: { xs: 3, sm: 5 },
          py: { xs: 3, sm: 4 },
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#4A4A48' }}>
          About Ceremonial Artifex
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: '#4A4A48' }}>
          Gong Fu Cha — literally "making tea with skill" — is a traditional
          Chinese way of preparing tea that emphasizes care, attention, and
          repetition. Rather than one large mug, tea is brewed in small vessels
          over many short infusions, letting each steep reveal a different side
          of the leaf.
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: '#4A4A48' }}>
          Our sessions are kept intentionally small — no more than four guests
          per day — so every visit feels personal. Whether you join a tea
          tasting, an introduction to the Gongfu ceremony, or a guided
          meditation, you'll leave with a deeper appreciation for the craft and
          a quieter mind.
        </Typography>

        <Divider sx={{ my: 3, borderColor: '#C2A773' }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#4A4A48' }}>
          What to Expect
        </Typography>
        <Typography variant="body1" component="div" sx={{ color: '#4A4A48' }}>
          <ul style={{ marginTop: 0, paddingLeft: '1.4rem' }}>
            <li>Sessions run on scheduled days — check the calendar for openings.</li>
            <li>Each day hosts a single session type with up to four seats.</li>
            <li>Requests are confirmed by email once approved.</li>
            <li>Every completed visit earns you a loyalty token.</li>
          </ul>
        </Typography>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/appointments')}
            sx={{
              backgroundColor: '#8B5E3C',
              color: '#FFF',
              '&:hover': { backgroundColor: '#704A35' },
            }}
          >
            View the Calendar
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/catalog')}
            sx={{
              color: '#8B5E3C',
              borderColor: '#8B5E3C',
              '&:hover': { borderColor: '#704A35', color: '#704A35' },
            }}
          >
            Browse Sessions
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default AboutPage;
