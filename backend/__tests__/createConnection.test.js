const createConnectionQuery = require('../models/createConnection');

describe('createConnectionQuery', () => {
  it('should create query with correct property for Issue to Issue', () => {
    const query = createConnectionQuery('Issue', 'PROJ-1', 'Issue', 'PROJ-2', 'BLOCKS');
    expect(query).toContain('Issue {key: $fromKey}');
    expect(query).toContain('Issue {key: $toKey}');
    expect(query).toContain('BLOCKS');
  });

  it('should create query with accountId for User nodes', () => {
    const query = createConnectionQuery('Issue', 'PROJ-1', 'User', 'user-123', 'ASSIGNED_TO');
    expect(query).toContain('Issue {key: $fromKey}');
    expect(query).toContain('User {accountId: $toKey}');
    expect(query).toContain('ASSIGNED_TO');
  });

  it('should create query with pageId for Page nodes', () => {
    const query = createConnectionQuery('Issue', 'PROJ-1', 'Page', 'page-123', 'LINKED_TO_PAGE');
    expect(query).toContain('Page {pageId: $toKey}');
  });

  it('should use MERGE to avoid duplicate relationships', () => {
    const query = createConnectionQuery('Issue', 'PROJ-1', 'Issue', 'PROJ-2', 'BLOCKS');
    expect(query).toContain('MERGE');
  });
});