import * as React from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Link
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const Settings = () => {
  const [credentials, setCredentials] = React.useState({
    email: '',
    apiToken: '',
    domain: ''
  });
  
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogData, setDialogData] = React.useState({
    success: false,
    message: '',
    projectCount: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const validateInputs = () => {
    if (!credentials.email || !credentials.apiToken || !credentials.domain) {
      setError('Všetky polia sú povinné');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setError('Zadajte platnú e-mailovú adresu');
      return false;
    }

    // Validate domain format
    if (!credentials.domain.includes('.')) {
      setError('Zadajte platnú doménu (napr. vasaspolecnost.atlassian.net)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateInputs()) {
    return;
  }

  setLoading(true);
  setError('');

  try {
    const saveRes = await fetch('http://localhost:5000/api/jira/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        apiToken: credentials.apiToken,
        domain: credentials.domain
      })
    });

    if (!saveRes.ok) {
      const saveData = await saveRes.json();
      setDialogData({
        success: false,
        message: saveData.error || 'Nepodarilo sa uložiť prihlasovacie údaje.',
        projectCount: 0
      });
      setDialogOpen(true);
      return;
    }

    // Fetch projects to verify the credentials work
    const projectsRes = await fetch('http://localhost:5000/api/jira/projects');
    const projects = await projectsRes.json();
    console.log("Fetched projects:", projects);

    if (!projectsRes.ok) {
      setDialogData({
        success: false,
        message: projects.error || 'Prihlasovacie údaje uložené, ale nepodarilo sa načítať projekty.',
        projectCount: 0
      });
      setDialogOpen(true);
      return;
    }

    // Save all projects to Neo4j
    try {
      const saveResults = { totalIssues: 0, totalUsers: 0, errors: [] };

      for (const project of projects) {
        const saveProjectsRes = await fetch('http://localhost:5000/api/jira/project/save-graph', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectKey: project.key })  // ✅ pass each project key
        });

        if (!saveProjectsRes.ok) {
          const errorData = await saveProjectsRes.json();
          saveResults.errors.push(`${project.key}: ${errorData.error}`);
          continue;
        }

        const projectData = await saveProjectsRes.json();
        saveResults.totalIssues += projectData.stats.issuesCreated;
        saveResults.totalUsers += projectData.stats.usersCreated;
      }

      setDialogData({
        success: true,
        message: projects.length > 0
          ? `Úspešne pripojené a importované do Neo4j! Nájdených ${projects.length} projekt(ov), uložených ${saveResults.totalIssues} problémov a ${saveResults.totalUsers} používateľov.`
          : 'Úspešne pripojené, ale nenašli sa žiadne projekty.',
        projectCount: projects.length,
        neo4jStats: {
          projectsProcessed: projects.length - saveResults.errors.length,
          totalIssues: saveResults.totalIssues,
          totalUsers: saveResults.totalUsers,
          errors: saveResults.errors.length
        }
      });
      setDialogOpen(true);

    } catch (neo4jError) {
      console.error('Neo4j import error:', neo4jError);
      setDialogData({
        success: false,
        message: `Úspešne pripojené (${projects.length} projektov nájdených), ale nepodarilo sa importovať do Neo4j: ${neo4jError.message}`,
        projectCount: projects.length
      });
      setDialogOpen(true);
    }

  } catch (err) {
    console.error('Fetch error:', err);
    setDialogData({
      success: false,
      message: 'Nepodarilo sa pripojiť k serveru. Uistite sa, že backend beží.',
      projectCount: 0
    });
    setDialogOpen(true);
  } finally {
    setLoading(false);
  }
};

const handleCloseDialog = () => {
  setDialogOpen(false);
  if (dialogData.success) {
    window.location.reload();
  }
};


  return (
    <Container maxWidth="md">
      <Box sx={{ my: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h3" component="h1">
            Nastavenia
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Prihlasovacie údaje do Atlassian
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Konfigurujte svoje prihlasovacie údaje do Atlassian na načítanie a vizualizáciu údajov o vašich projektoch.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Atlassian E-mail"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="vas.email@gmail.com"
              margin="normal"
              required
              disabled={loading}
            />

            <TextField
              fullWidth
              label="API Token"
              name="apiToken"
              type="password"
              value={credentials.apiToken}
              onChange={handleChange}
              placeholder="Zadajte svoj Atlassian API token"
              margin="normal"
              required
              disabled={loading}
              helperText={
                <span>
                  Nemáte API token?{' '}
                  <Link 
                    href="https://id.atlassian.com/manage-profile/security/api-tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Vytvorte ho tu
                  </Link>
                </span>
              }
            />

            <TextField
              fullWidth
              label="Jira Doména"
              name="domain"
              value={credentials.domain}
              onChange={handleChange}
              placeholder="vasaspolocnost.atlassian.net"
              margin="normal"
              required
              disabled={loading}
              helperText="Doména vašej Jira inštancie (bez https://)"
            />

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Pripája sa...' : 'Pripojiť a načítať projekty'}
              </Button>
              
              {credentials.email || credentials.apiToken || credentials.domain ? (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setCredentials({ email: '', apiToken: '', domain: '' })}
                  disabled={loading}
                >
                  Vymazať
                </Button>
              ) : null}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Success/Error Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {dialogData.success ? (
            <>
              <CheckCircleIcon color="success" />
              Pripojenie úspešné
            </>
          ) : (
            <>
              <ErrorIcon color="error" />
              Pripojenie zlyhalo
            </>
          )}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogData.message}
          </DialogContentText>
          
          {dialogData.success && dialogData.projectCount === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Nenašli sa žiadne projekty. Uistite sa, že máte prístup aspoň k jednému Jira projektu.
            </Alert>
          )}
          
          {dialogData.success && dialogData.projectCount > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Vaše prihlasovacie údaje fungujú! Teraz môžete vizualizovať svoje Jira projekty.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained">
            Zavrieť
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;