const { getProjectGraphFromDB, getProjectUsers, getProjectStatuses, getProjectPriorities } = require("../models/graphModel");

const getProjectGraph = async (req, res) => {
  try {
    const { projectKey } = req.params;
    if (!projectKey) {
      return res.status(400).json({ error: "Project key is required" });
    }
    const graphData = await getProjectGraphFromDB(projectKey);
    res.json({ success: true, projectKey, graph: graphData });
  } catch (err) {
    console.error("Get project graph error:", err.message);
    res.status(500).json({ error: "Failed to get project graph" });
  }
};

const getProjectUsersHandler = async (req, res) => {
  try {
    const { projectKey } = req.params;
    if (!projectKey) {
      return res.status(400).json({ error: "Project key is required" });
    }
    const users = await getProjectUsers(projectKey);
    res.json({ users });
  } catch (err) {
    console.error("Get project users error:", err.message);
    res.status(500).json({ error: "Failed to get project users" });
  }
};

const getProjectStatusesHandler = async (req, res) => {
  try {
    const { projectKey } = req.params;
    if (!projectKey) {
      return res.status(400).json({ error: "Project key is required" });
    }
    const statuses = await getProjectStatuses(projectKey);
    res.json({ statuses });
  } catch (err) {
    console.error("Get project statuses error:", err.message);
    res.status(500).json({ error: "Failed to get project statuses" });
  }
};

const getProjectPrioritiesHandler = async (req, res) => {
  try {
    const { projectKey } = req.params;
    if (!projectKey) {
      return res.status(400).json({ error: "Project key is required" });
    }
    const priorities = await getProjectPriorities(projectKey);
    res.json({ priorities });
  } catch (err) {
    console.error("Get project priorities error:", err.message);
    res.status(500).json({ error: "Failed to get project priorities" });
  }
};

module.exports = { getProjectGraph, getProjectUsersHandler, getProjectStatusesHandler, getProjectPrioritiesHandler };