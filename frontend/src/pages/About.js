import { Container, Typography, Box, Paper } from '@mui/material';

const About = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          O LinkSphere
        </Typography>
        
        <Paper elevation={2} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Čo je LinkSphere?
          </Typography>
          <Typography paragraph>
            LinkSphere je výkonný vizualizačný nástroj, ktorý pomáha tímom pochopiť zložité vzťahy v ich projektoch v Jira. Využitím technológie grafovej databázy Neo4j premieňame vaše projektové dáta na interaktívny, preskúmateľný znalostný graf.
          </Typography>

          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
            Technologický stack
          </Typography>
          <Typography paragraph>
            Tento projekt je vytvorený pomocou stacku PERN (PostgreSQL, Express.js, React, Node.js) s Neo4j ako grafovou databázou, poskytujúc robustné a škálovateľné riešenie pre správu a vizualizáciu dát z Jira.
          </Typography>
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
            Kľúčové funkcie
          </Typography>
          <Typography component="div">
            <ul>
              <li>Synchronizácia s Jira v reálnom čase</li>
              <li>Interaktívna grafová vizualizácia úloh, epikov a závislostí</li>
              <li>Pokročilé možnosti vyhľadávania a filtrovania</li>
              <li>Analytika a prehľady založené na grafe</li>
              <li>Používateľsky prívetivé rozhranie Material UI</li>
            </ul>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default About;