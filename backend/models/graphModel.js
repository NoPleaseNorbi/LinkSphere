const neo4j = require("neo4j-driver");
const createUserQuery = require("../models/createUser");
const createIssueQuery = require("../models/createIssue");
const createConnectionQuery = require("../models/createConnection");

// Initialize driver once
const uri = process.env.NEO4J_URI || "bolt://localhost:7687";
const user = process.env.NEO4J_USER || "neo4j";
const password = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

const saveProjectGraphToDB = async (projectData) => {
  const { issues, users, connections } = projectData;
  const results = {
    usersCreated: 0,
    issuesCreated: 0,
    connectionsCreated: 0,
    errors: [],
  };

  const session = driver.session();

  try {
    // Create users
    if (users && users.length > 0) {
      for (const user of users) {
        try {
          await session.run(createUserQuery, user);
          results.usersCreated++;
        } catch (err) {
          results.errors.push(`User ${user.accountId}: ${err.message}`);
        }
      }
    }

    // Create issues
    if (issues && issues.length > 0) {
      for (const issue of issues) {
        try {
          await session.run(createIssueQuery, issue);
          results.issuesCreated++;
        } catch (err) {
          results.errors.push(`Issue ${issue.key}: ${err.message}`);
        }
      }
    }

    // Create connections
    if (connections && connections.length > 0) {
      for (const conn of connections) {
        try {
          const query = createConnectionQuery(
            conn.fromLabel,
            conn.fromKey,
            conn.toLabel,
            conn.toKey,
            conn.type || "RELATED_TO"
          );
          await session.run(query, { 
            fromKey: conn.fromKey, 
            toKey: conn.toKey,
          });
          results.connectionsCreated++;
        } catch (err) {
          results.errors.push(`Connection ${conn.fromKey}->${conn.toKey}: ${err.message}`);
        }
      }
    }

    return results;
  } catch (err) {
    throw new Error(`Failed to save project graph: ${err.message}`);
  } finally {
    await session.close();
  }
}

const getProjectGraphFromDB = async (projectKey) => {
  const session = driver.session();
  try {
    // Query to get all nodes and relationships for a project
    const result = await session.run(`
      MATCH (i:Issue {projectKey: $projectKey})
      OPTIONAL MATCH (i)-[r]-(connected)
      RETURN i, collect({rel: r, relType: type(r), node: connected}) as connections
    `, { projectKey });

    const nodes = [];
    const edges = [];
    const nodeIds = new Set();

    result.records.forEach(record => {
      const issue = record.get('i').properties;
      const issueId = issue.key;

      // Add issue node if not already added
      if (!nodeIds.has(issueId)) {
        nodes.push({
          id: issueId,
          label: issue.key,
          type: 'issue',
          data: {
            summary: issue.summary,
            status: issue.status,
            priority: issue.priority,
            issueType: issue.issueType,
            description: issue.description,
            assignee: issue.assignee,
            assigneeAvatar: issue.assigneeAvatar,
            assigneeEmail: issue.assigneeEmail,
            reporter: issue.reporter,
            reporterAvatar: issue.reporterAvatar,
            reporterEmail: issue.reporterEmail,
          }
        });
        nodeIds.add(issueId);
      }

      // Process connections
      const connections = record.get('connections');
      connections.forEach(conn => {
        if (conn.rel && conn.node) {
          const rel = conn.rel;
          const connectedNode = conn.node.properties;
          const connectedId = connectedNode.key || connectedNode.accountId;

          // Add connected node if not already added
          if (connectedId && !nodeIds.has(connectedId)) {
            const nodeType = conn.node.labels[0].toLowerCase();
            nodes.push({
              id: connectedId,
              label: connectedNode.displayName || connectedNode.key,
              type: nodeType,
              data: connectedNode
            });
            nodeIds.add(connectedId);
          }

          // Add edge
          if (connectedId) {
            edges.push({
              id: `${issueId}-${conn.relType}-${connectedId}`,
              source: issueId,
              target: connectedId,
              label: conn.relType.toLowerCase().replace(/_/g, ' '),
              type: conn.relType
            });
          }
        }
      });
    });

    return { nodes, edges };
  } catch (err) {
    throw new Error(`Failed to get project graph: ${err.message}`);
  } finally {
    await session.close();
  }
}

const getProjectUsers = async (projectKey) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (i:Issue {projectKey: $projectKey})-[:ASSIGNED_TO]->(u:User)
      RETURN DISTINCT u.accountId as accountId, u.displayName as displayName
      ORDER BY u.displayName
    `, { projectKey });

    return result.records.map(r => ({
      accountId: r.get('accountId'),
      displayName: r.get('displayName'),
    }));
  } finally {
    await session.close();
  }
};

const getProjectStatuses = async (projectKey) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (i:Issue {projectKey: $projectKey})
      RETURN DISTINCT i.status as status
      ORDER BY i.status
    `, { projectKey });

    return result.records
      .map(r => r.get('status'))
      .filter(Boolean);
  } finally {
    await session.close();
  }
};

const getProjectPriorities = async (projectKey) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (i:Issue {projectKey: $projectKey})
      RETURN DISTINCT i.priority as priority
      ORDER BY i.priority
    `, { projectKey });

    return result.records
      .map(r => r.get('priority'))
      .filter(Boolean);
  } finally {
    await session.close();
  }
};

module.exports = { 
  saveProjectGraphToDB, 
  getProjectGraphFromDB, 
  getProjectUsers, 
  getProjectStatuses,
  getProjectPriorities
};
