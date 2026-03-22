# LinkSphere
### Vizualizácia znalostného grafu pre Jira a Confluence

---

## O projekte

LinkSphere je nástroj na vizualizáciu vzťahov medzi Jira úlohami, používateľmi a Confluence stránkami prostredníctvom interaktívneho znalostného grafu postaveného na technológii Neo4j. Umožňuje tímom lepšie pochopiť závislosti v projektoch a prepojenia medzi dokumentáciou a úlohami.

## Kľúčové funkcie

- Interaktívna vizualizácia grafov Jira projektov a používateľov
- Synchronizácia dát z Jira a Confluence cez Atlassian API
- Filtrovanie uzlov podľa používateľa, stavu a priority
- Farebné kódovanie uzlov podľa priority úlohy
- Presúvanie uzlov drag-and-drop
- Vyhľadávanie úloh v grafe s animáciou kamery
- Podrobný bočný panel s informáciami o uzle
- Prepojenie Confluence stránok s Jira úlohami v grafe
- Swagger API dokumentácia

## Požiadavky

- Docker a Docker Compose
- Atlassian účet s prístupom k Jira a Confluence
- Atlassian API token

---

## Inštalácia a spustenie

### 1. Klonovanie repozitára

```bash
git clone https://github.com/NoPleaseNorbi/LinkSphere
cd LinkSphere
```

### 2. Konfigurácia prostredia

Skopírujte vzorový súbor prostredia a nastavte heslá:

```bash
cp backend/.env.example backend/.env
```

Otvorte `backend/.env` a upravte nasledujúce hodnoty:

```env
PG_PASSWORD=vase_bezpecne_heslo
NEO4J_PASSWORD=vase_bezpecne_heslo
```

Uistite sa, že rovnaké heslá sú nastavené aj v `docker-compose.yml` pod sekciami `postgres` a `neo4j`.

### 3. Spustenie aplikácie

```bash
docker-compose up --build
```

Pri prvom spustení sa stiahnu Docker obrazy — môže to trvať niekoľko minút.

### 4. Prístup k aplikácii

| Služba | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Swagger docs | http://localhost:5000/api-docs |
| Neo4j browser | http://localhost:7474 |

### 5. Prvé prihlásenie

1. Otvorte http://localhost:3000
2. Prejdite na stránku **Nastavenia**
3. Zadajte váš Atlassian email, API token a doménu (napr. `vasafirma.atlassian.net`)
4. Kliknite na **Pripojiť a načítať projekty**
5. Prejdite na stránku **Projekty** a kliknite na projekt pre zobrazenie grafu

---

## Použitie

### Projekty

Na stránke Projekty sa zobrazia všetky dostupné Jira projekty. Kliknite na projekt pre zobrazenie jeho grafu. Tlačidlo **Obnoviť** synchronizuje dáta z Jira do Neo4j.

### Graf projektu

Graf zobrazuje Jira úlohy, používateľov a Confluence stránky ako uzly s farebnými spojeniami. Farba uzlu úlohy zodpovedá priorite:

| Farba | Priorita |
|-------|----------|
| 🔴 Tmavočervená | Highest |
| 🟠 Červená | High |
| 🟡 Oranžová | Medium |
| 🔵 Modrá | Low |
| 💙 Svetlomodrá | Lowest |
| 🟢 Zelená | Používateľ |
| 🔷 Tmavomodrá | Confluence stránka |

**Ovládanie grafu:**
- **Kliknutie na uzol** — zobrazí detaily v bočnom paneli
- **Prepínač Presúvanie** — umožní drag-and-drop uzlov
- **Filtre** — filtrujte podľa používateľa, stavu alebo priority
- **Vyhľadávanie** — nájde a zvýrazní úlohu podľa kľúča alebo názvu

### Používatelia

Na stránke Používatelia sa zobrazia všetci používatelia uložení v Neo4j. Kliknite na používateľa pre zobrazenie všetkých úloh, ktoré mu sú priradené.

---

## Správa aplikácie

```bash
# Zastavenie
docker-compose down

# Zastavenie a vymazanie všetkých dát
docker-compose down -v

# Rebuild po zmene kódu
docker-compose up --build

# Zobrazenie logov
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f neo4j
docker-compose logs -f postgres
```

