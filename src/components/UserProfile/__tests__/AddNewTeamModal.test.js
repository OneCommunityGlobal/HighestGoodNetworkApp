import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddNewTeamModal from '../AddNewTeamModal';

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
      <AddNewTeamModal
        isOpen={true}
        toggle={toggle}
        teams={remainedTeams}
        submitHandler={submitHandler}
      />,
    );
    expect(screen.queryByText('Modal title')).toBeInTheDocument();
  });
  it('renders modal when isOpen is false', () => {
    render(
      <AddNewTeamModal
        isOpen={false}
        toggle={toggle}
        teams={remainedTeams}
        submitHandler={submitHandler}
      />,
    );
    expect(screen.queryByText('Modal title')).not.toBeInTheDocument();
  });
  it('check modal title and its label', () => {
    render(
      <AddNewTeamModal
        isOpen={true}
        toggle={toggle}
        teams={remainedTeams}
        submitHandler={submitHandler}
      />,
    );
    expect(screen.queryByText('Modal title')).toBeInTheDocument();
    expect(screen.getByText('Choose a Team:')).toBeInTheDocument();
  });
  it('check team name option', () => {
    render(
      <AddNewTeamModal
        isOpen={true}
        toggle={toggle}
        teams={remainedTeams}
        submitHandler={submitHandler}
      />,
    );

    expect(screen.queryByText('team11')).toBeInTheDocument();
    expect(screen.queryByText('team12')).toBeInTheDocument();
    expect(screen.queryByText('team13')).toBeInTheDocument();
    expect(screen.queryByText('team24')).toBeInTheDocument();
  });
  it('check click on one of the options', () => {
    render(
      <AddNewTeamModal
        isOpen={true}
        toggle={toggle}
        teams={remainedTeams}
        submitHandler={submitHandler}
      />,
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
      <AddNewTeamModal
        isOpen={true}
        toggle={toggle}
        teams={remainedTeams}
        submitHandler={submitHandler}
      />,
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
      <AddNewTeamModal
        isOpen={true}
        toggle={toggle}
        teams={remainedTeams}
        submitHandler={submitHandler}
      />,
    );
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(toggle).toHaveBeenCalled();
  });
});
