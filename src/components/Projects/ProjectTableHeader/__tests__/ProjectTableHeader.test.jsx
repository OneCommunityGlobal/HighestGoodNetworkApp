import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import ProjectTableHeader from '../ProjectTableHeader'
import { userProfileMock } from '../../../../__tests__/mockStates'

const mockStore = configureMockStore([thunk])

vi.mock('~/utils/permissions', () => ({
  __esModule: true,
  default: vi.fn(() => true),
}))

// Mock the EditableInfoModal component
// eslint-disable-next-line react/display-name
vi.mock('components/UserProfile/EditableModal/EditableInfoModal', () => () => (
    <div>Mock EditableInfoModal</div>
));

// Helper function to render ProjectTableHeader with provided props and mock Redux store
const renderProjectTableHeader = (projectTableHeaderProps) => {

  const initialState = {
    auth: {
      user: {
        role: projectTableHeaderProps.role || 'Owner',
        permissions: { frontPermissions: [], backPermissions: [] },
      },
    },
    role: { roles: [] },
    userProfile: {
      ...userProfileMock,
      role: projectTableHeaderProps.role,
      permissions: projectTableHeaderProps.permissions || {},
    },
  };
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

// Test suite for ProjectTableHeader component
describe('ProjectTableHeader Component', () => {
  const sampleProps = {
    role: 'Owner',
    sorted: {
      column: "PROJECTS",
      direction: "DEFAULT"
    },
    selectedValue: '',
    showStatus: '',
    onChange: jest.fn(),
    selectStatus: jest.fn(),
    handleSort: jest.fn(),
    darkMode: false
  };
  const hasPermission = vi.fn((a) => true)
  sampleProps.hasPermission = hasPermission;

  // Test case to check if component renders without crashing
  it('renders without crashing', () => {
    renderProjectTableHeader(sampleProps);
  });

  // Test case to check if the delete column is shown for users with delete permission
  it('shows archive column for users with delete permission', () => {
    const stateWithDeletePermission = {
      ...sampleProps,
      userProfile: {
        ...userProfileMock,
        role: 'Owner',
        permissions: {
          frontPermissions: ['deleteProject'],
          backPermissions: ['deleteProject'],
        }
      }
    };
    const hasPermission = vi.fn((a) => true)
    stateWithDeletePermission.hasPermission = hasPermission;
    const { getByText } = renderProjectTableHeader(stateWithDeletePermission);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText('Archive')).toBeInTheDocument();
  });

  // Test case to check if the delete column is not shown for users without delete permission
  it('does not show delete column for users without delete permission', () => {
    const stateWithoutDeletePermission = {
      ...sampleProps,
      userProfile: {
        ...userProfileMock,
        role: 'Volunteer',
      }
    };
    const hasPermission = vi.fn((a) => false)
    stateWithoutDeletePermission.hasPermission = hasPermission;
    const { queryByText } = renderProjectTableHeader(stateWithoutDeletePermission);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(queryByText('Delete')).not.toBeInTheDocument();
  });

});
