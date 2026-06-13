import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
  const mockSetSearchText = vi.fn();
  const mockOnCreateNewTeam = vi.fn();
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

  test('renders without crashing', () => {
    render(
      <Provider store={store}>
        <AddTeamsAutoComplete
          searchText=""
          setSearchText={mockSetSearchText}
          setInputs={mockSetInputs}
          teamsData={teamsData}
          onCreateNewTeam={mockOnCreateNewTeam}
        />
      </Provider>,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  // UPDATED: Component shows dropdown on focus even when searchText is empty.
  test('dropdown shows when searchText is empty (on focus)', () => {
    render(
      <Provider store={store}>
        <AddTeamsAutoComplete
          searchText=""
          setSearchText={mockSetSearchText}
          setInputs={mockSetInputs}
          teamsData={teamsData}
          onCreateNewTeam={mockOnCreateNewTeam}
        />
      </Provider>,
    );
    const input = screen.getByRole('textbox');
    // ensure menu is opened in case the component opens on focus
    input.focus();
    const dropdown = screen.getByRole('menu');
    expect(dropdown).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });

  test('dropdown shows when searchText is not empty', () => {
    render(
      <Provider store={store}>
        <AddTeamsAutoComplete
          searchText="Eng"
          setSearchText={mockSetSearchText}
          setInputs={mockSetInputs}
          teamsData={teamsData}
          onCreateNewTeam={mockOnCreateNewTeam}
        />
      </Provider>,
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Eng' } });

    const dropdown = screen.getByRole('menu');
    expect(dropdown).toBeInTheDocument();
  });

  test('input is auto-focused when component mounts', () => {
    render(
      <Provider store={store}>
        <AddTeamsAutoComplete
          searchText=""
          setSearchText={mockSetSearchText}
          setInputs={mockSetInputs}
          teamsData={teamsData}
          onCreateNewTeam={mockOnCreateNewTeam}
        />
      </Provider>,
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
  });

  test('filters team list case insensitively', () => {
    render(
      <Provider store={store}>
        <AddTeamsAutoComplete
          searchText="engineering"
          setSearchText={mockSetSearchText}
          setInputs={mockSetInputs}
          teamsData={teamsData}
          onCreateNewTeam={mockOnCreateNewTeam}
        />
      </Provider>,
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'engineering' } });

    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  test('correctly handles special characters in search', () => {
    const teamsDataWithSpecialCharacters = {
      allTeams: [
        { _id: '1', teamName: 'Eng&Dev' },
        { _id: '2', teamName: 'Design!' },
        { _id: '3', teamName: 'Marketing?' },
      ],
    };

    render(
      <Provider store={store}>
        <AddTeamsAutoComplete
          searchText="Eng&"
          setSearchText={mockSetSearchText}
          setInputs={mockSetInputs}
          teamsData={teamsDataWithSpecialCharacters}
          onCreateNewTeam={mockOnCreateNewTeam}
        />
      </Provider>,
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Eng&' } });

    expect(screen.getByText('Eng&Dev')).toBeInTheDocument();
  });

  // UPDATED: Component renders inline "No teams found" when none match.
  test('handles case when no teams are available', () => {
    render(
      <Provider store={store}>
        <AddTeamsAutoComplete
          searchText="Test"
          setSearchText={mockSetSearchText}
          setInputs={mockSetInputs}
          teamsData={{ allTeams: [] }}
          onCreateNewTeam={mockOnCreateNewTeam}
        />
      </Provider>,
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test' } });

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('No teams found')).toBeInTheDocument();
  });

  //////////////////

  test('renders input field', () => {
    render(
      <Provider store={store}>
        <AddTeamsAutoComplete
          searchText=""
          setSearchText={mockSetSearchText}
          setInputs={mockSetInputs}
          teamsData={teamsData}
          onCreateNewTeam={mockOnCreateNewTeam}
        />
      </Provider>,
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  // UPDATED: Component calls setInputs with the TEAM OBJECT, not an updater fn
  test('selects a team from the dropdown', () => {
    render(
      <Provider store={store}>
        <AddTeamsAutoComplete
          searchText="Eng"
          setSearchText={mockSetSearchText}
          setInputs={mockSetInputs}
          teamsData={teamsData}
          onCreateNewTeam={mockOnCreateNewTeam}
        />
      </Provider>,
    );

    fireEvent.click(screen.getByText('Engineering'));
    expect(mockSetSearchText).toHaveBeenCalledWith('Engineering');

    expect(mockSetInputs).toHaveBeenCalledWith({
      _id: '1',
      teamName: 'Engineering',
    });
  });

  test('creates a new team when no match is found', () => {
    render(
      <Provider store={store}>
        <AddTeamsAutoComplete
          searchText="HR"
          setSearchText={mockSetSearchText}
          setInputs={mockSetInputs}
          teamsData={teamsData}
          onCreateNewTeam={mockOnCreateNewTeam}
        />
      </Provider>,
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'HR' } });
    fireEvent.click(screen.getByText('Create new team: HR'));

    expect(mockOnCreateNewTeam).toHaveBeenCalledWith('HR');
  });
});
