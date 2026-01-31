const axios = require("axios");
const JiraCredentials = require("../models/JiraCredentials");

const JiraController = {
  createAtlassianClient(email, apiToken, domain) {
    const baseUrl = domain.startsWith("http") ? domain : `https://${domain}`;
    const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");

    return axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
      timeout: 10000,
    });
  },

  // POST /api/jira/credentials
  async saveCredentials(req, res) {
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
  },

  // GET /api/jira/projects
  async getProjects(req, res) {
    try {
      const creds = await JiraCredentials.get();
      if (!creds) {
        return res.status(400).json({ error: "Credentials not configured" });
      }

      const atlassian = JiraController.createAtlassianClient(creds.email, creds.api_token, creds.domain);
      const response = await atlassian.get("/rest/api/3/project/search");

      res.json(response.data);
    } catch (err) {
      console.error("Jira API error:", err.message);

      if (err.response?.status === 401) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.status(500).json({ error: "Failed to fetch projects" });
    }
  },

  // GET /api/jira/issue/:issueId
  async getIssue(req, res) {
    try {
      const creds = await JiraCredentials.get();
      if (!creds) {
        return res.status(400).json({ error: "Credentials not configured" });
      }

      const { issueId } = req.params;
      const atlassian = JiraController.createAtlassianClient(creds.email, creds.api_token, creds.domain);
      const response = await atlassian.get(`/rest/api/3/issue/${issueId}`);

      res.json(response.data);
    } catch (err) {
      console.error("Jira API error:", err.message);
      res.status(500).json({ error: "Failed to fetch issue" });
    }
  },

  // GET /api/jira/project/:projectKey/issues
  async getProjectIssues(req, res) {
    try {
      const creds = await JiraCredentials.get();
      if (!creds) {
        return res.status(400).json({ error: "Credentials not configured" });
      }

      const { projectKey } = req.params;
      const atlassian = JiraController.createAtlassianClient(creds.email, creds.api_token, creds.domain);
      const response = await atlassian.get(
        `/rest/api/3/search?jql=project=${projectKey}&maxResults=50`
      );

      res.json(response.data.issues);
    } catch (err) {
      console.error("Jira API error:", err.message);
      res.status(500).json({ error: "Failed to fetch issues" });
    }
  },
};

module.exports = JiraController;