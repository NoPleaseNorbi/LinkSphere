const { get } = require("../models/jiraCredentials");

const getProjectGraph = async (req, res) => {
  try {
    const { projectKey } = req.params;
  } catch (err) {
    console.error("Get project graph error:", err.message);
    res.status(500).json({ error: "Failed to get project graph" });
  }
}

module.exports = { 
  getProjectGraph 
};