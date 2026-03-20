import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Documentation = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Dokumentácia
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Začíname</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                Aby ste mohli začať s LinkSphere, budete potrebovať:
              </Typography>
              <Typography component="div">
                <ol>
                  <li>Pripojte svoju inštanciu Jira pomocou API prihlasovacích údajov</li>
                  <li>Vyberte projekty, ktoré chcete importovať</li>
                  <li>Čakajte na počiatočnú synchronizáciu dát</li>
                  <li>Preskúmajte svoj znalostný graf!</li>
                </ol>
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Pripojenie k Jira</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                Budete potrebovať nasledujúce informácie na pripojenie k vašej inštancii Jira:
              </Typography>
              <Typography component="div">
                <ul>
                  <li>URL inštancie Jira</li>
                  <li>API token alebo prihlasovacie údaje</li>
                  <li>E-mailová adresa používateľa</li>
                </ul>
              </Typography>
              <Typography paragraph sx={{ mt: 2 }}>
                Prejdite na stránku Nastavenia a zadajte svoje prihlasovacie údaje na vytvorenie pripojenia.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Navigácia v grafe</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                Vizualizácia grafu poskytuje niekoľko možností interakcie:
              </Typography>
              <Typography component="div">
                <ul>
                  <li>Na presúvanie grafu použite kliknutie a ťahanie</li>
                  <li>Na priblíženie a oddialenie použite koliesko myši</li>
                  <li>Kliknite na uzly pre zobrazenie detailných informácií</li>
                  <li>Použite filtre na zameranie sa na konkrétne typy úloh alebo vzťahy</li>
                </ul>
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">API Referencia</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                API dokumentácia pre vývojárov integrujúcich sa s platformou Jira Knowledge Graph.
              </Typography>
              <Typography>
                Podrobná referenčná dokumentácia API bude k dispozícii tu.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Container>
  );
};

export default Documentation;