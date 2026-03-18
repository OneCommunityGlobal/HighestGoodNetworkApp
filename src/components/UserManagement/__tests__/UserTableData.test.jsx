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

const setupAxios = (mode) => {
  if (mode === 'non-jae') {
    axios.get.mockResolvedValue({
      data: [
        { id: 1, name: 'Administrator' },
        { id: 2, name: 'User' },
      ],
    });
  } else {
    axios.get.mockResolvedValue({
      data: {
        _id: jaeAccountMock._id,
        firstName: jaeAccountMock.firstName,
        lastName: jaeAccountMock.lastName,
        role: jaeAccountMock.role,
        email: jaeAccountMock.email,
      },
    });
  }
};

const createStore = ({ authState, profileState, roleName }) =>
  mockStore({
    auth: authState,
    userProfile: profileState,
    role: {
      roles: [
        {
          roleName,
          permissions: ['deleteUserProfile', 'updatePassword', 'changeUserStatus'],
        },
      ],
    },
    theme: themeMock,
  });

const createHandlers = () => ({
  onPauseResumeClick: vi.fn(),
  onDeleteClick: vi.fn(),
  onActiveInactiveClick: vi.fn(),
});

const renderUserRow = ({ store, user, handlers }) => {
  renderWithProvider(
    <MemoryRouter initialEntries={['/usermanagement']}>
      <table>
        <tbody>
          <UserTableData
            isActive
            index={0}
            user={user}
            onActiveInactiveClick={handlers.onActiveInactiveClick}
            onPauseResumeClick={handlers.onPauseResumeClick}
            onDeleteClick={handlers.onDeleteClick}
          />
        </tbody>
      </table>
    </MemoryRouter>,
    { store },
  );
};

/**
 * ActiveCell currently uses a <span role="button"> with a dynamic title.
 * We locate it by role + id pattern to avoid brittle title text.
 */
const getActiveCellButton = () => screen.getByRole('button', { name: /user is/i });
// If eslint complains about empty accessible name in your env, use this instead:
// const getActiveCellButton = () => screen.getByRole('button');

describe.each([
  {
    label: 'User Table Data: Non-Jae related Account',
    mode: 'non-jae',
    authState: ownerAccountMock,
    profileState: nonJaeAccountMock,
    user: nonJaeAccountMock,
    expectDeleteAndReset: true,
  },
  {
    label: 'User Table Data: Jae protected account record and login as Jae related account',
    mode: 'jae',
    authState: authMock,
    profileState: jaeAccountMock,
    user: jaeAccountMock,
    expectDeleteAndReset: false,
  },
])('$label', ({ mode, authState, profileState, user, expectDeleteAndReset }) => {
  let store;
  let handlers;

  const setup = () => {
    setupAxios(mode);
    store = createStore({ authState, profileState, roleName: user.role });
    handlers = createHandlers();
  };

  beforeEach(() => {
    setup();
  });

  describe('Structure', () => {
    it('should render one row of data', () => {
      renderUserRow({ store, user, handlers });
      expect(screen.getByRole('row')).toBeInTheDocument();
    });

    it('should render an active/inactive button (ActiveCell)', () => {
      renderUserRow({ store, user, handlers });
      expect(getActiveCellButton()).toBeInTheDocument();
    });

    it('should render the first name and last name in input fields', () => {
      renderUserRow({ store, user, handlers });
      expect(screen.getByDisplayValue(user.firstName)).toBeInTheDocument();
      expect(screen.getByDisplayValue(user.lastName)).toBeInTheDocument();
    });

    it('should render the correct email', () => {
      renderUserRow({ store, user, handlers });
      expect(screen.getByDisplayValue(user.email)).toBeInTheDocument();
    });

    it('should render the correct weekly committed hrs', () => {
      renderUserRow({ store, user, handlers });
      expect(screen.getByDisplayValue(`${user.weeklycommittedHours}`)).toBeInTheDocument();
    });

    it('should render a `Pause` button', () => {
      renderUserRow({ store, user, handlers });
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    if (expectDeleteAndReset) {
      it('should render a `Delete` button', () => {
        renderUserRow({ store, user, handlers });
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });

      it('should render a `reset password` button', () => {
        renderUserRow({ store, user, handlers });
        expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
      });
    } else {
      it('should render a `Set Final Day` button', () => {
        renderUserRow({ store, user, handlers });
        expect(screen.getByRole('button', { name: /set final day/i })).toBeInTheDocument();
      });

      it('should NOT render a `Delete` button', () => {
        renderUserRow({ store, user, handlers });
        expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
      });

      it('should NOT render a `reset password` button', () => {
        renderUserRow({ store, user, handlers });
        expect(screen.queryByRole('button', { name: /reset password/i })).not.toBeInTheDocument();
      });
    }
  });

  describe('Behavior', () => {
    if (expectDeleteAndReset) {
      it('should fire onPauseResumeClick() once the user clicks the pause button', async () => {
        renderUserRow({ store, user, handlers });
        await userEvent.click(screen.getByRole('button', { name: /pause/i }));
        expect(handlers.onPauseResumeClick).toHaveBeenCalledTimes(1);
      });

      it('should fire onActiveInactiveClick() once the user clicks the active/inactive button', async () => {
        renderUserRow({ store, user, handlers });
        await userEvent.click(getActiveCellButton());
        expect(handlers.onActiveInactiveClick).toHaveBeenCalledTimes(1);
      });

      it('should fire onDeleteClick() once the user clicks the delete button', async () => {
        renderUserRow({ store, user, handlers });
        await userEvent.click(screen.getByRole('button', { name: /delete/i }));
        expect(handlers.onDeleteClick).toHaveBeenCalledTimes(1);
      });

      it('should render a modal once the user clicks the `reset password` button', async () => {
        renderUserRow({ store, user, handlers });
        await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    } else {
      it('should fire alert() once the user clicks the pause button', async () => {
        renderUserRow({ store, user, handlers });
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
        await userEvent.click(screen.getByRole('button', { name: /pause/i }));
        expect(alertMock).toHaveBeenCalledTimes(1);
        alertMock.mockRestore();
      });

      it('should not fire alert() when clicking Set Final Day (based on prior expectations)', async () => {
        renderUserRow({ store, user, handlers });
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
        await userEvent.click(screen.getByRole('button', { name: /set final day/i }));
        expect(alertMock).toHaveBeenCalledTimes(0);
        alertMock.mockRestore();
      });
    }
  });
});