import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddTeamPopup from '../AddTeamPopup';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { postNewTeam, getAllUserTeams } from 'actions/allTeamsAction';
import { ADD_NEW_TEAM, RECEIVE_ALL_USER_TEAMS } from 'constants/allTeamsConstants';
import { toast } from 'react-toastify';
import axios from 'axios';

const userTeams = [
  {
    teamName: 'team11',
    _id: 'aaa123',
  },
];

const mockStore = configureStore([thunk]);

const store = mockStore({
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
});

const onAddTeamPopupClose = jest.fn();
const onSelectAssignTeam = jest.fn();
const handleSubmit = jest.fn();
jest.mock('react-toastify');
jest.mock('axios');
const renderComponent = (mockOpen, mockTeamsData, mockUserTeams) => {
  return render(
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
};

describe('AddTeamPopup component', () => {
  it('renders modal elements when addTeamPopupOpen is true', () => {
    axios.get.mockResolvedValue({
      status: 200,
    });

    axios.post.mockResolvedValue({
      status: 200,
    });
    const teamsData = {
      allTeams: [],
    };
    renderComponent(true, teamsData, userTeams);
    expect(screen.queryByText('Add Team')).toBeInTheDocument();
  });

  it('does not render modal elements when addTeamPopupOpen is true', () => {
    axios.get.mockResolvedValue({
      status: 200,
    });

    axios.post.mockResolvedValue({
      status: 200,
    });
    const teamsData = {
      allTeams: [],
    };
    renderComponent(false, teamsData, userTeams);
    expect(screen.queryByText('Add Team')).not.toBeInTheDocument();
  });
  it('check if confirm button works', async () => {
    axios.get.mockResolvedValue({
      status: 200,
    });

    axios.post.mockResolvedValue({
      status: 200,
    });
    const teamsData = {
      allTeams: store.getState().allTeams,
    };
    toast.success = jest.fn();
    renderComponent(true, teamsData, userTeams);
    const modalFadeElement = screen.getByRole('document');
    const modalContentElement = modalFadeElement.querySelector('.modal-content');
    const modalBodyElement = modalContentElement.querySelector('.modal-body');
    const searchElement = modalBodyElement.querySelector('.form-control');

    fireEvent.change(searchElement, { target: { value: 'team1' } });
    await waitFor(() => {});
    const team12Element = screen.getByText('team12');
    fireEvent.click(team12Element);
    const confirmElement = screen.getByText('Confirm');
    fireEvent.click(confirmElement);
    expect(onSelectAssignTeam).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Team assigned successfully');
  });
  it('check if close button works', async () => {
    axios.get.mockResolvedValue({
      status: 200,
    });

    axios.post.mockResolvedValue({
      status: 200,
    });
    const teamsData = {
      allTeams: [],
    };
    renderComponent(true, teamsData, userTeams);
    const closeElement = screen.getByText('Close');
    fireEvent.click(closeElement);
    expect(onAddTeamPopupClose).toHaveBeenCalled();
  });
  it('check team name does not exist message', async () => {
    axios.get.mockResolvedValue({
      status: 200,
    });

    axios.post.mockResolvedValue({
      status: 200,
    });
    const teamsData = {
      allTeams: store.getState().allTeams,
    };
    renderComponent(true, teamsData, userTeams);
    expect(screen.queryByText('Add to Team')).toBeInTheDocument();
    const modalFadeElement = screen.getByRole('document');
    const modalContentElement = modalFadeElement.querySelector('.modal-content');
    const modalBodyElement = modalContentElement.querySelector('.modal-body');
    const searchElement = modalBodyElement.querySelector('.form-control');

    fireEvent.change(searchElement, { target: { value: 'team111' } });
    await waitFor(() => {});
    const nextDivElement = modalBodyElement.querySelector('.input-group-prepend');
    fireEvent.click(nextDivElement.querySelector('.btn.btn-primary'));
    expect(
      screen.getByText('Oops, this team does not exist! Create it if you want it.'),
    ).toBeInTheDocument();
  });
  it('check searched value results', async () => {
    axios.get.mockResolvedValue({
      status: 200,
    });

    axios.post.mockResolvedValue({
      status: 200,
    });
    const teamsData = {
      allTeams: store.getState().allTeams,
    };
    renderComponent(true, teamsData, userTeams);
    expect(screen.queryByText('Add to Team')).toBeInTheDocument();
    const modalFadeElement = screen.getByRole('document');
    const modalContentElement = modalFadeElement.querySelector('.modal-content');
    const modalBodyElement = modalContentElement.querySelector('.modal-body');
    const searchElement = modalBodyElement.querySelector('.form-control');

    fireEvent.change(searchElement, { target: { value: 'team1' } });
    await waitFor(() => {});
    expect(screen.getByText('team11')).toBeInTheDocument();
    expect(screen.getByText('team12')).toBeInTheDocument();
    expect(screen.getByText('team13')).toBeInTheDocument();
    expect(screen.queryByText('team24')).not.toBeInTheDocument();
  });
  it('check results without team name', async () => {
    axios.get.mockResolvedValue({
      status: 200,
    });

    axios.post.mockResolvedValue({
      status: 200,
    });
    const teamsData = {
      allTeams: store.getState().allTeams,
    };
    renderComponent(true, teamsData, userTeams);
    expect(screen.queryByText('Add to Team')).toBeInTheDocument();
    const modalFadeElement = screen.getByRole('document');
    const modalContentElement = modalFadeElement.querySelector('.modal-content');
    const modalBodyElement = modalContentElement.querySelector('.modal-body');
    const searchElement = modalBodyElement.querySelector('.form-control');

    fireEvent.change(searchElement, { target: { value: '' } });
    await waitFor(() => {});
    const nextDivElement = modalBodyElement.querySelector('.input-group-prepend');
    fireEvent.click(nextDivElement.querySelector('.btn.btn-primary'));
    expect(screen.queryByText('Hey, You need to pick a team first!')).toBeInTheDocument();
  });
  it('check if postNewTeam action works as expected', async () => {
    const responseData = { teamName: 'New Team', isActive: true };

    axios.post.mockResolvedValue({
      data: responseData,
    });
    const store = mockStore({});

    const expectedActions = [{ type: ADD_NEW_TEAM, payload: responseData, status: true }];
    await store.dispatch(postNewTeam('New Team', true));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('check if getAllUserTeams action works as expected', async () => {
    const responseData = { teamName: 'New Team', _id: 'aaa333', isActive: true };
    axios.get.mockResolvedValue({
      data: responseData,
    });
    const store = mockStore({});

    const expectedActions = [{ type: RECEIVE_ALL_USER_TEAMS, payload: responseData }];
    await store.dispatch(getAllUserTeams());
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('check if postNewTeams puts out an error message when the axios post request fails', async () => {
    const errorResponse = { response: { status: 404, data: { message: 'Not Found' } } };

    axios.post.mockRejectedValue(errorResponse);
    const store = mockStore({});

    // when the resource is not present
    const errorResponseMessage = await store.dispatch(postNewTeam('New Team', true));
    expect(errorResponseMessage.status).toBe(404);
    expect(errorResponseMessage.data.message).toBe('Not Found');

    // when there is a server error
    const errorRequest = { request: {} };
    axios.post.mockRejectedValue(errorRequest);
    const errorRequestMessage = await store.dispatch(postNewTeam('New Team', true));
    expect(errorRequestMessage.status).toBe(500);
    expect(errorRequestMessage.message).toBe('No response received from the server');

    // when the error does not have request or response
    const error = { message: 'Internal Server Error' };
    axios.post.mockRejectedValue(error);
    const errorMessage = await store.dispatch(postNewTeam('New Team', true));
    expect(errorMessage.message).toBe('Internal Server Error');
  });
  it('check if getAllUserTeams puts out an error message when axios get request fails', async () => {
    axios.get.mockRejectedValue();
    const store = mockStore({});

    const expectedActions = [{ type: RECEIVE_ALL_USER_TEAMS, payload: undefined }];
    await store.dispatch(getAllUserTeams());

    // when there is error in the get request then the payload becomes undefined
    expect(store.getActions()).toEqual(expectedActions);
  });
});
