module.exports = (fromLabel, fromKey, toLabel, toKey, relationshipType) => {
  const fromProperty = fromLabel === 'Issue' ? 'key' : 
                       fromLabel === 'User' ? 'accountId' : 'pageId';
  const toProperty = toLabel === 'Issue' ? 'key' : 
                     toLabel === 'User' ? 'accountId' : 'pageId';
  
  return `
    MATCH (from:${fromLabel} {${fromProperty}: $fromKey})
    MATCH (to:${toLabel} {${toProperty}: $toKey})
    MERGE (from)-[r:${relationshipType}]->(to)
    SET r.createdAt = coalesce(r.createdAt, datetime())
    RETURN r
  `;
};