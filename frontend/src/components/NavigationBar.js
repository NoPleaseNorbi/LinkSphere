import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

const NavigationBar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <AccountTreeIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          LinkSphere
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
          >
            Domov
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/about"
          >
            O nás
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/documentation"
          >
            Dokumentácia
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/settings"
          >
            Nastavenia
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/projects"
          >
            Projekty
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;