// import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActiveCell from '../ActiveCell'; // Adjust the import path as necessary.
import userEvent from '@testing-library/user-event';
import styles from '~/components/Timelog/Timelog.module.css'

describe('ActiveCell', () => {
  it('renders with the correct active class', () => {
    render(<ActiveCell isActive canChange={false} />);
    const cell = screen.getByTitle('Active');
    expect(cell).toHaveClass(styles.activeUser);
  });

  it('renders with the correct inactive class', () => {
    render(<ActiveCell isActive={false} canChange={false} />);
    const cell = screen.getByTitle('Inactive')
    expect(cell).toHaveClass(styles.notActiveUser);
  });

  it('sets the correct id when index is provided', () => {
    const index = 3;
    render(<ActiveCell index={index} canChange />);
    const cell = screen.getByTitle('Click here to change the user status');
    expect(cell).toHaveAttribute('id', `active_cell_${index}`);
  });

  it('has the correct title attribute when canChange is true', () => {
    render(<ActiveCell canChange />);
    expect(screen.getByTitle('Click here to change the user status')).toBeInTheDocument();
  });

  it('has the correct title attribute based on isActive prop', () => {
    render(<ActiveCell isActive canChange={false} />);
    expect(screen.getByTitle('Active')).toBeInTheDocument();
  });

  it('calls onClick when canChange is true and the cell is clicked', async() => {
    const mockOnClick = vi.fn();
    render(<ActiveCell canChange onClick={mockOnClick} />);
    await userEvent.click(screen.getByTitle('Click here to change the user status'));
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('does not call onClick when canChange is false', async() => {
    const mockOnClick = vi.fn();
    render(<ActiveCell canChange={false} onClick={mockOnClick} />);
    await userEvent.click(screen.getByTitle('Inactive'));
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('cursor style changes based on canChange prop', () => {
    // Test when canChange is true
    render(<ActiveCell canChange />);
    expect(screen.getByTitle('Click here to change the user status')).toHaveStyle('cursor: pointer');

    // Test when canChange is false
    render(<ActiveCell canChange={false} />);
    expect(screen.getByTitle('Inactive')).toHaveStyle('cursor: default');
  });
});