---

## Technologický stack

| Vrstva | Technológia |
|--------|-------------|
| Frontend | React, Material UI, Sigma.js, Graphology |
| Backend | Node.js, Express.js |
| Grafová databáza | Neo4j |
| Relačná databáza | PostgreSQL |
| API | Atlassian Jira REST API v3, Confluence REST API |
| Kontajnerizácia | Docker, Docker Compose |
| Webový server | Nginx |

---

## Bezpečnostné poznámky

- Nikdy necommitujte `.env` súbor do verziovacieho systému
- Zrušte a regenerujte Atlassian API token ak bol vystavený
- Používajte silné heslá pre PostgreSQL a Neo4j
- Súbor `.env` je predvolene v `.gitignore`

---
---

# LinkSphere
### Knowledge Graph Visualization for Jira and Confluence

---

## About

LinkSphere is a tool for visualizing relationships between Jira issues, users, and Confluence pages through an interactive knowledge graph built on Neo4j technology. It helps teams better understand project dependencies and connections between documentation and tasks.

## Key Features

- Interactive graph visualization of Jira projects and users
- Data synchronization from Jira and Confluence via the Atlassian API
- Node filtering by user, status, and priority
- Color-coded nodes based on issue priority
- Drag-and-drop node repositioning
- Issue search with camera animation
- Detailed side panel with node information
- Confluence pages linked to Jira issues in the graph
- Swagger API documentation

## Prerequisites

- Docker and Docker Compose
- Atlassian account with access to Jira and Confluence
- Atlassian API token

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/NoPleaseNorbi/LinkSphere
cd LinkSphere
```

### 2. Configure Environment

Copy the example environment file and set your passwords:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and update the following values:

```env
PG_PASSWORD=your_secure_password
NEO4J_PASSWORD=your_secure_password
```

Make sure the same passwords are set in `docker-compose.yml` under the `postgres` and `neo4j` sections.

### 3. Start the Application

```bash
docker-compose up --build
```

On the first run, Docker images will be downloaded — this may take a few minutes.

### 4. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Swagger docs | http://localhost:5000/api-docs |
| Neo4j browser | http://localhost:7474 |

### 5. First Login

1. Open http://localhost:3000
2. Navigate to the **Settings** page
3. Enter your Atlassian email, API token, and domain (e.g. `yourcompany.atlassian.net`)
4. Click **Connect and load projects**
5. Go to the **Projects** page and click on a project to view its graph

---

## Usage

### Projects

The Projects page displays all available Jira projects. Click on a project to view its graph. The **Refresh** button synchronizes data from Jira into Neo4j.

### Project Graph

The graph displays Jira issues, users, and Confluence pages as nodes with colored connections. The color of an issue node corresponds to its priority:

| Color | Priority |
|-------|----------|
| 🔴 Dark red | Highest |
| 🟠 Red | High |
| 🟡 Orange | Medium |
| 🔵 Blue | Low |
| 💙 Light blue | Lowest |
| 🟢 Green | User |
| 🔷 Dark blue | Confluence page |

**Graph controls:**
- **Click on a node** — displays details in the side panel
- **Drag toggle** — enables drag-and-drop repositioning of nodes
- **Filters** — filter by user, status, or priority
- **Search** — finds and highlights an issue by key or summary

### Users

The Users page displays all users stored in Neo4j. Click on a user to view all issues assigned to them.

---

## Application Management

```bash
# Stop
docker-compose down

# Stop and clear all data
docker-compose down -v

# Rebuild after code changes
docker-compose up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f neo4j
docker-compose logs -f postgres
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Material UI, Sigma.js, Graphology |
| Backend | Node.js, Express.js |
| Graph database | Neo4j |
| Relational database | PostgreSQL |
| API | Atlassian Jira REST API v3, Confluence REST API |
| Containerization | Docker, Docker Compose |
| Web server | Nginx |

---

## Security Notes

- Never commit your `.env` file to version control
- Revoke and regenerate your Atlassian API token if it has been exposed
- Use strong passwords for PostgreSQL and Neo4j in production
- The `.env` file is listed in `.gitignore` by default
