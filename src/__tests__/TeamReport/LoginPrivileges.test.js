/* eslint-disable import/no-unresolved */
/* eslint-disable no-unused-vars */
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
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

  it('calls handleInputChange when a admin radio button is clicked', async () => {
    const selectedInput = 'isManager';
    const handleInputChange = jest.fn(); // A mock function for the handleInputChange callback

    const { getByLabelText } = render(
      <LoginPrivileges selectedInput={selectedInput} handleInputChange={handleInputChange} />,
    );

    const adminRadio = getByLabelText('Admin');

    await act(async () => {
      fireEvent.click(adminRadio);
    });

    // Call persist on the synthetic event
    const eventObject = expect.objectContaining({ target: expect.any(Object) });
    expect(handleInputChange).toHaveBeenCalledTimes(1);
  });

  it('calls handleInputChange when a manager radio button is clicked', async () => {
    const selectedInput = 'isAdmin';
    const handleInputChange = jest.fn(); // A mock function for the handleInputChange callback

    const { getByLabelText } = render(
      <LoginPrivileges selectedInput={selectedInput} handleInputChange={handleInputChange} />,
    );

    const managerRadio = getByLabelText('Manager');

    await act(async () => {
      fireEvent.click(managerRadio);
    });

    expect(handleInputChange).toHaveBeenCalledTimes(1);
  });
});
