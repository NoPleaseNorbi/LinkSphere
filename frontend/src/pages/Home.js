import { Container, Typography, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Jira Knowledge Graph
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" paragraph>
          Visualize and explore your Jira data through interactive knowledge graphs
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button 
            variant="contained" 
            size="large" 
            component={RouterLink} 
            to="/documentation"
            sx={{ mr: 2 }}
          >
            Get Started
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            component={RouterLink} 
            to="/about"
          >
            Learn More
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;