// Helper function to extract text from Atlassian Document Format
const extractTextFromDescription = (description) => {
  if (!description) return "";
  
  // If it's already a string, return it
  if (typeof description === "string") return description;
  
  // If it's an Atlassian Document Format object
  if (description.type === "doc" && description.content) {
    let text = "";
    
    const traverse = (node) => {
      if (node.text) {
        text += node.text;
      }
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(traverse);
      }
    }
    
    description.content.forEach(traverse);
    return text.trim();
  }
  
  // Fallback: convert to JSON string
  return JSON.stringify(description);
}
// Helper function to transform Jira API response to graph format
const transformJiraDataToGraph = (jiraIssues) => {
  const users = new Map();
  const issues = [];
  const connections = [];

  jiraIssues.forEach((issue) => {
    const fields = issue.fields;

    // Extract issue data
    const issueData = {
      key: issue.key,
      issueId: issue.id,
      summary: fields.summary || "",
      description: extractTextFromDescription(fields.description) || "",
      status: fields.status?.name || "",
      priority: fields.priority?.name || "",
      issueType: fields.issuetype?.name || "",
      created: fields.created || "",
      updated: fields.updated || "",
      projectKey: issue.key.split("-")[0],
      assignee: fields.assignee?.displayName || "",
      assigneeAvatar: fields.assignee?.avatarUrls?.["48x48"] || "",
      assigneeEmail: fields.assignee?.emailAddress || "",
      reporter: fields.reporter?.displayName || "",
      reporterAvatar: fields.reporter?.avatarUrls?.["48x48"] || "",
      reporterEmail: fields.reporter?.emailAddress || "",
    };
    issues.push(issueData);

    // Extract users (assignee, reporter, creator)
    const userFields = ["assignee", "reporter", "creator"];
    userFields.forEach((fieldName) => {
      const user = fields[fieldName];
      if (user && user.accountId) {
        if (!users.has(user.accountId)) {
          users.set(user.accountId, {
            accountId: user.accountId,
            displayName: user.displayName || "",
            emailAddress: user.emailAddress || "",
            avatarUrl: user.avatarUrls?.["48x48"] || "",
          });
        }

        // Create connection between issue and user
        connections.push({
          fromLabel: "Issue",
          fromKey: issue.key,
          toLabel: "User",
          toKey: user.accountId,
          type: fieldName.toUpperCase(), // ASSIGNEE, REPORTER, CREATOR
        });
      }
    });

    // Extract issue links (connections between issues)
    if (fields.issuelinks && fields.issuelinks.length > 0) {
      fields.issuelinks.forEach((link) => {
        let linkedIssueKey = null;

        if (link.outwardIssue) {
          linkedIssueKey = link.outwardIssue.key;
        } else if (link.inwardIssue) {
          linkedIssueKey = link.inwardIssue.key;
        }

        if (linkedIssueKey) {
          connections.push({
            fromLabel: "Issue",
            fromKey: issue.key,
            toLabel: "Issue",
            toKey: linkedIssueKey,
            type: "LINKED_TO",
          });
        }
      });
    }
  });

  return {
    users: Array.from(users.values()),
    issues,
    connections,
  };
}

module.exports = transformJiraDataToGraph;