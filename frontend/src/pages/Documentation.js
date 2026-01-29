import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Documentation = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Documentation
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Getting Started</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                To get started with LinkSphere, you'll need to:
              </Typography>
              <Typography component="div">
                <ol>
                  <li>Connect your Jira instance using API credentials</li>
                  <li>Select the projects you want to import</li>
                  <li>Wait for the initial data synchronization</li>
                  <li>Explore your knowledge graph!</li>
                </ol>
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Connecting to Jira</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                You'll need the following information to connect to your Jira instance:
              </Typography>
              <Typography component="div">
                <ul>
                  <li>Jira instance URL</li>
                  <li>API token or credentials</li>
                  <li>User email address</li>
                </ul>
              </Typography>
              <Typography paragraph sx={{ mt: 2 }}>
                Navigate to the Settings page and enter your credentials to establish the connection.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Navigating the Graph</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                The graph visualization provides several interaction options:
              </Typography>
              <Typography component="div">
                <ul>
                  <li>Click and drag to pan around the graph</li>
                  <li>Scroll to zoom in and out</li>
                  <li>Click on nodes to see detailed information</li>
                  <li>Use filters to focus on specific issue types or relationships</li>
                </ul>
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">API Reference</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                API documentation for developers integrating with the Jira Knowledge Graph platform.
              </Typography>
              <Typography>
                Detailed API reference documentation will be available here.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Container>
  );
};

export default Documentation;