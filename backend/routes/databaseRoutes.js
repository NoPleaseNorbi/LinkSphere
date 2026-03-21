const express = require("express");
const router = express.Router();
const {
  getProjectGraph,
  getProjectUsersHandler,
  getProjectStatusesHandler,
  getProjectPrioritiesHandler,
  getAllUsersHandler,
  getUserGraph
} = require("../controllers/databaseController");

/**
 * @swagger
 * /api/database/project/{projectKey}/graph:
 *   get:
 *     summary: Get the full graph for a project from Neo4j
 *     tags: [Database]
 *     parameters:
 *       - in: path
 *         name: projectKey
 *         required: true
 *         schema:
 *           type: string
 *         example: PROJ
 *     responses:
 *       200:
 *         description: Project graph data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 projectKey:
 *                   type: string
 *                 graph:
 *                   type: object
 *                   properties:
 *                     nodes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           label:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [issue, user, page]
 *                           data:
 *                             type: object
 *                     edges:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           source:
 *                             type: string
 *                           target:
 *                             type: string
 *                           label:
 *                             type: string
 *                           type:
 *                             type: string
 *       400:
 *         description: Project key is required
 *       500:
 *         description: Failed to get project graph
 */
router.get("/project/:projectKey/graph", getProjectGraph);

/**
 * @swagger
 * /api/database/project/{projectKey}/users:
 *   get:
 *     summary: Get all users assigned to issues in a project
 *     tags: [Database]
 *     parameters:
 *       - in: path
 *         name: projectKey
 *         required: true
 *         schema:
 *           type: string
 *         example: PROJ
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       accountId:
 *                         type: string
 *                       displayName:
 *                         type: string
 *       400:
 *         description: Project key is required
 *       500:
 *         description: Failed to get project users
 */
router.get('/project/:projectKey/users', getProjectUsersHandler);

/**
 * @swagger
 * /api/database/project/{projectKey}/statuses:
 *   get:
 *     summary: Get all distinct issue statuses in a project
 *     tags: [Database]
 *     parameters:
 *       - in: path
 *         name: projectKey
 *         required: true
 *         schema:
 *           type: string
 *         example: PROJ
 *     responses:
 *       200:
 *         description: List of statuses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuses:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Project key is required
 *       500:
 *         description: Failed to get project statuses
 */
router.get('/project/:projectKey/statuses', getProjectStatusesHandler);

/**
 * @swagger
 * /api/database/project/{projectKey}/priorities:
 *   get:
 *     summary: Get all distinct issue priorities in a project
 *     tags: [Database]
 *     parameters:
 *       - in: path
 *         name: projectKey
 *         required: true
 *         schema:
 *           type: string
 *         example: PROJ
 *     responses:
 *       200:
 *         description: List of priorities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 priorities:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Project key is required
 *       500:
 *         description: Failed to get project priorities
 */
router.get('/project/:projectKey/priorities', getProjectPrioritiesHandler);

/**
 * @swagger
 * /api/database/users:
 *   get:
 *     summary: Get all users stored in Neo4j
 *     tags: [Database]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       accountId:
 *                         type: string
 *                       displayName:
 *                         type: string
 *                       emailAddress:
 *                         type: string
 *                       avatarUrl:
 *                         type: string
 *       500:
 *         description: Failed to get users
 */
router.get('/users', getAllUsersHandler);

/**
 * @swagger
 * /api/database/user/{accountId}/graph:
 *   get:
 *     summary: Get the graph for a specific user from Neo4j
 *     tags: [Database]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         example: 5b10a2844c20165700ede21g
 *     responses:
 *       200:
 *         description: User graph data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accountId:
 *                   type: string
 *                 graph:
 *                   type: object
 *                   properties:
 *                     nodes:
 *                       type: array
 *                       items:
 *                         type: object
 *                     edges:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Account ID is required
 *       500:
 *         description: Failed to get user graph
 */
router.get('/user/:accountId/graph', getUserGraph);

module.exports = router;