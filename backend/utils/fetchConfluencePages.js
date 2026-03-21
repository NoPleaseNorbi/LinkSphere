const fetchConfluencePages = async (atlassian, issueKey) => {
  try {
    const response = await atlassian.get(`/rest/api/3/issue/${issueKey}/remotelink`);
    const remoteLinks = response.data;

    // Filter only Confluence links
    return remoteLinks
      .filter(link => link.object?.url?.includes('/wiki/') || 
                      link.object?.url?.includes('confluence'))
      .map(link => ({
        pageId: link.id.toString(),
        title: link.object?.title || 'Untitled',
        url: link.object?.url || '',
        issueKey,
      }));
  } catch (err) {
    console.error(`Failed to fetch remote links for ${issueKey}:`, err.message);
    return [];
  }
};

module.exports = fetchConfluencePages;