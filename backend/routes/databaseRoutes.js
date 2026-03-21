const express = require("express");
const router = express.Router();
const { getProjectGraph , 
  getProjectUsersHandler, 
  getProjectStatusesHandler,
  getProjectPrioritiesHandler,
  getAllUsersHandler,
  getUserGraph
} = require("../controllers/databaseController");

router.get("/graph/:projectKey", getProjectGraph);

router.get('/graph/users/:projectKey', getProjectUsersHandler);

router.get('/graph/statuses/:projectKey', getProjectStatusesHandler);

router.get('/graph/priorities/:projectKey', getProjectPrioritiesHandler);

router.get('/users', getAllUsersHandler);

router.get('/user/:accountId/graph', getUserGraph);

module.exports = router;