import React from 'react';
import TeamTableSearchPanel from 'components/Teams/TeamTableSearchPanel';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { render } from '@testing-library/react';
import thunk from 'redux-thunk';
import { authMock, userProfileMock, rolesMock } from '../../__tests__/mockStates';

const mockStore = configureStore([thunk]);

let store;

beforeEach(() => {
  store = mockStore({
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
  });
});

describe('TeamTableSearchPanel', () => {
  it('should render without crashing', () => {
    render(
      <Provider store={store}>
        <TeamTableSearchPanel />;
      </Provider>,
    );
  });
});
