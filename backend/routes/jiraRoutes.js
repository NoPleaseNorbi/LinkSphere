const express = require("express");
const router = express.Router();
const {
  saveCredentials,
  getProjects,
  saveProjectGraph
} = require("../controllers/jiraController");

router.post("/credentials", saveCredentials);

router.get("/projects", getProjects);

router.post("/project/save-graph", saveProjectGraph);

module.exports = router;