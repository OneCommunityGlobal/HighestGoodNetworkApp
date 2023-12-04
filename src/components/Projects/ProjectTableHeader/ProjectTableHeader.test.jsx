import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import ProjectTableHeader from './ProjectTableHeader'
import { authMock, rolesMock, userProfileMock } from '../../../__tests__/mockStates'

const mockStore = configureMockStore([thunk])

// Mock the EditableInfoModal component
jest.mock('components/UserProfile/EditableModal/EditableInfoModal', () => () => (
  <div>Mock EditableInfoModal</div>
));
const renderProjectTableHeader = (projectTableHeaderProps) => {

  const initialState = {
    auth: {
      user: {
        role: 'Owner',
      }
    },
    userProfile: userProfileMock,
    ...projectTableHeaderProps,
  }
  const store = mockStore(initialState);

  return render(
    <Provider store={store}>
      <table>
        <thead>
        <ProjectTableHeader {...projectTableHeaderProps}/>
        </thead>
      </table>
    </Provider>
  );
};

describe('ProjectTableHeader Component', () => {
  const sampleProps = {
    role: 'Owner',
  };

  it('renders without crashing', () => {
    renderProjectTableHeader(sampleProps);
  });

  it('shows delete column for users with delete permission', () => {
    const stateWithDeletePermission = {
      ...sampleProps,
    };
    const { getByText } = renderProjectTableHeader(stateWithDeletePermission);
    expect(getByText('Delete')).toBeInTheDocument();
  });

  it('does not show delete column for users without delete permission', () => {
    const stateWithoutDeletePermission = {
      ...sampleProps,
      auth: {
        user: {
          role: 'Volunteer',
        }
      }
    };
    const { queryByText } = renderProjectTableHeader(stateWithoutDeletePermission);
    expect(queryByText('Delete')).not.toBeInTheDocument();
  });

});
