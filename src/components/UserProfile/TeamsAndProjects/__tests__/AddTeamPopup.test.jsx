import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddTeamPopup from '../AddTeamPopup';
import thunk from 'redux-thunk';
import { configureStore } from 'redux-mock-store';
import { Provider } from 'react-redux';
import { postNewTeam, getAllUserTeams } from '~/actions/allTeamsAction';
import { ADD_NEW_TEAM, RECEIVE_ALL_USER_TEAMS } from '~/constants/allTeamsConstants';
import axios from 'axios';
import { vi } from 'vitest';

const userTeams = [
  {
    teamName: 'team11',
    _id: 'aaa123',
  },
];

const mockStore = configureStore([thunk]);

const baseState = {
  allTeams: [
    {
      teamName: 'team11',
      _id: 'aaa123',
      isActive: true,
    },
    {
      teamName: 'team12',
      _id: 'bbb456',
      isActive: true,
    },
    {
      teamName: 'team13',
      _id: 'ccc789',
      isActive: true,
    },
    {
      teamName: 'team24',
      _id: 'ddd056',
      isActive: false,
    },
  ],
  fetched: true,
  fetching: false,
  status: '200',
  theme: { darkMode: false },
};

const store = mockStore(baseState);

const defaultTeamsData = {
  allTeams: baseState.allTeams,
};

const emptyTeamsData = {
  allTeams: [],
};

const onAddTeamPopupClose = vi.fn();
const onSelectAssignTeam = vi.fn();
const handleSubmit = vi.fn();

vi.mock('react-toastify');
vi.mock('axios');

const renderComponent = (mockOpen, mockTeamsData, mockUserTeams) =>
  render(
    <Provider store={store}>
      <AddTeamPopup
        open={mockOpen}
        onClose={onAddTeamPopupClose}
        teamsData={mockTeamsData}
        userTeamsById={mockUserTeams}
        onSelectAssignTeam={onSelectAssignTeam}
        handleSubmit={handleSubmit}
      />
    </Provider>,
  );

const renderOpenPopup = (teamsData = defaultTeamsData, mockUserTeams = userTeams) =>
  renderComponent(true, teamsData, mockUserTeams);

const renderClosedPopup = (teamsData = emptyTeamsData, mockUserTeams = userTeams) =>
  renderComponent(false, teamsData, mockUserTeams);

const getSearchInput = () => screen.getByPlaceholderText('Search or select a team...');
const getConfirmButton = () => screen.getByRole('button', { name: 'Confirm' });
const getCloseButton = () => screen.getByText('Close');

describe('AddTeamPopup component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    axios.get.mockResolvedValue({
      status: 200,
    });

    axios.post.mockResolvedValue({
      status: 200,
    });
  });

  it('renders modal elements when addTeamPopupOpen is true', () => {
    renderOpenPopup(emptyTeamsData);
    expect(screen.getByText('Add Team')).toBeInTheDocument();
  });

  it('does not render modal elements when addTeamPopupOpen is false', () => {
    renderClosedPopup(emptyTeamsData);
    expect(screen.queryByText('Add Team')).not.toBeInTheDocument();
  });

  it.skip('check if confirm button works', async () => {
    renderOpenPopup(defaultTeamsData);

    const searchElement = getSearchInput();
    fireEvent.change(searchElement, { target: { value: 'team1' } });

    const team12Element = await screen.findByText('team12');
    fireEvent.click(team12Element);
    fireEvent.click(getConfirmButton());

    expect(onSelectAssignTeam).toHaveBeenCalled();
  });

  it('check if close button works', () => {
    renderOpenPopup(emptyTeamsData);
    fireEvent.click(getCloseButton());
    expect(onAddTeamPopupClose).toHaveBeenCalled();
  });

  it('check team name does not exist message', () => {
    renderOpenPopup(defaultTeamsData);

    expect(screen.getByText('Add to Team')).toBeInTheDocument();

    fireEvent.change(getSearchInput(), { target: { value: 'team111' } });
    fireEvent.click(getConfirmButton());

    expect(
      screen.getByText('Oops, this team does not exist! Create it if you want it.'),
    ).toBeInTheDocument();
  });

  it.skip('check searched value results', async () => {
    axios.get.mockResolvedValue({
      data: baseState.allTeams,
    });

    renderOpenPopup(defaultTeamsData);

    expect(screen.getByText('Add to Team')).toBeInTheDocument();

    fireEvent.change(getSearchInput(), { target: { value: 'team1' } });

    await screen.findByText('team11');
    expect(screen.getByText('team11')).toBeInTheDocument();
    expect(screen.getByText('team12')).toBeInTheDocument();
    expect(screen.getByText('team13')).toBeInTheDocument();
    expect(screen.queryByText('team24')).not.toBeInTheDocument();
  });

  it('check results without team name', () => {
    renderOpenPopup(defaultTeamsData);

    expect(screen.getByText('Add to Team')).toBeInTheDocument();

    fireEvent.change(getSearchInput(), { target: { value: '' } });
    fireEvent.click(getConfirmButton());

    expect(screen.getByText(/hey, you need to pick a team first!/i)).toBeInTheDocument();
  });

  it('check if postNewTeam action works as expected', async () => {
    const responseData = { teamName: 'New Team', isActive: true };

    axios.post.mockResolvedValue({
      data: responseData,
    });

    const actionStore = mockStore({});
    const expectedActions = [{ type: ADD_NEW_TEAM, payload: responseData, status: true }];

    await actionStore.dispatch(postNewTeam('New Team', true));
    expect(actionStore.getActions()).toEqual(expectedActions);
  });

  it('check if getAllUserTeams action works as expected', async () => {
    const responseData = { teamName: 'New Team', _id: 'aaa333', isActive: true };

    axios.get.mockResolvedValue({
      data: responseData,
    });

    const actionStore = mockStore({});
    const expectedActions = [{ type: RECEIVE_ALL_USER_TEAMS, payload: responseData }];

    await actionStore.dispatch(getAllUserTeams());
    expect(actionStore.getActions()).toEqual(expectedActions);
  });

  it('check if postNewTeams puts out an error message when the axios post request fails', async () => {
    const actionStore = mockStore({});

    const errorResponse = { response: { status: 404, data: { message: 'Not Found' } } };
    axios.post.mockRejectedValue(errorResponse);

    const errorResponseMessage = await actionStore.dispatch(postNewTeam('New Team', true));
    expect(errorResponseMessage.status).toBe(404);
    expect(errorResponseMessage.data.message).toBe('Not Found');

    const errorRequest = { request: {} };
    axios.post.mockRejectedValue(errorRequest);

    const errorRequestMessage = await actionStore.dispatch(postNewTeam('New Team', true));
    expect(errorRequestMessage.status).toBe(500);
    expect(errorRequestMessage.message).toBe('No response received from the server');

    const error = { message: 'Internal Server Error' };
    axios.post.mockRejectedValue(error);

    const errorMessage = await actionStore.dispatch(postNewTeam('New Team', true));
    expect(errorMessage.message).toBe('Internal Server Error');
  });

  it('check if getAllUserTeams puts out an error message when axios get request fails', async () => {
    axios.get.mockRejectedValue();

    const actionStore = mockStore({});
    const expectedActions = [{ type: RECEIVE_ALL_USER_TEAMS, payload: undefined }];

    await actionStore.dispatch(getAllUserTeams());
    expect(actionStore.getActions()).toEqual(expectedActions);
  });
});