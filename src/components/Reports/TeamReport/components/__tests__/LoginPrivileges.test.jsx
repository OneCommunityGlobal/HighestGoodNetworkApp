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

  test('test_default_selected_input', () => {
    render(<LoginPrivileges selectedInput="" handleInputChange={() => { }} />);

    const managerRadio = screen.getByLabelText('Manager');
    const adminRadio = screen.getByLabelText('Admin');

    expect(managerRadio).not.toBeChecked();
    expect(adminRadio).not.toBeChecked();
  });

  test('test_radio_buttons_interact', () => {
    const handleInputChange = jest.fn();
    render(<LoginPrivileges selectedInput="isManager" handleInputChange={handleInputChange} />);

    const managerRadio = screen.getByLabelText('Manager');
    const adminRadio = screen.getByLabelText('Admin');

    fireEvent.click(adminRadio);
    expect(handleInputChange).toHaveBeenCalledWith(expect.any(Object));

    fireEvent.click(managerRadio);
    expect(handleInputChange).toHaveBeenCalledWith(expect.any(Object));
  });

  test('test_no_role_selected', () => {
    const handleInputChange = jest.fn();
    render(<LoginPrivileges selectedInput="" handleInputChange={handleInputChange} />);

    const managerRadio = screen.getByLabelText('Manager');
    const adminRadio = screen.getByLabelText('Admin');

    expect(managerRadio).not.toBeChecked();
    expect(adminRadio).not.toBeChecked();
  });

  test('test_multiple_renders', () => {
    const { rerender } = render(<LoginPrivileges selectedInput="isManager" handleInputChange={() => { }} />);
    
    let managerRadio = screen.getByLabelText('Manager');
    let adminRadio = screen.getByLabelText('Admin');

    expect(managerRadio).toBeChecked();
    expect(adminRadio).not.toBeChecked();

    rerender(<LoginPrivileges selectedInput="isAdmin" handleInputChange={() => { }} />);

    managerRadio = screen.getByLabelText('Manager');
    adminRadio = screen.getByLabelText('Admin');

    expect(managerRadio).not.toBeChecked();
    expect(adminRadio).toBeChecked();
  });
});
