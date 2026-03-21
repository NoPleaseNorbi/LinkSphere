const express = require("express");
const router = express.Router();
const {
  saveCredentials,
  getProjects,
  saveProjectGraph,
  getConnectionStatus,
  disconnectCredentials
} = require("../controllers/jiraController");

/**
 * @swagger
 * /api/jira/credentials:
 *   post:
 *     summary: Save Jira credentials
 *     tags: [Jira]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - apiToken
 *               - domain
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@company.com
 *               apiToken:
 *                 type: string
 *                 example: your-atlassian-api-token
 *               domain:
 *                 type: string
 *                 example: yourcompany.atlassian.net
 *     responses:
 *       200:
 *         description: Credentials saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to save credentials
 */
router.post("/credentials", saveCredentials);

/**
 * @swagger
 * /api/jira/credentials:
 *   delete:
 *     summary: Disconnect and clear saved credentials and wipe Neo4j database
 *     tags: [Jira]
 *     responses:
 *       200:
 *         description: Credentials cleared and database wiped
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Failed to disconnect
 */
router.delete('/credentials', disconnectCredentials);

/**
 * @swagger
 * /api/jira/status:
 *   get:
 *     summary: Get current connection status
 *     tags: [Jira]
 *     responses:
 *       200:
 *         description: Connection status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connected:
 *                   type: boolean
 *                 email:
 *                   type: string
 *                 domain:
 *                   type: string
 */
router.get('/status', getConnectionStatus);

/**
 * @swagger
 * /api/jira/projects:
 *   get:
 *     summary: Get all Jira projects for the configured account
 *     tags: [Jira]
 *     responses:
 *       200:
 *         description: List of Jira projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   key:
 *                     type: string
 *                   name:
 *                     type: string
 *                   projectTypeKey:
 *                     type: string
 *                   description:
 *                     type: string
 *       400:
 *         description: Credentials not configured
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Failed to fetch projects
 */
router.get("/projects", getProjects);

/**
 * @swagger
 * /api/jira/project/save-graph:
 *   post:
 *     summary: Fetch all issues for a project from Jira and save to Neo4j
 *     tags: [Jira]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectKey
 *             properties:
 *               projectKey:
 *                 type: string
 *                 example: PROJ
 *     responses:
 *       200:
 *         description: Project graph saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 stats:
 *                   type: object
 *                   properties:
 *                     issuesProcessed:
 *                       type: integer
 *                     usersCreated:
 *                       type: integer
 *                     issuesCreated:
 *                       type: integer
 *                     connectionsCreated:
 *                       type: integer
 *                     pagesCreated:
 *                       type: integer
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Project key is required or credentials not configured
 *       404:
 *         description: No issues found for this project
 *       500:
 *         description: Failed to save project graph
 */
router.post("/project/save-graph", saveProjectGraph);

module.exports = router;