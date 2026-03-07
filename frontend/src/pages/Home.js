import { Container, Typography, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Vitajte v LinkSphere
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" paragraph>
          Vizualizujte a preskúmajte svoje údaje z Jira prostredníctvom interaktívnych znalostných grafov.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button 
            variant="contained" 
            size="large" 
            component={RouterLink} 
            to="/documentation"
            sx={{ mr: 2 }}
          >
            Začať
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            component={RouterLink} 
            to="/about"
          >
            Zisti viac
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;