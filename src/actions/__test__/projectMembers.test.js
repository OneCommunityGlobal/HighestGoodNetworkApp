import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import * as actions from '../projectMembers';
import * as types from '../../constants/projectMembership';
import { ENDPOINTS } from '../../utils/URL';

// Mock axios
jest.mock('axios');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Project Member Actions', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      projectMembers: {
        members: [],
        foundUsers: [],
        loading: false,
        error: null
      }
    });
    jest.clearAllMocks();
  });

  describe('getAllUserProfiles', () => {
    const mockUsers = [
      { _id: '1', firstName: 'John', lastName: 'Doe' },
      { _id: '2', firstName: 'Jane', lastName: 'Smith' }
    ];

    it('should fetch all users and mark them as unassigned when successful', async () => {
      axios.get.mockResolvedValueOnce({ data: mockUsers });

      const expectedActions = [
        { type: types.FIND_USERS_START },
        { 
          type: types.FOUND_USERS, 
          users: mockUsers.map(user => ({ ...user, assigned: false }))
        }
      ];

      await store.dispatch(actions.getAllUserProfiles());
      expect(store.getActions()).toEqual(expectedActions);
      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.USER_PROFILES);
    });

   
  });

  describe('findUserProfiles', () => {
    const keyword = 'John';
    const mockUsers = [
      { _id: '1', firstName: 'John', lastName: 'Doe' }
    ];

    it('should find users by keyword when successful', async () => {
      axios.get.mockResolvedValueOnce({ data: mockUsers });

      const expectedActions = [
        { type: types.FIND_USERS_START },
        { 
          type: types.FOUND_USERS, 
          users: mockUsers.map(user => ({ ...user, assigned: false }))
        }
      ];

      await store.dispatch(actions.findUserProfiles(keyword));
      expect(store.getActions()).toEqual(expectedActions);
      expect(axios.get).toHaveBeenCalledWith(
        ENDPOINTS.USER_PROFILE_BY_FULL_NAME(keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
      );
    });

    it('should return empty array for empty keyword', async () => {
      const expectedActions = [
        { type: types.FIND_USERS_START },
        { type: types.FOUND_USERS, users: [] }
      ];

      await store.dispatch(actions.findUserProfiles(''));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('fetchAllMembers', () => {
    const projectId = 'project123';
    const mockMembers = [
      { _id: '1', firstName: 'John', lastName: 'Doe' }
    ];

    it('should fetch all project members when successful', async () => {
      axios.get.mockResolvedValueOnce({ data: mockMembers });

      const expectedActions = [
        { type: types.FETCH_MEMBERS_START },
        { type: types.FOUND_USERS, users: [] },
        { type: types.RECEIVE_MEMBERS, members: mockMembers }
      ];

      await store.dispatch(actions.fetchAllMembers(projectId));
      expect(store.getActions()).toEqual(expectedActions);
      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.PROJECT_MEMBER(projectId));
    });

    it('should handle errors when fetching members', async () => {
      const error = new Error('Network error');
      axios.get.mockRejectedValueOnce(error);

      const expectedActions = [
        { type: types.FETCH_MEMBERS_START },
        { type: types.FOUND_USERS, users: [] },
        { type: types.FETCH_MEMBERS_ERROR, err: error }
      ];

      await store.dispatch(actions.fetchAllMembers(projectId));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('assignProject', () => {
    const projectId = 'project123';
    const userId = 'user123';
    const firstName = 'John';
    const lastName = 'Doe';

    it('should handle project assignment successfully', async () => {
      axios.post.mockResolvedValueOnce({ data: {} });

      const expectedActions = [
        { 
          type: types.ADD_NEW_MEMBER, 
          member: { _id: userId, firstName, lastName } 
        },
        { type: types.REMOVE_FOUND_USER, userId }
      ];

      await store.dispatch(actions.assignProject(projectId, userId, 'Assign', firstName, lastName));
      expect(store.getActions()).toEqual(expectedActions);
      expect(axios.post).toHaveBeenCalledWith(
        ENDPOINTS.PROJECT_MEMBER(projectId),
        {
          projectId,
          users: [{ userId, operation: 'Assign' }]
        }
      );
    });

    it('should handle project unassignment successfully', async () => {
      axios.post.mockResolvedValueOnce({ data: {} });

      const expectedActions = [
        { type: types.DELETE_MEMBER, userId }
      ];

      await store.dispatch(actions.assignProject(projectId, userId, 'Unassign', firstName, lastName));
      expect(store.getActions()).toEqual(expectedActions);
    });

   
  });

  describe('Plain object actions', () => {
    it('should create an action to start member fetching', () => {
      const expectedAction = {
        type: types.FETCH_MEMBERS_START
      };
      expect(actions.setMemberStart()).toEqual(expectedAction);
    });

    it('should create an action to set members', () => {
      const members = [{ _id: '1', name: 'John' }];
      const expectedAction = {
        type: types.RECEIVE_MEMBERS,
        members
      };
      expect(actions.setMembers(members)).toEqual(expectedAction);
    });

    it('should create an action to set members error', () => {
      const err = new Error('Test error');
      const expectedAction = {
        type: types.FETCH_MEMBERS_ERROR,
        err
      };
      expect(actions.setMembersError(err)).toEqual(expectedAction);
    });
  });
});