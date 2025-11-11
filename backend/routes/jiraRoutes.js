const express = require("express");
const router = express.Router();
const JiraController = require("../controllers/jiraController");

router.get("/projects", JiraController.getProjects);
router.get("/issue/:issueId", JiraController.getIssue);

module.exports = router;
