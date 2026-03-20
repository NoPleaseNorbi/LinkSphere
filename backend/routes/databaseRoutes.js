const express = require("express");
const router = express.Router();
const { getProjectGraph , 
  getProjectUsersHandler, 
  getProjectStatusesHandler,
  getProjectPrioritiesHandler
} = require("../controllers/databaseController");

router.get("/graph/:projectKey", getProjectGraph);

router.get('/graph/users/:projectKey', getProjectUsersHandler);

router.get('/graph/statuses/:projectKey', getProjectStatusesHandler);

router.get('/graph/priorities/:projectKey', getProjectPrioritiesHandler);

module.exports = router;