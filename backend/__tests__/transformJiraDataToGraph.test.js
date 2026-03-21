const transformJiraDataToGraph = require('../utils/transformJiraDataToGraph');

// Mock Jira issue factory
const createMockIssue = (overrides = {}) => ({
  key: 'PROJ-1',
  id: '10001',
  fields: {
    summary: 'Test issue',
    description: null,
    status: { name: 'In Progress' },
    priority: { name: 'High' },
    issuetype: { name: 'Task' },
    created: '2024-01-01T00:00:00.000Z',
    updated: '2024-01-02T00:00:00.000Z',
    assignee: null,
    reporter: null,
    issuelinks: [],
    parent: null,
    ...overrides.fields,
  },
  ...overrides,
});

describe('transformJiraDataToGraph', () => {

  describe('basic issue transformation', () => {
    it('should transform a single issue correctly', () => {
      const issues = [createMockIssue()];
      const result = transformJiraDataToGraph(issues);

      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].key).toBe('PROJ-1');
      expect(result.issues[0].summary).toBe('Test issue');
      expect(result.issues[0].status).toBe('In Progress');
      expect(result.issues[0].priority).toBe('High');
      expect(result.issues[0].issueType).toBe('Task');
      expect(result.issues[0].projectKey).toBe('PROJ');
    });

    it('should extract projectKey correctly from issue key', () => {
      const issues = [createMockIssue({ key: 'MYPROJECT-42' })];
      const result = transformJiraDataToGraph(issues);
      expect(result.issues[0].projectKey).toBe('MYPROJECT');
    });

    it('should handle missing optional fields gracefully', () => {
      const issues = [createMockIssue({
        fields: {
          summary: '',
          description: null,
          status: null,
          priority: null,
          issuetype: null,
          created: '',
          updated: '',
          assignee: null,
          reporter: null,
          issuelinks: [],
        }
      })];

      expect(() => transformJiraDataToGraph(issues)).not.toThrow();
      const result = transformJiraDataToGraph(issues);
      expect(result.issues[0].status).toBe('');
      expect(result.issues[0].priority).toBe('');
    });

    it('should return empty arrays for empty input', () => {
      const result = transformJiraDataToGraph([]);
      expect(result.issues).toHaveLength(0);
      expect(result.users).toHaveLength(0);
      expect(result.connections).toHaveLength(0);
    });
  });

  describe('user extraction', () => {
    it('should extract assignee as a user', () => {
      const issues = [createMockIssue({
        fields: {
          assignee: {
            accountId: 'user-123',
            displayName: 'John Doe',
            emailAddress: 'john@company.com',
            avatarUrls: { '48x48': 'https://avatar.url' },
          },
          issuelinks: [],
        }
      })];

      const result = transformJiraDataToGraph(issues);
      expect(result.users).toHaveLength(1);
      expect(result.users[0].accountId).toBe('user-123');
      expect(result.users[0].displayName).toBe('John Doe');
      expect(result.users[0].emailAddress).toBe('john@company.com');
    });

    it('should not duplicate users across multiple issues', () => {
      const assignee = {
        accountId: 'user-123',
        displayName: 'John Doe',
        emailAddress: 'john@company.com',
        avatarUrls: { '48x48': '' },
      };

      const issues = [
        createMockIssue({ key: 'PROJ-1', fields: { assignee, issuelinks: [] } }),
        createMockIssue({ key: 'PROJ-2', fields: { assignee, issuelinks: [] } }),
      ];

      const result = transformJiraDataToGraph(issues);
      expect(result.users).toHaveLength(1);
    });

    it('should create ASSIGNED_TO connection for assignee', () => {
      const issues = [createMockIssue({
        fields: {
          assignee: {
            accountId: 'user-123',
            displayName: 'John Doe',
            emailAddress: 'john@company.com',
            avatarUrls: { '48x48': '' },
          },
          issuelinks: [],
        }
      })];

      const result = transformJiraDataToGraph(issues);
      const assignedTo = result.connections.find(c => c.type === 'ASSIGNED_TO');
      expect(assignedTo).toBeDefined();
      expect(assignedTo.fromKey).toBe('PROJ-1');
      expect(assignedTo.toKey).toBe('user-123');
    });

    it('should not create connection for null assignee', () => {
      const issues = [createMockIssue({ fields: { assignee: null, issuelinks: [] } })];
      const result = transformJiraDataToGraph(issues);
      expect(result.connections).toHaveLength(0);
    });
  });

  describe('issue links', () => {
    it('should create connection for outward issue link', () => {
      const issues = [createMockIssue({
        fields: {
          assignee: null,
          issuelinks: [{
            type: { outward: 'blocks', inward: 'is blocked by' },
            outwardIssue: { key: 'PROJ-2' },
          }],
        }
      })];

      const result = transformJiraDataToGraph(issues);
      const link = result.connections.find(c => c.type === 'BLOCKS');
      expect(link).toBeDefined();
      expect(link.fromKey).toBe('PROJ-1');
      expect(link.toKey).toBe('PROJ-2');
    });

    it('should not create connection for inward issue link', () => {
      const issues = [createMockIssue({
        fields: {
          assignee: null,
          issuelinks: [{
            type: { outward: 'blocks', inward: 'is blocked by' },
            inwardIssue: { key: 'PROJ-2' },
          }],
        }
      })];

      const result = transformJiraDataToGraph(issues);
      expect(result.connections).toHaveLength(0);
    });

    it('should format link type correctly', () => {
      const issues = [createMockIssue({
        fields: {
          assignee: null,
          issuelinks: [{
            type: { outward: 'is cloned by' },
            outwardIssue: { key: 'PROJ-2' },
          }],
        }
      })];

      const result = transformJiraDataToGraph(issues);
      expect(result.connections[0].type).toBe('IS_CLONED_BY');
    });
  });

  describe('subtask detection', () => {
    it('should create SUBTASK_OF connection when parent exists', () => {
      const issues = [createMockIssue({
        fields: {
          assignee: null,
          issuelinks: [],
          parent: { key: 'PROJ-1' },
        },
        key: 'PROJ-2',
      })];

      const result = transformJiraDataToGraph(issues);
      const subtaskConn = result.connections.find(c => c.type === 'SUBTASK_OF');
      expect(subtaskConn).toBeDefined();
      expect(subtaskConn.fromKey).toBe('PROJ-2');
      expect(subtaskConn.toKey).toBe('PROJ-1');
    });

    it('should not create SUBTASK_OF connection when no parent', () => {
      const issues = [createMockIssue({
        fields: { assignee: null, issuelinks: [], parent: null }
      })];

      const result = transformJiraDataToGraph(issues);
      expect(result.connections.find(c => c.type === 'SUBTASK_OF')).toBeUndefined();
    });
  });

  describe('description extraction', () => {
    it('should extract text from Atlassian Document Format', () => {
      const issues = [createMockIssue({
        fields: {
          assignee: null,
          issuelinks: [],
          description: {
            type: 'doc',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: 'Hello world' }]
            }]
          }
        }
      })];

      const result = transformJiraDataToGraph(issues);
      expect(result.issues[0].description).toBe('Hello world');
    });

    it('should handle plain string description', () => {
      const issues = [createMockIssue({
        fields: { assignee: null, issuelinks: [], description: 'Plain text' }
      })];

      const result = transformJiraDataToGraph(issues);
      expect(result.issues[0].description).toBe('Plain text');
    });

    it('should handle null description', () => {
      const issues = [createMockIssue({
        fields: { assignee: null, issuelinks: [], description: null }
      })];

      const result = transformJiraDataToGraph(issues);
      expect(result.issues[0].description).toBe('');
    });
  });
});