// Mock the database pool
jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

const pool = require('../config/db');
const JiraCredentials = require('../models/jiraCredentials');

describe('JiraCredentials', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return credentials when they exist', async () => {
      pool.query.mockResolvedValue({
        rows: [{ email: 'test@test.com', api_token: 'token123', domain: 'test.atlassian.net' }]
      });

      const result = await JiraCredentials.get();
      expect(result.email).toBe('test@test.com');
      expect(result.api_token).toBe('token123');
      expect(result.domain).toBe('test.atlassian.net');
    });

    it('should return null when no credentials exist', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const result = await JiraCredentials.get();
      expect(result).toBeNull();
    });

    it('should query the correct table', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      await JiraCredentials.get();
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('jira_credentials')
      );
    });
  });

  describe('save', () => {
    it('should save credentials correctly', async () => {
      pool.query.mockResolvedValue({
        rows: [{ email: 'test@test.com', api_token: 'token123', domain: 'test.atlassian.net' }]
      });

      const result = await JiraCredentials.save('test@test.com', 'token123', 'test.atlassian.net');
      expect(result.email).toBe('test@test.com');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        ['test@test.com', 'token123', 'test.atlassian.net']
      );
    });

    it('should use upsert to handle existing credentials', async () => {
      pool.query.mockResolvedValue({ rows: [{}] });
      await JiraCredentials.save('test@test.com', 'token123', 'test.atlassian.net');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT'),
        expect.any(Array)
      );
    });
  });

  describe('clear', () => {
    it('should delete credentials', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      await JiraCredentials.clear();
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE'),
      );
    });

    it('should delete only the credentials row with id 1', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      await JiraCredentials.clear();
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = 1'),
      );
    });
  });
});