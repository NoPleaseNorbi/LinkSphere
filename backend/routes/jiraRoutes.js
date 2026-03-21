const express = require("express");
const router = express.Router();
const {
  saveCredentials,
  getProjects,
  saveProjectGraph,
  getConnectionStatus,
  disconnectCredentials
} = require("../controllers/jiraController");

router.post("/credentials", saveCredentials);

router.get("/projects", getProjects);

router.post("/project/save-graph", saveProjectGraph);

router.get('/status', getConnectionStatus);

router.delete('/credentials', disconnectCredentials);

module.exports = router;