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
          await session.run(query, { fromKey: conn.fromKey, toKey: conn.toKey });
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

module.exports = saveProjectGraphToDB ;