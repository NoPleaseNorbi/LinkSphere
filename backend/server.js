const express = require("express");
const cors = require("cors");
require("dotenv").config();

const jiraRoutes = require("./routes/jiraRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/jira", jiraRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
