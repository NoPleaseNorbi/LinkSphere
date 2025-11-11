// Create sample nodes
CREATE (i:Issue {id: 'JIRA-123', title: 'Login Bug'}),
  (p:Page {id: 'CONF-42', title: 'User Guide'}),
  (i)-[:LINKED_TO]->(p);
