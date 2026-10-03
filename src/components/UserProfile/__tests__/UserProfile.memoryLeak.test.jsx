import React from 'react';
import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { waitFor } from '@testing-library/react';
import { ENDPOINTS } from '~/utils/URL';
import { renderWithRouterMatch } from '../../../__tests__/utils';
import UserProfile from '..';

vi.mock('axios');

const mockStore = configureMockStore([thunk]);

describe('UserProfile async request cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aborts the in-flight profile request when the component unmounts', async () => {
    let profileRequestSignal;
    let tasksRequestSignal;
    let specialWarningsRequestSignal;

    // Keep requests pending so we can unmount while UserProfile is still loading.
    const pendingRequest = new Promise(() => {});

    axios.get.mockImplementation((url, config = {}) => {
      if (url === ENDPOINTS.USER_PROFILE('target-user')) {
        profileRequestSignal = config.signal;
      }

      if (url === ENDPOINTS.TASKS_BY_USERID('target-user')) {
        tasksRequestSignal = config.signal;
      }

      if (url === ENDPOINTS.GET_SPECIAL_WARNINGS('target-user')) {
        specialWarningsRequestSignal = config.signal;
      }

      return pendingRequest;
    });

    const store = mockStore({
      auth: {
        user: {
          userid: 'requestor-user',
          role: 'Administrator',
          email: 'requestor@example.com',
          permissions: {
            frontPermissions: [],
            backPermissions: [],
          },
        },
      },
      role: {
        roles: [],
      },
      theme: {
        darkMode: false,
      },
      timeOffRequests: {
        requests: {},
      },
      allProjects: {
        projects: [],
      },
      allTeams: {
        allTeamsData: [],
      },
      tasks: {
        taskItems: [],
      },
      userProfile: {},
      userProjects: [],
    });

    const { unmount } = renderWithRouterMatch(
      <UserProfile
        match={{ params: { userId: 'target-user' } }}
        hasPermission={() => false}
      />,
      {
        store,
        route: '/userprofile/target-user',
      },
    );

    await waitFor(() => {
      expect(profileRequestSignal).toBeDefined();
      expect(tasksRequestSignal).toBeDefined();
      expect(specialWarningsRequestSignal).toBeDefined();
    });

    unmount();

    expect(profileRequestSignal.aborted).toBe(true);
    expect(tasksRequestSignal.aborted).toBe(true);
    expect(specialWarningsRequestSignal.aborted).toBe(true);
  });
});
