const JiraCredentials = require("../models/jiraCredentials");
const createAtlassianClient = require("../utils/atlassianClient");
const fetchAllProjectIssues = require("../utils/fetchAllProjectIssues");
const transformJiraDataToGraph = require("../utils/transformJiraDataToGraph");
const fetchConfluencePages = require('../utils/fetchConfluencePages');
const { saveProjectGraphToDB } = require("../models/graphModel");

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
    const { projectKey } = req.body;

    if (!projectKey) {
      return res.status(400).json({
        error: "Project key is required",
      });
    }

    // Get stored credentials
    const creds = await JiraCredentials.get();
    if (!creds) {
      return res.status(400).json({
        error: "Credentials not configured",
      });
    }

    // Create Jira client
    const atlassian = createAtlassianClient(creds.email, creds.api_token, creds.domain);

    // Fetch all issues from the project
    const issues = await fetchAllProjectIssues(atlassian, projectKey);

    if (!issues || issues.length === 0) {
      return res.status(404).json({
        error: "No issues found for this project",
      });
    }

    // Transform Jira data to graph format
    const graphData = transformJiraDataToGraph(issues);

    const pages = [];
    const pageConnections = [];
    const pageIds = new Set();
    
    for (const issue of issues) {
      const confluencePages = await fetchConfluencePages(atlassian, issue.key);
      
      for (const page of confluencePages) {
        if (!pageIds.has(page.pageId)) {
          pages.push({
            pageId: page.pageId,
            title: page.title,
            url: page.url,
          });
          pageIds.add(page.pageId);
        }

        pageConnections.push({
          fromLabel: 'Issue',
          fromKey: issue.key,
          toLabel: 'Page',
          toKey: page.pageId,
          type: 'LINKED_TO_PAGE',
        });
      }
    }
    // Save to Neo4j
    const results = await saveProjectGraphToDB({ ...graphData, pages, pageConnections });

    res.json({
      success: true,
      message: "Project graph saved successfully",
      stats: {
        issuesProcessed: issues.length,
        usersCreated: results.usersCreated,
        issuesCreated: results.issuesCreated,
        connectionsCreated: results.connectionsCreated,
        pagesCreated: results.pagesCreated,
        errors: results.errors,
      },
    });
  } catch (err) {
    console.error("Save project graph error:", err.message);
    console.error("Error response:", err.response?.data);
    console.error("Error status:", err.response?.status);
    console.error("Request URL:", err.config?.url);

    if (err.response?.status === 401) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(500).json({ error: "Failed to save project graph" });
  }
};

 
module.exports = {
  saveCredentials,
  getProjects,
  saveProjectGraph
}