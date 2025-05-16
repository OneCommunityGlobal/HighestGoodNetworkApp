import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import AddNewTeamModal from '../AddNewTeamModal';
import { themeMock } from '__tests__/mockStates';

const mockStore = configureMockStore();
const initialState = {
  theme: themeMock,
};
const store = mockStore(initialState);

const remainedTeams = [
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

const toggle = jest.fn();
const submitHandler = jest.fn();

describe('AddNewTeamModal component', () => {
  it('renders modal when isOpen is true', () => {
    render(
      <Provider store={store}>
        <AddNewTeamModal
          isOpen={true}
          toggle={toggle}
          teams={remainedTeams}
          submitHandler={submitHandler}
        />
      </Provider>,
    );
    expect(screen.queryByText('Modal title')).toBeInTheDocument();
  });
  it('renders modal when isOpen is false', () => {
    render(
      <Provider store={store}>
        <AddNewTeamModal
          isOpen={false}
          toggle={toggle}
          teams={remainedTeams}
          submitHandler={submitHandler}
        />
      </Provider>,
    );
    expect(screen.queryByText('Modal title')).not.toBeInTheDocument();
  });
  it('check modal title and its label', () => {
    render(
      <Provider store={store}>
        <AddNewTeamModal
          isOpen={true}
          toggle={toggle}
          teams={remainedTeams}
          submitHandler={submitHandler}
        />
      </Provider>,
    );
    expect(screen.queryByText('Modal title')).toBeInTheDocument();
    expect(screen.getByText('Choose a Team:')).toBeInTheDocument();
  });
  it('check team name option', () => {
    render(
      <Provider store={store}>
        <AddNewTeamModal
          isOpen={true}
          toggle={toggle}
          teams={remainedTeams}
          submitHandler={submitHandler}
        />
      </Provider>,
    );

    expect(screen.queryByText('team11')).toBeInTheDocument();
    expect(screen.queryByText('team12')).toBeInTheDocument();
    expect(screen.queryByText('team13')).toBeInTheDocument();
    expect(screen.queryByText('team24')).toBeInTheDocument();
  });
  it('check click on one of the options', () => {
    render(
      <Provider store={store}>
        <AddNewTeamModal
          isOpen={true}
          toggle={toggle}
          teams={remainedTeams}
          submitHandler={submitHandler}
        />
      </Provider>,
    );
    const team11Element = screen.getByText('team11');
    fireEvent.click(team11Element);
    const selectInput = screen.getByRole('combobox');
    expect(selectInput).toHaveValue('aaa123');
  });
  it('check add team button', async () => {
    const remainedTeams = [
      {
        teamName: 'team154',
        _id: 'aaa478',
        isActive: true,
      },
    ];
    render(
      <Provider store={store}>
        <AddNewTeamModal
          isOpen={true}
          toggle={toggle}
          teams={remainedTeams}
          submitHandler={submitHandler}
        />
      </Provider>,
    );
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'aaa478' } });
    await waitFor(() => {});
    const addTeamButton = screen.getByText('Add Team');
    fireEvent.click(addTeamButton);
    expect(submitHandler).toHaveBeenCalled();
  });
  it('check cancel button', () => {
    render(
      <Provider store={store}>
        <AddNewTeamModal
          isOpen={true}
          toggle={toggle}
          teams={remainedTeams}
          submitHandler={submitHandler}
        />
      </Provider>,
    );
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(toggle).toHaveBeenCalled();
  });
});
