import * as React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import RefreshIcon from '@mui/icons-material/Refresh';

const TYPE_COLORS = {
  software: 'primary',
  business: 'secondary',
  core: 'default',
};

const Projects = () => {
  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/jira/projects');

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to fetch projects');
        return;
      }

      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Could not connect to the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProjects();
  }, []);
 
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={48} />
          <Typography color="text.secondary">Fetching projects...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Projects
          </Typography>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchProjects} startIcon={<RefreshIcon />}>
                Retry
              </Button>
            }
          >
            {error === 'Credentials not configured'
              ? <>Jira credentials are not set up yet. Go to <Button component={RouterLink} to="/settings" size="small" sx={{ mx: 0.5 }}>Settings</Button> to configure them.</>
              : error
            }
          </Alert>
        </Box>
      </Container>
    );
  }

  if (projects.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Projects
          </Typography>
          <Alert severity="info">
            No projects found. Make sure your Jira account has access to at least one project.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h3" component="h1">
            Projects
          </Typography>
          <Button variant="outlined" size="small" onClick={fetchProjects} startIcon={<RefreshIcon />}>
            Refresh
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {projects.length} project{projects.length !== 1 ? 's' : ''} found
        </Typography>

        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 4 },
                }}
              >
                <CardHeader
                  avatar={
                    project.avatarUrls?.['24x24'] ? (
                      <Avatar src={project.avatarUrls['24x24']} alt={project.name} />
                    ) : (
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <FolderOpenIcon />
                      </Avatar>
                    )
                  }
                  title={
                    <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                      {project.name}
                    </Typography>
                  }
                  subheader={
                    <Typography variant="body2" color="text.secondary" component="span">
                      {project.key}
                    </Typography>
                  }
                />

                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {project.projectTypeKey && (
                    <Chip
                      label={project.projectTypeKey.charAt(0).toUpperCase() + project.projectTypeKey.slice(1)}
                      color={TYPE_COLORS[project.projectTypeKey] || 'default'}
                      size="small"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  )}

                  {project.description && (
                    <Typography variant="body2" color="text.secondary">
                      {project.description.length > 120
                        ? project.description.slice(0, 120) + '...'
                        : project.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Projects;