const express = require("express");
const router = express.Router();
const JiraController = require("../controllers/jiraController");

router.post("/credentials", JiraController.saveCredentials);
router.get("/projects", JiraController.getProjects);
router.get("/issue/:issueId", JiraController.getIssue);
router.get("/project/:projectKey/issues", JiraController.getProjectIssues);

module.exports = router;