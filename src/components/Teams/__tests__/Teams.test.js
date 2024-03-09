import React from 'react';
import { Provider } from 'react-redux';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Teams from 'components/Teams/Team';
import { allTeamsMock, userProfileMock, rolesMock, allUserProfilesMock } from '../../../__tests__/mockStates';

const mockStore = configureStore([thunk]);

describe('Teams Component', () => {
  let store;

  beforeEach(() => {
      store = mockStore({
          allTeamsData: {
              allTeams: allTeamsMock,
              fetching: false, 
          },
          userProfile: userProfileMock,
          role: rolesMock,
          allUserProfiles: allUserProfilesMock,
          auth: {
              user: {
                  role: 'Administrator',
                  permissions: { frontPermissions: [] },
              },
          },
      });
  });

  it('renders without crashing', async () => {
      render(
          <Provider store={store}>
              <Teams />
          </Provider>
      );
      const teamsContainer = await screen.findByTestId('teams-container');
      expect(teamsContainer).toBeInTheDocument();
  });

  it('displays teams from the redux store', async () => {
    render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );
    await waitFor(() => {
      allTeamsMock.allTeams.forEach(team => {
        expect(screen.getByText(team.teamName)).toBeInTheDocument();
      });
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

  it('opens TeamMembersPopup when a team member is clicked', async () => {
    render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );
  
    fireEvent.click(screen.getByTestId('team-member-button'));
    await waitFor(() => expect(screen.getByTestId('team-members-popup')).toBeInTheDocument());
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

  it('adds a new team when form is submitted', async () => {
    render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );
  
    fireEvent.click(screen.getByTestId('add-team-button'));

    // Simulate filling out the form
    fireEvent.change(screen.getByTestId('team-name-input'), { target: { value: 'New Team Name' } });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('form-submit-button'));

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions.some(action => action.type === 'ADD_NEW_TEAM' && action.payload.teamName === 'New Team Name')).toBeTruthy();
    });
  });
  
  it('deletes a team when delete is confirmed', async () => {
    render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );
    
    fireEvent.click(screen.getAllByTestId('delete-team-button')[0]); // Click the first delete button found
    
    // Confirm deletion by clicking on the confirmation in the dialog
    fireEvent.click(screen.getByTestId('confirm-delete'));

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions.some(action => action.type === 'TEAMS_DELETE')).toBeTruthy();
    });
  });

  it('updates a team when edit is confirmed', async () => {
    render(
      <Provider store={store}>
        <Teams />
      </Provider>
    );

    // Wait for the edit button to be in the document
    const editButtons = await screen.findAllByTestId('edit-team-button');
    fireEvent.click(editButtons[0]); // Click the first edit button found

    fireEvent.change(screen.getByTestId('team-name-input'), { target: { value: 'Updated Team Name' } });

    // Submit the form
    fireEvent.click(screen.getByTestId('form-submit-button'));

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions.some(action => action.type === 'UPDATE_TEAM' && action.payload.teamName === 'Updated Team Name')).toBeTruthy();
    });
  });
});