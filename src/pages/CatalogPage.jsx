import React from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import { Container, Typography, Button, Card, CardContent, CardActions } from '@mui/material';

function CatalogPage() {
  const navigate = useNavigate();  // Use useNavigate instead of useHistory

  const handleRedirect = (dayType) => {
    navigate(`/appointments?dayType=${dayType}`);
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Explore Our Appointments
      </Typography>

      {/* Tea Tasting Section */}
      <Card style={{ marginBottom: '1rem' }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Tea Tasting
          </Typography>
          <Typography variant="body1" component="p">
            Experience the rich flavors and aromas of different teas in a guided tasting session. Learn about the origins and processing methods of various teas, and enjoy a serene tea tasting experience.
          </Typography>
        </CardContent>
        <CardActions>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => handleRedirect('tea_tasting')}
          >
            Schedule a Tea Tasting
          </Button>
        </CardActions>
      </Card>

      {/* Intro to Gongfu Section */}
      <Card style={{ marginBottom: '1rem' }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Intro to Gongfu
          </Typography>
          <Typography variant="body1" component="p">
            Discover the art of Gongfu tea preparation. This session introduces you to traditional Chinese tea ceremonies, focusing on technique, mindfulness, and the cultural significance of Gongfu Cha.
          </Typography>
        </CardContent>
        <CardActions>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => handleRedirect('intro_gongfu')}
          >
            Schedule an Intro to Gongfu
          </Button>
        </CardActions>
      </Card>

      {/* Guided Meditation Section */}
      <Card style={{ marginBottom: '1rem' }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Guided Meditation
          </Typography>
          <Typography variant="body1" component="p">
            Join us for a calming guided meditation session. Whether you're new to meditation or experienced, this session will help you relax, focus, and find inner peace through mindful practices.
          </Typography>
        </CardContent>
        <CardActions>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => handleRedirect('guided_meditation')}
          >
            Schedule a Guided Meditation
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
}

export default CatalogPage;
