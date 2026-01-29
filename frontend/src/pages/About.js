import { Container, Typography, Box, Paper } from '@mui/material';

const About = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About
        </Typography>
        
        <Paper elevation={2} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            What is LinkSphere?
          </Typography>
          <Typography paragraph>
            LinkSphere is a powerful visualization tool that helps teams understand the complex relationships within their Jira projects. By leveraging graph database technology with Neo4j, we transform your project data into an interactive, explorable knowledge graph.
          </Typography>

          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
            Technology Stack
          </Typography>
          <Typography paragraph>
            This application is built using the PERN stack (PostgreSQL, Express.js, React, Node.js) with Neo4j as the graph database, providing a robust and scalable solution for managing and visualizing your Jira data.
          </Typography>

          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
            Key Features
          </Typography>
          <Typography component="div">
            <ul>
              <li>Real-time synchronization with Jira</li>
              <li>Interactive graph visualization of issues, epics, and dependencies</li>
              <li>Advanced search and filtering capabilities</li>
              <li>Graph-based analytics and insights</li>
              <li>User-friendly Material UI interface</li>
            </ul>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default About;