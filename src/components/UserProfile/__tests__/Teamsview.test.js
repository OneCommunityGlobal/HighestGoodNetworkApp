import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import Teams from '../Teamsview';
import { themeMock } from '__tests__/mockStates';

const mockStore = configureMockStore();
const initialState = {
  theme: themeMock,
};
const store = mockStore(initialState);

const mockallTeams = [
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
];

const mockhandleTeam = jest.fn();

describe('Team Table Data component', () => {
  it('check team name displaying properly when the user is assigned to teams', () => {
    const teamsData = [
      {
        teamName: 'team11',
        _id: 'aaa123',
        isActive: true,
      },
    ];
    render(
      <Provider store={store}>
        <Teams
          teamsdata={teamsData}
          allTeams={mockallTeams}
          handleTeam={mockhandleTeam}
          edit={true}
        />
      </Provider>,
    );
    expect(screen.queryByText('team11')).toBeInTheDocument();
  });
  it('check if team name not getting displayed when user is not assigned to a team', () => {
    const teamsData = [];
    render(
      <Provider store={store}>
        <Teams
          teamsdata={teamsData}
          allTeams={mockallTeams}
          handleTeam={mockhandleTeam}
          edit={true}
        />
      </Provider>,
    );
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });
  it('check if mockhandleTeam called when delete button is clicked', () => {
    const teamsData = [
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
    ];
    const { container } = render(
      <Provider store={store}>
        <Teams
          teamsdata={teamsData}
          allTeams={mockallTeams}
          handleTeam={mockhandleTeam}
          edit={true}
        />
      </Provider>,
    );
    const deleteElement = container.querySelector('[data-item="aaa123"]');
    fireEvent.click(deleteElement);
    expect(mockhandleTeam).toHaveBeenCalled();
  });
  it('check if mockhandleTeam not called when delete button is not clicked', () => {
    const teamsData = [
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
    ];
    const { container } = render(
      <Provider store={store}>
        <Teams
          teamsdata={teamsData}
          allTeams={mockallTeams}
          handleTeam={mockhandleTeam}
          edit={true}
        />
      </Provider>,
    );
    expect(mockhandleTeam).not.toHaveBeenCalled();
  });
});
describe('Teams component', () => {
  it('renders without crashing', () => {
    const teamsData = [];
    render(
      <Provider store={store}>
        <Teams
          teamsdata={teamsData}
          allTeams={mockallTeams}
          handleTeam={mockhandleTeam}
          edit={true}
        />
      </Provider>,
    );
  });
  it('Teams header appears as expected', () => {
    const teamsData = [];
    render(
      <Provider store={store}>
        <Teams
          teamsdata={teamsData}
          allTeams={mockallTeams}
          handleTeam={mockhandleTeam}
          edit={true}
        />
      </Provider>,
    );
    expect(screen.queryByText('Teams')).toBeInTheDocument();
  });
  it('check modal opens when add a team button is clicked', () => {
    const teamsData = [];
    render(
      <Provider store={store}>
        <Teams
          teamsdata={teamsData}
          allTeams={mockallTeams}
          handleTeam={mockhandleTeam}
          edit={true}
        />
      </Provider>,
    );
    const buttonElement = screen.getByText('Add a Team');
    fireEvent.click(buttonElement);
    expect(screen.queryByText('Modal title')).toBeInTheDocument();
  });
  it('check if modal does not open when add a team button is not clicked', () => {
    const teamsData = [];
    render(
      <Provider store={store}>
        <Teams
          teamsdata={teamsData}
          allTeams={mockallTeams}
          handleTeam={mockhandleTeam}
          edit={true}
        />
      </Provider>,
    );
    expect(screen.queryByText('Modal title')).not.toBeInTheDocument();
  });
});
