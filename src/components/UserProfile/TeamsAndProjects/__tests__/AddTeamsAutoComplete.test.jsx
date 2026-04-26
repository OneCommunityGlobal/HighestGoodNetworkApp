import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import AddTeamsAutoComplete from '../AddTeamsAutoComplete';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('AddTeamsAutoComplete Component', () => {
  const mockOnCreateNewTeam = vi.fn();
  const mockOnDropDownSelect = vi.fn();
  const mockSetInputs = vi.fn();

  const teamsData = {
    allTeams: [
      { _id: '1', teamName: 'Engineering' },
      { _id: '2', teamName: 'Design' },
      { _id: '3', teamName: 'Marketing' },
    ],
  };

  const mockStore = configureStore([]);
  const initialState = {
    theme: { darkMode: false },
  };
  const store = mockStore(initialState);

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('creates a new team when no match is found', async () => {
    let searchText = '';
    const setSearchText = (value) => {
      searchText = value;
      rerender(
        <Provider store={store}>
          <AddTeamsAutoComplete
            searchText={searchText}
            setSearchText={setSearchText}
            setInputs={mockSetInputs}
            teamsData={teamsData}
            onCreateNewTeam={mockOnCreateNewTeam}
            onDropDownSelect={mockOnDropDownSelect}
          />
        </Provider>
      );
    };

    const { rerender } = render(
      <Provider store={store}>
        <AddTeamsAutoComplete
          searchText={searchText}
          setSearchText={setSearchText}
          setInputs={mockSetInputs}
          teamsData={teamsData}
          onCreateNewTeam={mockOnCreateNewTeam}
          onDropDownSelect={mockOnDropDownSelect}
        />
      </Provider>
    );

    const input = screen.getByRole('textbox');

    // Type HR
    await userEvent.type(input, 'HR');

    // Wait for "Create new team: HR" to appear
    const createNewOption = await screen.findByText('Create new team: HR');

    // Click it using userEvent
    await userEvent.click(createNewOption);

    expect(mockOnCreateNewTeam).toHaveBeenCalledTimes(1);
    expect(mockOnCreateNewTeam).toHaveBeenCalledWith('HR');
  });
});
