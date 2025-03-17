import axios from 'axios'; // Import axios
// import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
// import { Provider } from 'react-redux';
import UserTableData from '../UserTableData';
import { authMock, themeMock } from '../../../__tests__/mockStates';
import { renderWithProvider } from '../../../__tests__/utils';
// Mock Axios requests
jest.mock('axios');
const mockStore = configureStore([thunk]);
const jaeAccountMock = {
  _id: '1',
  isAdmin: true,
  user: {
    expiryTimestamp: '2023-08-22T22:51:06.544Z',
    iat: 1597272666,
    userid: '1',
    permissions: {
      frontPermissions: ['deleteUserProfile', 'resetPassword', 'changeUserStatus'],
      backPermissions: [],
    },
    role: 'Administrator',
    email: 'devadmin@hgn.net',
  },
  firstName: 'Is',
  lastName: 'Jae',
  role: 'Administrator',
  email: 'devadmin@hgn.net',
  weeklycommittedHours: 10,
};
const nonJaeAccountMock = {
  _id: '2',
  isAdmin: true,
  user: {
    expiryTimestamp: '2023-08-22T22:51:06.544Z',
    iat: 1597272666,
    userid: '2',
    permissions: {
      frontPermissions: ['deleteUserProfile', 'resetPassword', 'changeUserStatus'],
      backPermissions: [],
    },
    role: 'Administrator',
    email: 'non_jae@hgn.net',
  },
  firstName: 'Non',
  lastName: 'Petterson',
  role: 'Administrator',
  weeklycommittedHours: 10,
  email: 'non_jae@hgn.net',
};

const ownerAccountMock = {
  _id: '3',
  isAdmin: true,
  user: {
    expiryTimestamp: '2023-08-22T22:51:06.544Z',
    iat: 1597272666,
    userid: '3',
    permissions: {
      frontPermissions: ['deleteUserProfile', 'resetPassword', 'changeUserStatus'],
      backPermissions: [],
    },
    role: 'Owner',
    email: 'devadmin@hgn.net',
  },
  firstName: 'Dev',
  lastName: 'Admin',
  weeklycommittedHours: 10,
  email: 'devadmin@hgn.net',
};

