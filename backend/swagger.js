const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LinkSphere API',
      version: '1.0.0',
      description: 'API documentation for LinkSphere - Jira & Confluence Knowledge Graph Visualizer',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Jira', description: 'Jira credentials and project management' },
      { name: 'Database', description: 'Neo4j graph data retrieval' },
    ],
  },
  apis: ['./routes/*.js'], // points to your route files
};

module.exports = swaggerJsdoc(options);