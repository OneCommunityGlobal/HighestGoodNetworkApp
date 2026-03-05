import axios from 'axios';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import { configureStore } from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';

import UserTableData from '../UserTableData';
import { authMock, themeMock } from '../../../__tests__/mockStates';
import { renderWithProvider } from '../../../__tests__/utils';

vi.mock('axios');

const mockStore = configureStore([thunk]);

const jaeAccountMock = {
  _id: '1',
  isAdmin: true,
  user: {
    expiryTimestamp: '2023-08-22T22:51:06.544Z',
    iat: 1597272666,
    userid: '1',
    permissions: {
      frontPermissions: ['deleteUserProfile', 'updatePassword', 'changeUserStatus'],
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
      frontPermissions: ['deleteUserProfile', 'updatePassword', 'changeUserStatus'],
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
  inactiveReason: null,
  endDate: null,
  isSet: false,
};

const ownerAccountMock = {
  _id: '3',
  isAdmin: true,
  user: {
    expiryTimestamp: '2023-08-22T22:51:06.544Z',
    iat: 1597272666,
    userid: '3',
    permissions: {
      frontPermissions: ['deleteUserProfile', 'updatePassword', 'changeUserStatus'],
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

/**
 * ActiveCell uses `title` for its tooltip/cue.
 * The exact string varies by status (active/inactive/paused/scheduled) and permissions.
 * So tests should look for the control by matching any known title variants.
 */
const getActiveCell = () =>
  screen.getByTitle(
    /click to change user status|user is inactive|inactive|scheduled for deactivation|final day scheduled|user has a final day scheduled|paused|user is paused/i,
  );

describe('User Table Data: Non-Jae related Account', () => {
  let onPauseResumeClick;
  let onDeleteClick;
  let onActiveInactiveClick;
  let store;

  const renderRow = user => {
    renderWithProvider(
      <MemoryRouter initialEntries={['/usermanagement']}>
        <table>
          <tbody>
            <UserTableData
              isActive
              index={0}
              user={user}
              onActiveInactiveClick={onActiveInactiveClick}
              onPauseResumeClick={onPauseResumeClick}
              onDeleteClick={onDeleteClick}
            />
          </tbody>
        </table>
      </MemoryRouter>,
      { store },
    );
  };

  beforeEach(() => {
    store = mockStore({
      auth: ownerAccountMock,
      userProfile: nonJaeAccountMock,
      role: {
        roles: [
          {
            roleName: nonJaeAccountMock.role,
            permissions: ['deleteUserProfile', 'updatePassword', 'changeUserStatus'],
          },
        ],
      },
      theme: themeMock,
    });

    onPauseResumeClick = vi.fn();
    onDeleteClick = vi.fn();
    onActiveInactiveClick = vi.fn();

    axios.get.mockResolvedValue({
      data: [
        { id: 1, name: 'Administrator' },
        { id: 2, name: 'User' },
      ],
    });
  });

  describe('Structure', () => {
    it('should render one row of data', () => {
      renderRow(nonJaeAccountMock);
      expect(screen.getByRole('row')).toBeInTheDocument();
    });

    it('should render an active/inactive button (ActiveCell)', () => {
      renderRow(nonJaeAccountMock);
      expect(getActiveCell()).toBeInTheDocument();
    });

    it('should render the first name and last name in input fields', () => {
      renderRow(nonJaeAccountMock);
      expect(screen.getByDisplayValue('Non')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Petterson')).toBeInTheDocument();
    });

    it('should render the correct email', () => {
      renderRow(nonJaeAccountMock);
      expect(screen.getByDisplayValue(nonJaeAccountMock.email)).toBeInTheDocument();
    });

    it('should render the correct weekly committed hrs', () => {
      renderRow(nonJaeAccountMock);
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });

    it('should render a `Pause` button', () => {
      renderRow(nonJaeAccountMock);
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    it('should render a `Delete` button', () => {
      renderRow(nonJaeAccountMock);
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should render a `reset password` button', () => {
      renderRow(nonJaeAccountMock);
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });

  describe('Behavior', () => {
    it('should display the correct first name and last name in input fields', () => {
      renderRow(nonJaeAccountMock);

      const firstNameInput = screen.getByDisplayValue(nonJaeAccountMock.firstName);
      const lastNameInput = screen.getByDisplayValue(nonJaeAccountMock.lastName);

      expect(firstNameInput).toBeInTheDocument();
      expect(lastNameInput).toBeInTheDocument();

      expect(firstNameInput).toHaveAttribute('value', nonJaeAccountMock.firstName);
      expect(lastNameInput).toHaveAttribute('value', nonJaeAccountMock.lastName);
    });

    it('should fire onDeleteClick() once the user clicks the delete button', async () => {
      renderRow(nonJaeAccountMock);
      await userEvent.click(screen.getByRole('button', { name: /delete/i }));
      expect(onDeleteClick).toHaveBeenCalledTimes(1);
    });

    it('should fire onPauseResumeClick() once the user clicks the pause button', async () => {
      renderRow(nonJaeAccountMock);
      await userEvent.click(screen.getByRole('button', { name: /pause/i }));
      expect(onPauseResumeClick).toHaveBeenCalledTimes(1);
    });

    it('should fire onActiveInactiveClick() once the user clicks the active/inactive button', async () => {
      renderRow(nonJaeAccountMock);
      await userEvent.click(getActiveCell());
      expect(onActiveInactiveClick).toHaveBeenCalledTimes(1);
    });

    it('should render a modal once the user clicks the `reset password` button', async () => {
      renderRow(nonJaeAccountMock);
      await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});

describe('User Table Data: Jae protected account record and login as Jae related account', () => {
  let onPauseResumeClick;
  let onDeleteClick;
  let onActiveInactiveClick;
  let store;

  const renderRow = user => {
    renderWithProvider(
      <MemoryRouter initialEntries={['/usermanagement']}>
        <table>
          <tbody>
            <UserTableData
              isActive
              index={0}
              user={user}
              onActiveInactiveClick={onActiveInactiveClick}
              onPauseResumeClick={onPauseResumeClick}
              onDeleteClick={onDeleteClick}
            />
          </tbody>
        </table>
      </MemoryRouter>,
      { store },
    );
  };

  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProfile: jaeAccountMock,
      role: {
        roles: [
          {
            roleName: jaeAccountMock.role,
            permissions: ['deleteUserProfile', 'updatePassword', 'changeUserStatus'],
          },
        ],
      },
      theme: themeMock,
    });

    onPauseResumeClick = vi.fn();
    onDeleteClick = vi.fn();
    onActiveInactiveClick = vi.fn();

    axios.get.mockResolvedValue({
      data: {
        _id: jaeAccountMock._id,
        firstName: jaeAccountMock.firstName,
        lastName: jaeAccountMock.lastName,
        role: jaeAccountMock.role,
        email: jaeAccountMock.email,
      },
    });
  });

  describe('Structure', () => {
    it('should render one row of data', () => {
      renderRow(jaeAccountMock);
      expect(screen.getByRole('row')).toBeInTheDocument();
    });

    it('should render an active/inactive button (ActiveCell)', () => {
      renderRow(jaeAccountMock);
      expect(getActiveCell()).toBeInTheDocument();
    });

    it('should render the correct first name and last name', () => {
      renderRow(jaeAccountMock);
      expect(screen.getByDisplayValue(jaeAccountMock.firstName)).toBeInTheDocument();
      expect(screen.getByDisplayValue(jaeAccountMock.lastName)).toBeInTheDocument();
    });

    it('should render the correct email', () => {
      renderRow(jaeAccountMock);
      expect(screen.getByDisplayValue(jaeAccountMock.email)).toBeInTheDocument();
    });

    it('should render the correct weekly committed hrs', () => {
      renderRow(jaeAccountMock);
      expect(screen.getByDisplayValue(`${jaeAccountMock.weeklycommittedHours}`)).toBeInTheDocument();
    });

    it('should render a `Pause` button', () => {
      renderRow(jaeAccountMock);
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    it('should render a `Set Final Date` button', () => {
      renderRow(jaeAccountMock);
      expect(screen.getByRole('button', { name: /set final day/i })).toBeInTheDocument();
    });

    it('should NOT render a `Delete` button', () => {
      renderRow(jaeAccountMock);
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });

    it('should NOT render a `reset password` button', () => {
      renderRow(jaeAccountMock);
      expect(screen.queryByRole('button', { name: /reset password/i })).not.toBeInTheDocument();
    });
  });

  describe('Behavior', () => {
    it('should render the first name input field with the correct value', () => {
      renderRow(jaeAccountMock);
      const firstNameInput = screen.getByDisplayValue(jaeAccountMock.firstName);
      expect(firstNameInput).toBeInTheDocument();
      expect(firstNameInput).toHaveAttribute('value', jaeAccountMock.firstName);
    });

    it('should render the last name input field with the correct value', () => {
      renderRow(jaeAccountMock);
      const lastNameInput = screen.getByDisplayValue(jaeAccountMock.lastName);
      expect(lastNameInput).toBeInTheDocument();
      expect(lastNameInput).toHaveAttribute('value', jaeAccountMock.lastName);
    });

    it('should fire alert() once the user clicks the pause button', async () => {
      renderRow(jaeAccountMock);
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
      await userEvent.click(screen.getByRole('button', { name: /pause/i }));
      expect(alertMock).toHaveBeenCalledTimes(1);
      alertMock.mockRestore();
    });

    it('should not fire alert() when clicking Set Final Day (based on prior expectations)', async () => {
      renderRow(jaeAccountMock);
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
      await userEvent.click(screen.getByRole('button', { name: /set final day/i }));
      expect(alertMock).toHaveBeenCalledTimes(0);
      alertMock.mockRestore();
    });
  });
});