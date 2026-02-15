module.exports = (fromLabel, fromKey, toLabel, toKey, relationshipType) => {
  const fromProperty = fromLabel === "Issue" ? "key" : "accountId";
  const toProperty = toLabel === "Issue" ? "key" : "accountId";
  
  return `
    MATCH (from:${fromLabel} {${fromProperty}: $fromKey})
    MATCH (to:${toLabel} {${toProperty}: $toKey})
    MERGE (from)-[r:${relationshipType}]->(to)
    SET r.createdAt = coalesce(r.createdAt, datetime())
    RETURN r
  `;
};