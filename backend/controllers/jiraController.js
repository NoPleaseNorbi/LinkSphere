const atlassian = require("../utils/atlassianClient");

const JiraController = {
  async getProjects(req, res) {
    try {
      const response = await atlassian.get("/rest/api/3/project");
      res.json(response.data);
    } catch (err) {
      console.error("Jira API error:", err.message);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  },

  async getIssue(req, res) {
    const { issueId } = req.params;
    try {
      const response = await atlassian.get(`/rest/api/3/issue/${issueId}`);
      res.json(response.data);
    } catch (err) {
      console.error("Jira API error:", err.message);
      res.status(500).json({ error: "Failed to fetch issue" });
    }
  },

  async getProjectIssues(req, res) {
  const { projectKey } = req.params;

  try {
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
