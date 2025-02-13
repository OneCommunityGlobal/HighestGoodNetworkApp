import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddTeamsAutoComplete from '../AddTeamsAutoComplete';
import { toast } from 'react-toastify';

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('AddTeamsAutoComplete Component', () => {
  const mockSetSearchText = jest.fn();
  const mockOnCreateNewTeam = jest.fn();
  const mockSetInputs = jest.fn();
  const teamsData = {
    allTeams: [
      { _id: '1', teamName: 'Engineering' },
      { _id: '2', teamName: 'Design' },
      { _id: '3', teamName: 'Marketing' },
    ],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <AddTeamsAutoComplete
        searchText=""
        setSearchText={mockSetSearchText}
        setInputs={mockSetInputs}
        teamsData={teamsData}
        onCreateNewTeam={mockOnCreateNewTeam}
      />
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('dropdown does not show when searchText is empty', () => {
    render(
      <AddTeamsAutoComplete
        searchText=""
        setSearchText={mockSetSearchText}
        teamsData={teamsData}
        onCreateNewTeam={mockOnCreateNewTeam}
      />
    );
    const dropdown = screen.queryByRole('menu');
    expect(dropdown).not.toBeInTheDocument();
  });

  test('dropdown shows when searchText is not empty', () => {
    render(
      <AddTeamsAutoComplete
        searchText="Eng"
        setSearchText={mockSetSearchText}
        teamsData={teamsData}
        onCreateNewTeam={mockOnCreateNewTeam}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Eng' } });
    
    const dropdown = screen.getByRole('menu');
    expect(dropdown).toBeInTheDocument();
  });

  test('input is auto-focused when component mounts', () => {
    render(
      <AddTeamsAutoComplete
        searchText=""
        setSearchText={mockSetSearchText}
        teamsData={teamsData}
        onCreateNewTeam={mockOnCreateNewTeam}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
  });


  test('filters team list case insensitively', () => {
    render(
      <AddTeamsAutoComplete
        searchText="engineering"
        setSearchText={mockSetSearchText}
        teamsData={teamsData}
        onCreateNewTeam={mockOnCreateNewTeam}
      />
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
      <AddTeamsAutoComplete
        searchText="Eng&"
        setSearchText={mockSetSearchText}
        teamsData={teamsDataWithSpecialCharacters}
        onCreateNewTeam={mockOnCreateNewTeam}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Eng&' } });

    expect(screen.getByText('Eng&Dev')).toBeInTheDocument();
  });

  test('handles case when no teams are available', () => {
    render(
      <AddTeamsAutoComplete
        searchText="Test"
        setSearchText={mockSetSearchText}
        teamsData={{ allTeams: [] }}
        onCreateNewTeam={mockOnCreateNewTeam}
      />
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test' } });

    expect(screen.queryByRole('menu')).toBeInTheDocument();
    expect(screen.queryByText('No teams found')).not.toBeInTheDocument(); // Because toast error would handle this case
  });



  //////////////////

  test('renders input field', () => {
    render(
      <AddTeamsAutoComplete
        searchText=""
        setSearchText={mockSetSearchText}
        teamsData={teamsData}
        onCreateNewTeam={mockOnCreateNewTeam}
      />
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });



  test('selects a team from the dropdown', () => {
    render(
      <AddTeamsAutoComplete
        searchText="Eng"
        setSearchText={mockSetSearchText}
        setInputs={mockSetInputs}
        teamsData={teamsData}
        onCreateNewTeam={mockOnCreateNewTeam}
      />
    );

    fireEvent.click(screen.getByText('Engineering'));
    expect(mockSetSearchText).toHaveBeenCalledWith('Engineering');

    expect(mockSetInputs).toHaveBeenCalledWith(expect.any(Function));
    const updateFn = mockSetInputs.mock.calls[0][0];
    const initialInputs = { testKey: 'testValue' };
    const updatedInputs = updateFn(initialInputs);
    expect(updatedInputs).toEqual({
      testKey: 'testValue',
      teamId: '1',
    });
  });

  test('creates a new team when no match is found', () => {
    render(
      <AddTeamsAutoComplete
        searchText="HR"
        setSearchText={mockSetSearchText}
        teamsData={teamsData}
        onCreateNewTeam={mockOnCreateNewTeam}
      />
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'HR' } });
    fireEvent.click(screen.getByText('Create new team: HR'));

    expect(mockOnCreateNewTeam).toHaveBeenCalledWith('HR');
  });


});
