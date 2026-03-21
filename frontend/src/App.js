import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NavigationBar from './components/NavigationBar';
import Home from './pages/Home';
import About from './pages/About';
import Documentation from './pages/Documentation';
import Settings from './pages/Settings';
import Projects from './pages/Projects';
import ProjectGraph from './pages/Projectgraph';
import Users from './pages/Users';
import UserGraph from './pages/UserGraph';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:projectId/graph" element={<ProjectGraph />} />
          <Route path="/users" element={<Users />} />
          <Route path="/user/:accountId/graph" element={<UserGraph />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;