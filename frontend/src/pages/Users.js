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
  CircularProgress,
  Alert,
  Button,
  CardActionArea,
  TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';

const Users = () => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/database/users');

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Nepodarilo sa načítať používateľov');
        return;
      }

      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Nepodarilo sa pripojiť k serveru. Beží backend?');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(search.toLowerCase()) ||
    (user.emailAddress && user.emailAddress.toLowerCase().includes(search.toLowerCase()))
  );

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserClick = (accountId) => {
    navigate(`/user/${accountId}/graph`);
  };

  // ─── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={48} />
          <Typography color="text.secondary">Načítavanie používateľov...</Typography>
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
            Používatelia
          </Typography>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchUsers} startIcon={<RefreshIcon />}>
                Skúsiť znova
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  // ─── Empty ──────────────────────────────────────────────
  if (users.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Používatelia
          </Typography>
          <Alert severity="info">
            Neboli nájdení žiadni používatelia. Najprv synchronizujte projekty.
          </Alert>
        </Box>
      </Container>
    );
  }

  // ─── Users ───────────────────────────────────────────
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h3" component="h1">
            Používatelia
          </Typography>
          <Button variant="outlined" size="small" onClick={fetchUsers} startIcon={<RefreshIcon />}>
            Obnoviť používateľov
          </Button>
        </Box>
        <TextField
          fullWidth
          size="small"
          placeholder="Hľadať podľa mena alebo emailu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {filteredUsers.length} {filteredUsers.length === 1 ? 'používateľ' : 'používateľov'} nájdených
        </Typography>
        
        <Grid container spacing={3}>
          {filteredUsers.map((user) => (
            <Grid key={user.accountId} item xs={12} sm={6} md={4}>
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
                <CardActionArea onClick={() => handleUserClick(user.accountId)} sx={{ flexGrow: 1 }}>
                  <CardHeader
                    avatar={
                      user.avatarUrl ? (
                        <Avatar src={user.avatarUrl} alt={user.displayName} />
                      ) : (
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          <PersonIcon />
                        </Avatar>
                      )
                    }
                    title={
                      <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                        {user.displayName}
                      </Typography>
                    }
                  />
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" component="span">
                      {user.emailAddress}
                    </Typography>
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

export default Users;
