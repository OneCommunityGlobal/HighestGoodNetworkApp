/* eslint-disable import/no-unresolved */
/* eslint-disable no-unused-vars */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // for better matching

import { LoginPrivileges } from 'components/Reports/TeamReport/components/LoginPrivileges';

describe('LoginPrivileges Component', () => {
  it('renders the component with the manager input provide', () => {
    const selectedInput = 'isManager';
    const handleInputChange = jest.fn(); // A mock function for the handleInputChange callback

    const { getByLabelText } = render(
      <LoginPrivileges selectedInput={selectedInput} handleInputChange={handleInputChange} />,
    );

    const managerRadio = getByLabelText('Manager');
    const adminRadio = getByLabelText('Admin');

    expect(managerRadio).toBeChecked();
    expect(adminRadio).not.toBeChecked();
  });

  it('renders the component with the admin input provide', () => {
    const selectedInput = 'isAdmin';
    const handleInputChange = jest.fn(); // A mock function for the handleInputChange callback

    const { getByLabelText } = render(
      <LoginPrivileges selectedInput={selectedInput} handleInputChange={handleInputChange} />,
    );

    const managerRadio = getByLabelText('Manager');
    const adminRadio = getByLabelText('Admin');

    expect(managerRadio).not.toBeChecked();
    expect(adminRadio).toBeChecked();
  });

  it('calls handleInputChange when a admin radio button is clicked', () => {
    const selectedInput = 'isManager';
    const handleInputChange = jest.fn(); // A mock function for the handleInputChange callback

    const { getByLabelText } = render(
      <LoginPrivileges selectedInput={selectedInput} handleInputChange={handleInputChange} />,
    );

    const adminRadio = getByLabelText('Admin');

    fireEvent.click(adminRadio);

    expect(handleInputChange).toHaveBeenCalledTimes(1);
    expect(handleInputChange).toHaveBeenCalledWith(
      expect.objectContaining({ target: expect.any(Object) }),
    );
  });

  it('calls handleInputChange when a manager radio button is clicked', () => {
    const selectedInput = 'isAdmin';
    const handleInputChange = jest.fn(); // A mock function for the handleInputChange callback

    const { getByLabelText } = render(
      <LoginPrivileges selectedInput={selectedInput} handleInputChange={handleInputChange} />,
    );

    const adminRadio = getByLabelText('Manager');

    fireEvent.click(adminRadio);

    expect(handleInputChange).toHaveBeenCalledTimes(1);
    expect(handleInputChange).toHaveBeenCalledWith(
      expect.objectContaining({ target: expect.any(Object) }),
    );
  });
});
