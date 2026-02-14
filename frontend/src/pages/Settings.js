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
      setError('All fields are required');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate domain format
    if (!credentials.domain.includes('.')) {
      setError('Please enter a valid domain (e.g., yourcompany.atlassian.net)');
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
        message: saveData.error || 'Failed to save credentials.',
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
        message: projects.error || 'Credentials saved, but failed to fetch projects.',
        projectCount: 0
      });
      setDialogOpen(true);
      return;
    }

    // Save all projects to Neo4j
    try {
      const saveProjectsRes = await fetch('http://localhost:5000/api/jira/projects/save-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!saveProjectsRes.ok) {
        const errorData = await saveProjectsRes.json();
        setDialogData({
          success: false,
          message: `Connected successfully (${projects.length} projects found), but failed to import to Neo4j: ${errorData.error}`,
          projectCount: projects.length
        });
        setDialogOpen(true);
        return;
      }

      const projectsData = await saveProjectsRes.json();
      
      setDialogData({
        success: true,
        message: projects.length > 0
          ? `Successfully connected and imported to Neo4j! Found ${projects.length} project(s), saved ${projectsData.stats.totalIssues} issues and ${projectsData.stats.totalUsers} users.`
          : 'Successfully connected, but no projects were found.',
        projectCount: projects.length,
        neo4jStats: {
          projectsProcessed: projectsData.stats.projectsProcessed,
          totalIssues: projectsData.stats.totalIssues,
          totalUsers: projectsData.stats.totalUsers,
          errors: projectsData.stats.errors.length
        }
      });
      setDialogOpen(true);

    } catch (neo4jError) {
      console.error('Neo4j import error:', neo4jError);
      setDialogData({
        success: false,
        message: `Connected successfully (${projects.length} projects found), but failed to import to Neo4j: ${neo4jError.message}`,
        projectCount: projects.length
      });
      setDialogOpen(true);
    }

  } catch (err) {
    console.error('Fetch error:', err);
    setDialogData({
      success: false,
      message: 'Failed to connect to server. Please make sure the backend is running.',
      projectCount: 0
    });
    setDialogOpen(true);
  } finally {
    setLoading(false);
  }
};

const handleCloseDialog = () => {
  setDialogOpen(false);
};


  return (
    <Container maxWidth="md">
      <Box sx={{ my: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h3" component="h1">
            Settings
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Jira Credentials
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure your Atlassian Jira credentials to fetch and visualize your project data.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Atlassian Email"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="your.email@gmail.com"
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
              placeholder="Enter your Atlassian API token"
              margin="normal"
              required
              disabled={loading}
              helperText={
                <span>
                  Don't have an API token?{' '}
                  <Link 
                    href="https://id.atlassian.com/manage-profile/security/api-tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Create one here
                  </Link>
                </span>
              }
            />

            <TextField
              fullWidth
              label="Jira Domain"
              name="domain"
              value={credentials.domain}
              onChange={handleChange}
              placeholder="yourcompany.atlassian.net"
              margin="normal"
              required
              disabled={loading}
              helperText="Your Jira instance domain (without https://)"
            />

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Connecting...' : 'Connect & Fetch Projects'}
              </Button>
              
              {credentials.email || credentials.apiToken || credentials.domain ? (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setCredentials({ email: '', apiToken: '', domain: '' })}
                  disabled={loading}
                >
                  Clear
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
              Connection Successful
            </>
          ) : (
            <>
              <ErrorIcon color="error" />
              Connection Failed
            </>
          )}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogData.message}
          </DialogContentText>
          
          {dialogData.success && dialogData.projectCount === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              No projects found. Make sure you have access to at least one Jira project.
            </Alert>
          )}
          
          {dialogData.success && dialogData.projectCount > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Your credentials are working! You can now visualize your Jira projects.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;