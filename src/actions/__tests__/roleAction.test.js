import axios from 'axios';
import * as actions from '../role';
import * as types from '../../constants/role';
import { ENDPOINTS } from '../../utils/URL';

jest.mock('axios');

describe('Role Actions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAllRoles', () => {
    it('should create an action to receive roles', () => {
      const roles = [{ id: 1, name: 'Admin' }];
      const expectedAction = {
        type: types.RECEIVE_ROLES,
        roles,
      };

      expect(actions.fetchAllRoles(roles)).toEqual(expectedAction);
    });
  });

  describe('postNewRole', () => {
    it('should create an action to add a new role', () => {
      const payload = { id: 2, name: 'User' };
      const expectedAction = {
        type: types.ADD_NEW_ROLE,
        payload,
      };

      expect(actions.postNewRole(payload)).toEqual(expectedAction);
    });
  });

  describe('modifyRole', () => {
    it('should create an action to update a role', () => {
      const payload = { id: 3, name: 'Editor' };
      const expectedAction = {
        type: types.UPDATE_ROLE,
        payload,
      };

      expect(actions.modifyRole(payload)).toEqual(expectedAction);
    });
  });

  describe('getAllRoles', () => {
    it('should dispatch RECEIVE_ROLES with fetched data', async () => {
      const dispatch = jest.fn();
      const mockData = [{ id: 1, name: 'Admin' }];
      axios.get.mockResolvedValueOnce({ data: mockData });

      await actions.getAllRoles()(dispatch);

      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.ROLES());
      expect(dispatch).toHaveBeenCalledWith(actions.fetchAllRoles(mockData));
    });
  });

  describe('addNewRole', () => {
    it('should post a new role and return response', async () => {
      const newRole = { name: 'User' };
      const mockResponse = { data: { id: 2, name: 'User' } };
      axios.post.mockResolvedValueOnce(mockResponse);

      const response = await actions.addNewRole(newRole);

      expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.ROLES(), newRole);
      expect(response).toEqual(mockResponse);
    });

    it('should return error response on failure', async () => {
      const newRole = { name: 'User' };
      const mockError = { response: { status: 400, message: 'Bad Request' } };
      axios.post.mockRejectedValueOnce(mockError);

      const response = await actions.addNewRole(newRole);

      expect(response).toEqual(mockError.response);
    });
  });
});
