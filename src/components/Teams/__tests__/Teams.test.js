import React from 'react';
import { Provider } from 'react-redux';
import { render, fireEvent, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Teams from 'components/Teams/Team';
import { allTeamsMock, userProfileMock, rolesMock } from '../../../__tests__/mockStates';

const mockStore = configureStore([thunk]);

let store;

beforeEach(() => {
  store = mockStore({
    allTeamsData: allTeamsMock,
    userProfile: userProfileMock,
    role: rolesMock,
  });
});

describe('Teams Component', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );
    expect(screen.getByTestId('teams-container')).toBeInTheDocument();
  });

  it('displays teams from the redux store', () => {
    render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );
    allTeamsMock.allTeams.forEach(team => {
      expect(screen.getByText(team.teamName)).toBeInTheDocument();
    });
  });

  it('dispatches getAllUserTeams action on mount', () => {
    render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );
  
    const actions = store.getActions();
    expect(actions.some(action => action.type === 'RECEIVE_ALL_USER_TEAMS')).toBeTruthy();
  });

  it('opens TeamMembersPopup when a team member is clicked', () => {
    render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );
  
    fireEvent.click(screen.getByTestId('team-member-button'));
    expect(screen.getByTestId('team-members-popup')).toBeInTheDocument();
  });

  it('filters teams based on search input', () => {
    render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );
  
    const searchInput = screen.getByPlaceholderText('Search Teams');
    fireEvent.change(searchInput, { target: { value: 'Dev' } });
    expect(screen.getByText('Dev jk team 1aab')).toBeInTheDocument();
  });

  it('sorts teams by modified date when component mounts', () => {
    render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );

    // Extract the team names from the table rows and check if they are sorted by modified date
    const teamRows = screen.getAllByRole('row');
    const teamNames = teamRows.slice(1).map(row => row.cells[1].textContent); // Skip the header row

    // Define the expected order based on the modified date
    const expectedOrder = allTeamsMock.allTeams
      .sort((a, b) => new Date(b.modifiedDatetime) - new Date(a.modifiedDatetime))
      .map(team => team.teamName);

    expect(teamNames).toEqual(expectedOrder);
  });

  it('sorts teams by name when sort option is selected', () => {
    render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );

    // Trigger the sorting by clicking the button with TEAM_NAME text
    fireEvent.click(screen.getByText(/TEAM_NAME/));

    // Extract the team names from the table rows
    const teamRows = screen.getAllByRole('row');
    const sortedTeamNames = teamRows.slice(1).map(row => row.cells[1].textContent); // Skip the header row, then extract team name from the second cell of each row

    // Define the expected sorted order based on the mock data
    const expectedSortedNames = allTeamsMock.allTeams
      .map(team => team.teamName)
      .sort();

    expect(sortedTeamNames).toEqual(expectedSortedNames);
  });

  it('sorts teams by activity when sort option is selected', () => {
    render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );

    // Trigger the sorting by clicking the button with ACTIVE text
    fireEvent.click(screen.getByText(/ACTIVE/));

    // Extract the active markers from the table rows
    const teamRows = screen.getAllByRole('row');
    const sortedActiveMarkers = teamRows.slice(1).map(row => {
      const activeMarker = row.querySelector('[data-testid="active-marker"]');
      return activeMarker ? 'isNotActive' : 'isNotActive';
    });

    // Define the expected sorted order based on the mock data
    const expectedSortedActivity = allTeamsMock.allTeams
      .map(team => team.isActive ? 'Active' : 'Inactive')
      .sort();

    expect(sortedActiveMarkers).toEqual(expectedSortedActivity);
  });

  it('adds a new team when form is submitted', () => {
    render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );
  
    fireEvent.click(screen.getByTestId('add-team-button'));
    // Fill out and submit the form
    // Add assertions to check if a new team was added
  });
  
  it('deletes a team when delete is confirmed', () => {
    render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );
  
    fireEvent.click(screen.getByTestId('delete-team-button'));
    // Confirm deletion
    // Add assertions to check if the team was deleted
  });

  it('updates a team when edit is confirmed', () => {
    render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('edit-team-button'));
    // Fill out and submit the form for editing
    // Add assertions to check if the team was updated
  });

  it('matches the snapshot', () => {
    const { asFragment } = render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});