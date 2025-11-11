const { getSession } = require('../neo4j');

const GraphModel = {
  async createIssueNode(issueId, title) {
    const session = getSession();
    try {
      await session.run(
        'MERGE (i:Issue {id: $id}) SET i.title = $title RETURN i',
        { id: issueId, title }
      );
    } finally {
      await session.close();
    }
  },

  async linkIssueToPage(issueId, pageId) {
    const session = getSession();
    try {
      await session.run(
        `
        MATCH (i:Issue {id: $issueId}), (p:Page {id: $pageId})
        MERGE (i)-[:LINKED_TO]->(p)
        `,
        { issueId, pageId }
      );
    } finally {
      await session.close();
    }
  },

  async getIssueGraph(issueId) {
    const session = getSession();
    try {
      const result = await session.run(
        `
        MATCH (i:Issue {id: $issueId})-[r:LINKED_TO]->(p:Page)
        RETURN i, r, p
        `,
        { issueId }
      );

      return result.records.map(rec => ({
        issue: rec.get('i').properties,
        page: rec.get('p').properties,
      }));
    } finally {
      await session.close();
    }
  }
};

module.exports = GraphModel;
