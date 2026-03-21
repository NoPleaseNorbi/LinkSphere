module.exports = `
  MERGE (p:Page {pageId: $pageId})
  SET p.title = $title,
      p.url = $url,
      p.updatedAt = datetime()
  RETURN p
`;