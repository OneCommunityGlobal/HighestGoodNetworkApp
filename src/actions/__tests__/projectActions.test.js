import { GET_PROJECT_BY_ID } from '../../constants/project';
import axios from 'axios';
import { getProjectDetail } from '../project';
import { setProjectDetail } from '../project';
import {ENDPOINTS} from '../../utils/URL';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

jest.mock('axios');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Project Actions', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  describe('setProjectDetail', () => {
    it('should create an action to set project detail', () => {
      const projectData = {
        id: '123',
        name: 'Test Project',
        description: 'Test Description'
      };

      const expectedAction = {
        type: GET_PROJECT_BY_ID,
        payload: projectData
      };

      expect(setProjectDetail(projectData)).toEqual(expectedAction);
    });
  });

  describe('getProjectDetail', () => {
    const projectId = '123';
    const projectData = {
      id: projectId,
      name: 'Test Project',
      description: 'Test Description'
    };

    it('should fetch project and dispatch setProjectDetail on successful API call', async () => {
      // Mock successful API response
      axios.get.mockResolvedValueOnce({ data: projectData });

      // Expected actions that should be dispatched
      const expectedActions = [{
        type: GET_PROJECT_BY_ID,
        payload: projectData
      }];

      // Execute the action
      await store.dispatch(getProjectDetail(projectId));

      // Verify API was called with correct URL
      expect(axios.get).toHaveBeenCalledWith(
        ENDPOINTS.PROJECT_BY_ID(projectId)
      );

      // Verify correct actions were dispatched
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should not dispatch any action when API returns 401', async () => {
      // Mock API error response
      const error = new Error('Unauthorized');
      error.status = 401;
      axios.get.mockRejectedValueOnce(error);

      // Execute the action
      await store.dispatch(getProjectDetail(projectId));

      // Verify API was called
      expect(axios.get).toHaveBeenCalledWith(
        ENDPOINTS.PROJECT_BY_ID(projectId)
      );

      // Verify no actions were dispatched
      expect(store.getActions()).toEqual([]);
    });

   
  });
});