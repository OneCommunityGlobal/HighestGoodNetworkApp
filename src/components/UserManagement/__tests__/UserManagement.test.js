import React from 'react';
import UserManagement from '..';
import configureStore from 'redux-mock-store';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

describe('UserManagement component', () => {
  const mockStore = configureStore();
  const mockState = {
    users: {
    }
  };

  const store = mockStore(mockState);

  const renderComponent = () => render(
    <Provider store={store}>
      <UserManagement />
    </Provider>
  );

  it('should render the component without crashing', () => {
    const mockState = {
      allUserProfiles: { fetching: false, userProfiles: [] },
      auth: { user: { role: 'Administrator' } },
      role: { roles: [] },
      timeOffRequests: {},
    };

    renderComponent(<UserManagement state={mockState} />);

    expect(jest.mocked(getAllUserProfile)).toHaveBeenCalledTimes(1);
  });
});
