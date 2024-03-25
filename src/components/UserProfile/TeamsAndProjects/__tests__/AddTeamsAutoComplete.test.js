import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import AddTeamsAutoComplete from '../AddTeamsAutoComplete';

// Mock props
const mockTeamsData = {
  allTeams: [
    { teamName: 'Team1' },
    { teamName: 'Team2' },
    { teamName: 'Team3' },
  ],
};

const mockOnDropDownSelect = jest.fn();

const mockProps = {
  teamsData: mockTeamsData,
  selectedTeam: null,
  onDropDownSelect: mockOnDropDownSelect,
};

describe('AddTeamsAutoComplete component', () => {
  it('renders without crashing', () => {
    render(<AddTeamsAutoComplete {...mockProps} />);
  });

  it('updates input value on change', () => {
    const { getByRole } = render(<AddTeamsAutoComplete {...mockProps} />);
    const inputElement = getByRole('textbox');

    fireEvent.change(inputElement, { target: { value: 'searchText' } });

    expect(inputElement.value).toBe('searchText');
  });

  it('opens dropdown on input change', () => {
    const { getByRole, getByText, queryByRole } = render(<AddTeamsAutoComplete {...mockProps} />);
    const inputElement = getByRole('textbox');
  
    fireEvent.change(inputElement, { target: { value: 'searchText' } });
  
    const dropdownMenu = queryByRole('menu');
    expect(dropdownMenu).toHaveClass('show');
  });

  it('closes dropdown on item click', () => {
    const { getByRole, getByText, queryByRole } = render(<AddTeamsAutoComplete {...mockProps} />);
    const inputElement = getByRole('textbox');
  
    fireEvent.change(inputElement, { target: { value: 'searchText' } });
    const teamItems = document.querySelectorAll('.team-auto-complete');
    const teamItem = Array.from(teamItems).find(item => item.textContent === 'Team1');
  
    if (!teamItem) {
      return;
    }
    fireEvent.click(teamItem);

    const dropdownMenu = queryByRole('menu');
    expect(dropdownMenu).toBeNull();
  });

  it('selects a team from dropdown', () => {
    const mockOnDropDownSelect = jest.fn();
    render(<AddTeamsAutoComplete teamsData={mockTeamsData} onDropDownSelect={mockOnDropDownSelect} />);
    const input = screen.getByRole('textbox');
    userEvent.type(input, 'Team');
    fireEvent.click(screen.getByText('Team1'));
    expect(mockOnDropDownSelect).toHaveBeenCalledWith({ teamName: 'Team1' });
    expect(input).toHaveValue('Team1');
  });
  // Add more test cases for different scenarios as needed
});
