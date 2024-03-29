import { getTaskEditSuggestionsData } from '../selectors'; 

describe('getTaskEditSuggestionsData', () => {
  it('should return the expected data from state', () => {
    // Mock the state object to use in the function
    const state = {
      auth: {
        user: {
          role: 'admin', // Set user role to 'admin'
        },
      },
      taskEditSuggestions: {
        isLoading: false,
        taskEditSuggestions: [{ id: 1, suggestion: 'Edit suggestion 1' }],
        userSortDirection: 'asc',
        dateSuggestedSortDirection: 'desc',
      },
    };

    // Define the expected result
    const expectedResult = {
      userRole: 'admin',
      isLoading: false,
      taskEditSuggestions: [{ id: 1, suggestion: 'Edit suggestion 1' }],
      userSortDirection: 'asc',
      dateSuggestedSortDirection: 'desc',
    };

    // Call the function with the mock state
    const result = getTaskEditSuggestionsData(state);

    // Expect the result to match the expected result
    expect(result).toEqual(expectedResult);
  });
});