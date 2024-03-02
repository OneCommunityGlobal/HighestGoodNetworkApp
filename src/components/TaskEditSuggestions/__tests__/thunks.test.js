import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as service from '../service';
import * as actions from '../actions';
import { fetchTaskEditSuggestions, rejectTaskEditSuggestion } from '../thunks';
import { fetchTaskEditSuggestionCount } from '../thunks';

// Mock store setup
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const initialState = {
  auth: {
    user: {
      userid: 'mockUserId' 
    }
  },
  tasks: {
    taskItems: [{
      _id: 'task1',
       name: 'Task 1'
    }
    ]
  },
  
};

describe('Task Edit Suggestions Thunks', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  describe('fetchTaskEditSuggestions', () => {
    it('dispatches success action on successful HTTP request', async () => {
      // Example mock data for successful HTTP response
      const mockResponse = {
        data: [
          { id: 'suggestion1', description: 'Suggestion One', status: 'pending' },
          { id: 'suggestion2', description: 'Suggestion Two', status: 'review' },
        ]
      };
      jest.spyOn(service, 'getTaskEditSuggestionsHTTP').mockResolvedValue(mockResponse);
  
      // Define expected actions
      const expectedActions = [
        actions.fetchTaskEditSuggestionsBegin(),
        actions.fetchTaskEditSuggestionsSuccess(mockResponse.data),
      ];
  
      // Dispatch the thunk
      await store.dispatch(fetchTaskEditSuggestions());

      // Assert that the expected actions were dispatched
      expect(store.getActions()).toEqual(expectedActions);
    });
  


    it('dispatches error action on failed HTTP request', async () => {
      // Mock the HTTP request to simulate an error
      jest.spyOn(service, 'getTaskEditSuggestionsHTTP').mockRejectedValue(new Error('Network error'));
  
      // Define expected actions
      const expectedActions = [
        actions.fetchTaskEditSuggestionsBegin(),
        actions.fetchTaskEditSuggestionsError(),
      ];
  
      // Dispatch the thunk
      await store.dispatch(fetchTaskEditSuggestions());
  
      // Assert that the expected actions were dispatched
      expect(store.getActions()).toEqual(expectedActions);
    });
  });



  describe('rejectTaskEditSuggestion', () => {
    it('dispatches success action on successful HTTP request', async () => {
      // Mock the HTTP request
      const taskEditSuggestionId = 'mockTaskEditSuggestionId';
      jest.spyOn(service, 'rejectTaskEditSuggestionHTTP').mockResolvedValue();

      // Define expected actions
      const expectedActions = [
        actions.rejectTaskEditSuggestionSuccess(taskEditSuggestionId),
      ];

      // Dispatch the thunk
      await store.dispatch(rejectTaskEditSuggestion(taskEditSuggestionId));

      // Assert that the expected actions were dispatched
      expect(store.getActions()).toEqual(expectedActions);
    });

    
  });

  describe('fetchTaskEditSuggestionCount', () => {
    it('dispatches success action with count on successful HTTP request', async () => {
      // Mock the HTTP request
      const mockResponse = { data: { count: 5 } };
      jest.spyOn(service, 'getTaskEditSuggestionCountHTTP').mockResolvedValue(mockResponse);

      // Define expected actions
      const expectedActions = [
        actions.fetchTaskEditSuggestionCountSuccess(mockResponse.data.count),
      ];

      // Dispatch the thunk
      await store.dispatch(fetchTaskEditSuggestionCount());

      // Assert that the expected actions were dispatched
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('fetchTaskEditSuggestions edge case with empty response', () => {
    it('dispatches success action with empty array when HTTP response is empty', async () => {
      // Mock an empty response
      const mockResponse = { data: [] };
      jest.spyOn(service, 'getTaskEditSuggestionsHTTP').mockResolvedValue(mockResponse);
  
      // Define expected actions for an empty response scenario
      const expectedActions = [
        actions.fetchTaskEditSuggestionsBegin(),
        actions.fetchTaskEditSuggestionsSuccess([]),
      ];
  
      // Dispatch the thunk
      await store.dispatch(fetchTaskEditSuggestions());
  
      // Assert that the expected actions for an empty response were dispatched
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
  


});
