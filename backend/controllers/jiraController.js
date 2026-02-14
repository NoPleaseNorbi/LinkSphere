const JiraCredentials = require("../models/jiraCredentials");
const { createAtlassianClient } = require("../utils/atlassianClient");

const saveCredentials = async (req, res) => {
  try {
    const { email, apiToken, domain } = req.body;

    if (!email || !apiToken || !domain) {
      return res.status(400).json({
        error: "Email, API token, and domain are required",
      });
    }

    await JiraCredentials.save(email, apiToken, domain);

    res.json({ success: true, message: "Credentials saved" });
  } catch (err) {
    console.error("Save credentials error:", err.message);
    res.status(500).json({ error: "Failed to save credentials" });
  }
}

const getProjects = async (req, res) => {
  try {
    const creds = await JiraCredentials.get();
    if (!creds) {
      return res.status(400).json({ error: "Credentials not configured" });
    }

    const atlassian = createAtlassianClient(creds.email, creds.api_token, creds.domain);
    
    const response = await atlassian.get("/rest/api/3/project/search");
    const projects = response.data.values || [];

    res.json(projects);
  } catch (err) {
    console.error("Jira API error:", err.message);

    if (err.response?.status === 401) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(500).json({ error: "Failed to fetch projects" });
  }
}

const saveProjectGraph = async (req, res) => {
  try {
    res.json({ success: true, message: "Project graph saved successfully" });
  } catch (err) {
    console.error("Save project graph error:", err.message);
    res.status(500).json({ error: "Failed to save project graph" });
  }
}
 
module.exports = {
  saveCredentials,
  getProjects,
  saveProjectGraph
}