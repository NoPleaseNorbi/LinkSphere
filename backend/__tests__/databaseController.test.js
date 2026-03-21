// Mock graphModel
jest.mock('../models/graphModel', () => ({
  getProjectGraphFromDB: jest.fn(),
  getProjectUsers: jest.fn(),
  getProjectStatuses: jest.fn(),
  getProjectPriorities: jest.fn(),
  getAllUsers: jest.fn(),
  getUserGraphFromDB: jest.fn(),
}));

const {
  getProjectGraphFromDB,
  getProjectUsers,
  getProjectStatuses,
  getProjectPriorities,
  getAllUsers,
  getUserGraphFromDB,
} = require('../models/graphModel');

const {
  getProjectGraph,
  getProjectUsersHandler,
  getProjectStatusesHandler,
  getProjectPrioritiesHandler,
  getAllUsersHandler,
  getUserGraph,
} = require('../controllers/databaseController');

// Helper to create mock req/res
const mockReq = (params = {}, body = {}) => ({ params, body });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('databaseController', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });
  
  describe('getProjectGraph', () => {
    it('should return graph data for valid projectKey', async () => {
      const mockGraph = { nodes: [{ id: 'PROJ-1' }], edges: [] };
      getProjectGraphFromDB.mockResolvedValue(mockGraph);

      const req = mockReq({ projectKey: 'PROJ' });
      const res = mockRes();

      await getProjectGraph(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        projectKey: 'PROJ',
        graph: mockGraph,
      });
    });

    it('should return 400 when projectKey is missing', async () => {
      const req = mockReq({});
      const res = mockRes();

      await getProjectGraph(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Project key is required' });
    });

    it('should return 500 on database error', async () => {
      getProjectGraphFromDB.mockRejectedValue(new Error('DB error'));

      const req = mockReq({ projectKey: 'PROJ' });
      const res = mockRes();

      await getProjectGraph(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getProjectUsersHandler', () => {
    it('should return users for valid projectKey', async () => {
      const mockUsers = [{ accountId: '123', displayName: 'John' }];
      getProjectUsers.mockResolvedValue(mockUsers);

      const req = mockReq({ projectKey: 'PROJ' });
      const res = mockRes();

      await getProjectUsersHandler(req, res);

      expect(res.json).toHaveBeenCalledWith({ users: mockUsers });
    });

    it('should return 400 when projectKey is missing', async () => {
      const req = mockReq({});
      const res = mockRes();

      await getProjectUsersHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return empty array when no users found', async () => {
      getProjectUsers.mockResolvedValue([]);

      const req = mockReq({ projectKey: 'PROJ' });
      const res = mockRes();

      await getProjectUsersHandler(req, res);

      expect(res.json).toHaveBeenCalledWith({ users: [] });
    });
  });

  describe('getProjectStatusesHandler', () => {
    it('should return statuses for valid projectKey', async () => {
      const mockStatuses = ['In Progress', 'Done', 'To Do'];
      getProjectStatuses.mockResolvedValue(mockStatuses);

      const req = mockReq({ projectKey: 'PROJ' });
      const res = mockRes();

      await getProjectStatusesHandler(req, res);

      expect(res.json).toHaveBeenCalledWith({ statuses: mockStatuses });
    });

    it('should return 400 when projectKey is missing', async () => {
      const req = mockReq({});
      const res = mockRes();

      await getProjectStatusesHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getProjectPrioritiesHandler', () => {
    it('should return priorities for valid projectKey', async () => {
      const mockPriorities = ['High', 'Medium', 'Low'];
      getProjectPriorities.mockResolvedValue(mockPriorities);

      const req = mockReq({ projectKey: 'PROJ' });
      const res = mockRes();

      await getProjectPrioritiesHandler(req, res);

      expect(res.json).toHaveBeenCalledWith({ priorities: mockPriorities });
    });

    it('should return 400 when projectKey is missing', async () => {
      const req = mockReq({});
      const res = mockRes();

      await getProjectPrioritiesHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getAllUsersHandler', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { accountId: '123', displayName: 'John', emailAddress: 'john@test.com' },
        { accountId: '456', displayName: 'Jane', emailAddress: 'jane@test.com' },
      ];
      getAllUsers.mockResolvedValue(mockUsers);

      const req = mockReq();
      const res = mockRes();

      await getAllUsersHandler(req, res);

      expect(res.json).toHaveBeenCalledWith({ users: mockUsers });
    });

    it('should return 500 on database error', async () => {
      getAllUsers.mockRejectedValue(new Error('DB error'));

      const req = mockReq();
      const res = mockRes();

      await getAllUsersHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getUserGraph', () => {
    it('should return graph for valid accountId', async () => {
      const mockGraph = { nodes: [{ id: 'user-123' }], edges: [] };
      getUserGraphFromDB.mockResolvedValue(mockGraph);

      const req = mockReq({ accountId: 'user-123' });
      const res = mockRes();

      await getUserGraph(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        accountId: 'user-123',
        graph: mockGraph,
      });
    });

    it('should return 400 when accountId is missing', async () => {
      const req = mockReq({});
      const res = mockRes();

      await getUserGraph(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 500 on database error', async () => {
      getUserGraphFromDB.mockRejectedValue(new Error('DB error'));

      const req = mockReq({ accountId: 'user-123' });
      const res = mockRes();

      await getUserGraph(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});