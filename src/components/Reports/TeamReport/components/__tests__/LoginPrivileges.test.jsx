import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import LoginPrivileges from '../LoginPrivileges';

describe('LoginPrivileges Component', () => {
  test('test_render_radio_buttons', () => {
    render(<LoginPrivileges selectedInput="isManager" handleInputChange={() => { }} />);

    const managerRadio = screen.getByLabelText('Manager');
    const adminRadio = screen.getByLabelText('Admin');

    expect(managerRadio).toBeInTheDocument();
    expect(adminRadio).toBeInTheDocument();
  });

  test('test_selected_input_checked', () => {
    render(<LoginPrivileges selectedInput="isAdmin" handleInputChange={() => { }} />);

    const managerRadio = screen.getByLabelText('Manager');
    const adminRadio = screen.getByLabelText('Admin');

    expect(managerRadio).not.toBeChecked();
    expect(adminRadio).toBeChecked();
  });

  test('test_handle_input_change_called', () => {
    const handleInputChange = jest.fn();
    render(<LoginPrivileges selectedInput="isManager" handleInputChange={handleInputChange} />);

    const adminRadio = screen.getByLabelText('Admin');
    fireEvent.click(adminRadio);

    expect(handleInputChange).toHaveBeenCalled();
  });
});