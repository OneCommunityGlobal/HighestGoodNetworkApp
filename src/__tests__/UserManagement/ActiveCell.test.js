import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActiveCell from '../../components/UserManagement/ActiveCell'; // Adjust the import path as necessary.

describe('ActiveCell', () => {
  it('renders with the correct active class', () => {
    const { container } = render(<ActiveCell isActive={true} canChange={false} />);
    expect(container.firstChild).toHaveClass('activeUser');
  });

  it('renders with the correct inactive class', () => {
    const { container } = render(<ActiveCell isActive={false} canChange={false} />);
    expect(container.firstChild).toHaveClass('notActiveUser');
  });

  it('sets the correct id when index is provided', () => {
    const index = 3;
    const { container } = render(<ActiveCell index={index} canChange={true} />);
    expect(container.querySelector(`#active_cell_${index}`)).toBeInTheDocument();
  });

  it('has the correct title attribute when canChange is true', () => {
    const { getByTitle } = render(<ActiveCell canChange={true} />);
    expect(getByTitle('Click here to change the user status')).toBeInTheDocument();
  });

  it('has the correct title attribute based on isActive prop', () => {
    const { getByTitle } = render(<ActiveCell isActive={true} canChange={false} />);
    expect(getByTitle('Active')).toBeInTheDocument();
  });

  it('calls onClick when canChange is true and the cell is clicked', () => {
    const mockOnClick = jest.fn();
    const { container } = render(<ActiveCell canChange={true} onClick={mockOnClick} />);

    fireEvent.click(container.firstChild);
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('does not call onClick when canChange is false', () => {
    const mockOnClick = jest.fn();
    const { container } = render(<ActiveCell canChange={false} onClick={mockOnClick} />);

    fireEvent.click(container.firstChild);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('cursor style changes based on canChange prop', () => {
    // Test when canChange is true
    const { container: containerTrue } = render(<ActiveCell canChange={true} />);
    expect(containerTrue.firstChild).toHaveStyle('cursor: pointer');

    // Test when canChange is false
    const { container: containerFalse } = render(<ActiveCell canChange={false} />);
    expect(containerFalse.firstChild).toHaveStyle('cursor: default');
  });
});
