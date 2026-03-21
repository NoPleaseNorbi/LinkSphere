// Helper function to fetch all issues from a Jira project
const fetchAllProjectIssues = async (atlassian, projectKey) => {
  let allIssues = [];
  let startAt = 0;
  const maxResults = 50;
  let total = 0;

  do {
    const response = await atlassian.get("/rest/api/3/search/jql", {
      params: {
        jql: `project = ${projectKey}`,
        startAt,
        maxResults,
        fields: [
          "summary",
          "description",
          "status",
          "priority",
          "issuetype",
          "created",
          "updated",
          "assignee",
          "reporter",
          "creator",
          "issuelinks",
          "parent",
        ].join(","),
      },
    });

    allIssues = allIssues.concat(response.data.issues || []);
    total = response.data.total || 0;
    startAt += maxResults;
  } while (startAt < total);

  return allIssues;
}

module.exports = fetchAllProjectIssues;