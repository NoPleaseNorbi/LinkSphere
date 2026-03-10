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
  CardActionArea,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import RefreshIcon from '@mui/icons-material/Refresh';

const TYPE_COLORS = {
  software: 'primary',
  business: 'secondary',
  core: 'default',
};

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Runs on page load - just fetches the project list
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/jira/projects');

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Nepodarilo sa načítať projekty');
        return;
      }

      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Nepodarilo sa pripojiť k serveru. Beží backend?');
    } finally {
      setLoading(false);
    }
  };

  // Only runs when user clicks refresh - fetches projects AND resyncs Neo4j
  const refreshProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/jira/projects');

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Nepodarilo sa načítať projekty');
        return;
      }

      const data = await res.json();
      setProjects(data);

      for (const project of data) {
        const saveRes = await fetch('http://localhost:5000/api/jira/project/save-graph', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectKey: project.key })
        });

        if (!saveRes.ok) {
          console.warn(`Failed to save graph for project ${project.key}`);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Nepodarilo sa pripojiť k serveru. Beží backend?');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}/graph`);
  };

  // ─── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={48} />
          <Typography color="text.secondary">Načítavanie projektov...</Typography>
        </Box>
      </Container>
    );
  }

  // ─── Error ──────────────────────────────────────────────
  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Projekty
          </Typography>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchProjects} startIcon={<RefreshIcon />}>
                Skúsiť znova
              </Button>
            }
          >
            {error === 'Credentials not configured'
              ? <>Prihlasovacie údaje nie sú nakonfigurované. Pre ich konfiguráciu prejdite do <Button component={RouterLink} to="/settings" size="small" sx={{ mx: 0.5 }}>Nastavenia</Button>.</>
              : error
            }
          </Alert>
        </Box>
      </Container>
    );
  }

  // ─── Empty ──────────────────────────────────────────────
  if (projects.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Projekty
          </Typography>
          <Alert severity="info">
            Neboli nájdené žiadne projekty. Uistite sa, že váš účet v Jire má prístup aspoň k jednému projektu.
          </Alert>
        </Box>
      </Container>
    );
  }

  // ─── Projects ───────────────────────────────────────────
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h3" component="h1">
            Projekty
          </Typography>
          <Button variant="outlined" size="small" onClick={refreshProjects} startIcon={<RefreshIcon />}>
            Obnoviť
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {projects.length} {projects.length === 1 ? 'projekt' : 'projektov'} nájdených — Kliknite na projekt pre zobrazenie jeho grafu
        </Typography>

        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid key={project.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  '&:hover': { 
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardActionArea onClick={() => handleProjectClick(project.key)} sx={{ flexGrow: 1 }}>
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
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Projects;