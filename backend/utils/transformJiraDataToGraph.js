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

    const userFieldLabels = {
      assignee: { type: "ASSIGNED_TO", displayLabel: "assigned to" },
    };

    Object.keys(userFieldLabels).forEach((fieldName) => {
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

        connections.push({
          fromLabel: "Issue",
          fromKey: issue.key,
          toLabel: "User",
          toKey: user.accountId,
          type: "ASSIGNED_TO",
          displayLabel: "assigned to",
        });
      }
    });

    // Extract issue links (connections between issues)
    if (fields.issuelinks && fields.issuelinks.length > 0) {
      fields.issuelinks.forEach((link) => {
        // Only process outward links to avoid duplicates in both directions
        if (link.outwardIssue) {
          connections.push({
            fromLabel: "Issue",
            fromKey: issue.key,
            toLabel: "Issue",
            toKey: link.outwardIssue.key,
            type: link.type?.outward?.toUpperCase().replace(/ /g, "_") || "LINKED_TO",
            displayLabel: link.type?.outward || "linked to",
          });
        }
      });
    }
    if (fields.parent) {
      connections.push({
        fromLabel: "Issue",
        fromKey: issue.key,
        toLabel: "Issue",
        toKey: fields.parent.key,
        type: "SUBTASK_OF",
        displayLabel: "subtask of",
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