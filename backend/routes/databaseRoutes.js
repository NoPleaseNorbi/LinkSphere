const express = require("express");
const router = express.Router();
const { getProjectGraph } = require("../controllers/databaseController");

router.get("/graph/:projectKey", getProjectGraph);

module.exports = router;