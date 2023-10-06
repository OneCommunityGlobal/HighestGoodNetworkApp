import configureStore from 'redux-mock-store';
import TeamMembersPopup from 'components/Teams/TeamMembersPopup';
import thunk from 'redux-thunk';
import { authMock, userProfileMock, rolesMock } from '../../__tests__/mockStates';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

const mockStore = configureStore([thunk]);

const mockProps = {
  members: {
    teamMembers: [],
  },
  usersdata: {
    userProfiles: [],
  },
};

const renderComponent = props => {
  const store = mockStore({
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
    ...props,
  });

  render(
    <Provider store={store}>
      <TeamMembersPopup {...props} />
    </Provider>,
  );
};

describe('TeamMembersPopup', () => {
  it('should render correctly', () => {
    renderComponent(mockProps);
  });
});
