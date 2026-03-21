const express = require("express");
const cors = require("cors");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

require("dotenv").config();
const jiraRoutes = require("./routes/jiraRoutes");
const databaseRoutes = require("./routes/databaseRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/jira", jiraRoutes);

app.use("/api/database", databaseRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
