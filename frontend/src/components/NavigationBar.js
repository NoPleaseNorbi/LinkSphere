import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LogoutIcon from '@mui/icons-material/Logout';

const NavigationBar = () => {
  const [status, setStatus] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/jira/status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setStatus({ connected: false });
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleDisconnect = async () => {
    try {
      await fetch('http://localhost:5000/api/jira/credentials', {
        method: 'DELETE',
      });
      setStatus({ connected: false });
      setConfirmOpen(false);
      navigate('/settings');
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <AccountTreeIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
            LinkSphere
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            <Button color="inherit" component={RouterLink} to="/">
              Domov
            </Button>
            <Button color="inherit" component={RouterLink} to="/about">
              O nás
            </Button>
            <Button color="inherit" component={RouterLink} to="/documentation">
              Dokumentácia
            </Button>
            <Button color="inherit" component={RouterLink} to="/settings">
              Nastavenia
            </Button>
            <Button color="inherit" component={RouterLink} to="/projects">
              Projekty
            </Button>
            <Button color="inherit" component={RouterLink} to="/users">
              Používatelia
            </Button>
          </Box>

          {/* Connection status */}
          {status && (
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip
                title={
                  status.connected
                    ? `Pripojený ako ${status.email} na ${status.domain}`
                    : 'Nie ste pripojený. Prejdite do Nastavenia.'
                }
              >
                <Chip
                  icon={
                    status.connected
                      ? <CheckCircleIcon sx={{ fontSize: 16 }} />
                      : <ErrorIcon sx={{ fontSize: 16 }} />
                  }
                  label={status.connected ? status.email : 'Nepripojený'}
                  size="small"
                  sx={{
                    bgcolor: status.connected ? 'rgba(255,255,255,0.15)' : 'rgba(255,0,0,0.2)',
                    color: 'white',
                    '& .MuiChip-icon': { color: status.connected ? '#69f0ae' : '#ff5252' },
                    cursor: 'default',
                    maxWidth: 220,
                  }}
                />
              </Tooltip>

              {/* Disconnect button - only show when connected */}
              {status.connected && (
                <Tooltip title="Odpojiť">
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => setConfirmOpen(true)}
                    sx={{ minWidth: 0, p: 0.5 }}
                  >
                    <LogoutIcon fontSize="small" />
                  </Button>
                </Tooltip>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Odpojiť sa?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tým sa odstránia vaše uložené prihlasovacie údaje. Budete musieť znova zadať svoje Jira credentials pre ďalšie použitie.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Zrušiť</Button>
          <Button onClick={handleDisconnect} color="error" variant="contained">
            Odpojiť
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NavigationBar;