import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fetchAllMembers, fetchMembersSummary } from '../projectMembers';
import { ENDPOINTS } from '../../utils/URL';

// Mock axios
vi.mock('axios');
const mockedAxios = axios;

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('projectMembers actions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAllMembers', () => {
    it('should create FETCH_MEMBERS_START and RECEIVE_MEMBERS when fetching members has been done', async () => {
      const projectId = 'test-project-id';
      const mockMembers = [
        { _id: '1', firstName: 'John', lastName: 'Doe', isActive: true, profilePic: 'pic1.jpg' },
        { _id: '2', firstName: 'Jane', lastName: 'Smith', isActive: false, profilePic: 'pic2.jpg' }
      ];

      mockedAxios.get.mockResolvedValue({ data: mockMembers });

      const expectedActions = [
        { type: 'FETCH_MEMBERS_START' },
        { type: 'FOUND_USERS', users: [] },
        { type: 'RECIVES_MEMBERS', members: mockMembers }
      ];

      const store = mockStore({});
      await store.dispatch(fetchAllMembers(projectId));

      expect(mockedAxios.get).toHaveBeenCalledWith(ENDPOINTS.PROJECT_MEMBER(projectId));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should create FETCH_MEMBERS_START and FETCH_MEMBERS_ERROR when fetching members fails', async () => {
      const projectId = 'test-project-id';
      const errorMessage = 'Network Error';

      mockedAxios.get.mockRejectedValue(new Error(errorMessage));

      const expectedActions = [
        { type: 'FETCH_MEMBERS_START' },
        { type: 'FOUND_USERS', users: [] },
        { type: 'FETCH_MEMBERS_ERROR', err: new Error(errorMessage) }
      ];

      const store = mockStore({});
      await store.dispatch(fetchAllMembers(projectId));

      expect(mockedAxios.get).toHaveBeenCalledWith(ENDPOINTS.PROJECT_MEMBER(projectId));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('fetchMembersSummary', () => {
    it('should create FETCH_MEMBERS_START and RECEIVE_MEMBERS when fetching members summary has been done', async () => {
      const projectId = 'test-project-id';
      const mockMembersSummary = [
        { _id: '1', firstName: 'John', lastName: 'Doe', isActive: true },
        { _id: '2', firstName: 'Jane', lastName: 'Smith', isActive: false }
      ];

      mockedAxios.get.mockResolvedValue({ data: mockMembersSummary });

      const expectedActions = [
        { type: 'FETCH_MEMBERS_START' },
        { type: 'FOUND_USERS', users: [] },
        { type: 'RECIVES_MEMBERS', members: mockMembersSummary }
      ];

      const store = mockStore({});
      await store.dispatch(fetchMembersSummary(projectId));

      expect(mockedAxios.get).toHaveBeenCalledWith(ENDPOINTS.PROJECT_MEMBER_SUMMARY(projectId));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should create FETCH_MEMBERS_START and FETCH_MEMBERS_ERROR when fetching members summary fails', async () => {
      const projectId = 'test-project-id';
      const errorMessage = 'Network Error';

      mockedAxios.get.mockRejectedValue(new Error(errorMessage));

      const expectedActions = [
        { type: 'FETCH_MEMBERS_START' },
        { type: 'FOUND_USERS', users: [] },
        { type: 'FETCH_MEMBERS_ERROR', err: new Error(errorMessage) }
      ];

      const store = mockStore({});
      await store.dispatch(fetchMembersSummary(projectId));

      expect(mockedAxios.get).toHaveBeenCalledWith(ENDPOINTS.PROJECT_MEMBER_SUMMARY(projectId));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should use the correct summary endpoint (without profile pics)', async () => {
      const projectId = 'test-project-id';
      mockedAxios.get.mockResolvedValue({ data: [] });

      const store = mockStore({});
      await store.dispatch(fetchMembersSummary(projectId));

      // Verify it calls the summary endpoint, not the full endpoint
      expect(mockedAxios.get).toHaveBeenCalledWith(ENDPOINTS.PROJECT_MEMBER_SUMMARY(projectId));
      expect(mockedAxios.get).not.toHaveBeenCalledWith(ENDPOINTS.PROJECT_MEMBER(projectId));
    });
  });

  describe('API endpoint differences', () => {
    it('should call different endpoints for fetchAllMembers vs fetchMembersSummary', async () => {
      const projectId = 'test-project-id';
      mockedAxios.get.mockResolvedValue({ data: [] });

      const store = mockStore({});

      // Test fetchAllMembers
      await store.dispatch(fetchAllMembers(projectId));
      expect(mockedAxios.get).toHaveBeenLastCalledWith(ENDPOINTS.PROJECT_MEMBER(projectId));

      // Clear previous calls
      mockedAxios.get.mockClear();

      // Test fetchMembersSummary
      await store.dispatch(fetchMembersSummary(projectId));
      expect(mockedAxios.get).toHaveBeenLastCalledWith(ENDPOINTS.PROJECT_MEMBER_SUMMARY(projectId));
    });
  });
});