describe('User Table Data: Non-Jae related Account', () => {
  let onPauseResumeClick;
  let onDeleteClick;
  let onActiveInactiveClick;
  let store;
  beforeEach(() => {
    store = mockStore({
      auth: ownerAccountMock,
      userProfile: nonJaeAccountMock,
      role: {
        roles: [
          {
            roleName: nonJaeAccountMock.role,
            permissions: ['deleteUserProfile', 'resetPassword', 'changeUserStatus'],
          },
        ],
      },
      theme: themeMock,
    });
    onPauseResumeClick = jest.fn();
    onDeleteClick = jest.fn();
    onActiveInactiveClick = jest.fn();
    axios.get.mockResolvedValue({
      data: [
        { id: 1, name: 'Administrator' },
        { id: 2, name: 'User' },
      ],
    });

    renderWithProvider(
      <table>
        <tbody>
          <UserTableData
            isActive
            index={0}
            user={nonJaeAccountMock}
            onActiveInactiveClick={onActiveInactiveClick}
            onPauseResumeClick={onPauseResumeClick}
            onDeleteClick={onDeleteClick}
          />
        </tbody>
      </table>,
      { store },
    );
  });
  describe('Structure', () => {
    it('should render one row of data', () => {
      expect(screen.getByRole('row')).toBeInTheDocument();
    });
    it('should render a active/inactive button', () => {
      expect(screen.getByTitle('Click here to change the user status')).toBeInTheDocument();
    });

    it('should render the first name and last name in input fields', () => {
      // Find the input elements by their display value
      const firstNameInput = screen.getByDisplayValue('Non');
      const lastNameInput = screen.getByDisplayValue('Petterson');
      // Assert that the input fields are in the document
      expect(firstNameInput).toBeInTheDocument();
      expect(lastNameInput).toBeInTheDocument();
    });
    // it('should render the role as text when editUser.role exists', () => {
    //   const mockProps = {
    //     user: { ...jaeAccountMock }, // Your mock data
    //     editUser: { role: 1 }, // Make sure this is true
    //     roles: ['admin'], // No roles needed for this test
    //   };
    //   renderWithProvider(<UserTableData {...mockProps} />, { store });

    //   // Check that the text "Administrator" is present
    //   expect(screen.getByText('Administrator')).toBeInTheDocument();

    //   // Check that no select dropdown is rendered
    //   // expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    // });

    it('should render the correct email', () => {
      // Use getByDisplayValue for the email input
      const emailInput = screen.getByDisplayValue(nonJaeAccountMock.email);

      // Assert that the input element with the correct email is in the document
      expect(emailInput).toBeInTheDocument();
    });

    it('should render the correct weekly committed hrs', () => {
      // Use getByDisplayValue for the input field with the value 10
      const hoursInput = screen.getByDisplayValue('10');

      // Assert that the input field is in the document
      expect(hoursInput).toBeInTheDocument();
    });

    it('should render a `Pause` button', () => {
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });
    it('should render a `Delete` button', () => {
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
    it('should render a `reset password` button', () => {
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });
  describe('Behavior', () => {
    it('should display the correct first name and last name in input fields', () => {
      // Find the input elements by their displayed value
      const firstNameInput = screen.getByDisplayValue(nonJaeAccountMock.firstName);
      const lastNameInput = screen.getByDisplayValue(nonJaeAccountMock.lastName);

      // Assert that the inputs are in the document
      expect(firstNameInput).toBeInTheDocument();
      expect(lastNameInput).toBeInTheDocument();

      // Assert that the input fields have the correct values
      expect(firstNameInput).toHaveAttribute('value', nonJaeAccountMock.firstName);
      expect(lastNameInput).toHaveAttribute('value', nonJaeAccountMock.lastName);
    });
    it('should fire onDeleteClick() once the user clicks the delete button', () => {
      userEvent.click(screen.getByRole('button', { name: /delete/i }));
      expect(onDeleteClick).toHaveBeenCalledTimes(1);
    });
    it('should fire onPauseClick() once the user clicks the pause button', () => {
      userEvent.click(screen.getByRole('button', { name: /pause/i }));
      expect(onPauseResumeClick).toHaveBeenCalledTimes(1);
    });
    it('should fire onActiveInactiveClick() once the user clicks the active/inactive button', () => {
      userEvent.click(screen.getByTitle('Click here to change the user status'));
      expect(onActiveInactiveClick).toHaveBeenCalledTimes(1);
    });
    it('should render a modal once the user clicks the `reset password` button', () => {
      userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});

describe('User Table Data: Jae protected account record and login as Jae related account', () => {
  let onPauseResumeClick;
  let onDeleteClick;
  let onActiveInactiveClick;
  let store;
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProfile: jaeAccountMock,
      role: {
        roles: [
          {
            roleName: jaeAccountMock.role,
            permissions: ['deleteUserProfile', 'resetPassword', 'changeUserStatus'],
          },
        ],
      },
    });
    onPauseResumeClick = jest.fn();
    onDeleteClick = jest.fn();
    onActiveInactiveClick = jest.fn();
    // Mock Axios GET request in beforeEach()
    axios.get.mockResolvedValue({
      data: {
        _id: jaeAccountMock._id,
        firstName: jaeAccountMock.firstName,
        lastName: jaeAccountMock.lastName,
        role: jaeAccountMock.role,
        email: jaeAccountMock.email,
      },
    });
    renderWithProvider(
      <table>
        <tbody>
          <UserTableData
            isActive
            index={0}
            user={jaeAccountMock}
            onActiveInactiveClick={onActiveInactiveClick}
            onPauseResumeClick={onPauseResumeClick}
            onDeleteClick={onDeleteClick}
          />
        </tbody>
      </table>,
      { store },
    );
  });
  describe('Structure', () => {
    it('should render one row of data', () => {
      expect(screen.getByRole('row')).toBeInTheDocument();
    });
    it('should render a active/inactive button', () => {
      expect(screen.getByTitle('Click here to change the user status')).toBeInTheDocument();
    });
    it('should render the correct first name and last name', () => {
      const firstNameInput = screen.getByDisplayValue(jaeAccountMock.firstName);
      const lastNameInput = screen.getByDisplayValue(jaeAccountMock.lastName);
      expect(firstNameInput).toBeInTheDocument();
      expect(lastNameInput).toBeInTheDocument();
    });
    /*
    it('should render the dropdown and options when editUser.role is undefined', async () => {
      const mockProps = {
        user: { ...jaeAccountMock },
        editUser: { role: false }, // This allows the dropdown to render
        roles: [{ roleName: 'Administrator' }, { roleName: 'User' }], // Roles array
      };
    
      renderWithProvider(<UserTableData {...mockProps} />, { store });
    
      // Calculate the reversed user ID
      const reversedUserId = jaeAccountMock._id.split('').reverse().join('');
      
      // Wait for the select element using the reversed user ID
      const roleSelect = await screen.findByTestId(`role-select-${reversedUserId}`);
      console.log(roleSelect)
      // Ensure options are rendered before querying them
      await waitFor(() => {
        const options = within(roleSelect).getAllByRole('option');
        expect(options.length).toBeGreaterThan(0); // Check that at least one option exists
      });
    });
    
    

    it('should render the role as text when editUser.role exists', () => {
      const mockProps = {
        user: { ...jaeAccountMock }, // Use the mock account
        editUser: { role: true }, // Role is rendered as text
        roles: [], // No roles needed for this test
      };
    
      renderWithProvider(
        <UserTableData {...mockProps} />,
        { store }
      );
    
      // Check that the role text is rendered correctly
      expect(screen.getByText('Administrator')).toBeInTheDocument(); // Directly check the text
    
      // Check that no select element is present
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    }); */

    it('should render the correct email', () => {
      // Use getByDisplayValue for the email input
      const emailInput = screen.getByDisplayValue(jaeAccountMock.email);
      // Assert that the email input is in the document
      expect(emailInput).toBeInTheDocument();
    });
    it('should render the correct weekly committed hrs', () => {
      // Find the input element with the weekly committed hours value
      const hoursInput = screen.getByDisplayValue(`${jaeAccountMock.weeklycommittedHours}`);
      // Assert that the input is in the document
      expect(hoursInput).toBeInTheDocument();
    });
    it('should render a `Pause` button', () => {
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });
    it('should render a `Set Final Date` button', () => {
      expect(screen.getByRole('button', { name: /Set Final Day/i })).toBeInTheDocument();
    });
    it('should NOT render a `Delete` button', () => {
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });
    it('should NOT render a `reset password` button', () => {
      expect(screen.queryByRole('button', { name: /reset password/i })).not.toBeInTheDocument();
    });
  });
  describe('Behavior', () => {
    it('should render the first name input field with the correct value', () => {
      const firstNameInput = screen.getByDisplayValue(jaeAccountMock.firstName);
      expect(firstNameInput).toBeInTheDocument();
      expect(firstNameInput).toHaveAttribute('value', jaeAccountMock.firstName);
    });
    // Updated test case for last name input
    it('should render the last name input field with the correct value', () => {
      const lastNameInput = screen.getByDisplayValue(jaeAccountMock.lastName);
      expect(lastNameInput).toBeInTheDocument();
      expect(lastNameInput).toHaveAttribute('value', jaeAccountMock.lastName);
    });
    it('should fire alert() once the user clicks the pause button', () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation();
      userEvent.click(screen.getByRole('button', { name: /pause/i }));
      expect(alertMock).toHaveBeenCalledTimes(1);
    });
    it('should fire alert() once the user clicks the active/inactive button', () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation();
      userEvent.click(screen.getByRole('button', { name: /Set Final Day/i }));
      expect(alertMock).toHaveBeenCalledTimes(1);
    });
  });
});
