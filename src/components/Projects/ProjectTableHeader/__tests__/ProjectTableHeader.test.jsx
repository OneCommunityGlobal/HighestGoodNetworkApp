import React from 'react'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
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
    canDeleteProject: true,
    sorted: {
      column: "PROJECTS",
      direction: "DEFAULT"
    },
    selectedValue: '',
    showStatus: '',
    onChange: vi.fn(),
    selectStatus: vi.fn(),
    handleSort: vi.fn(),
    onInventorySortChange: vi.fn(),
    darkMode: false
  };
  const hasPermission = vi.fn((a) => true)
  sampleProps.hasPermission = hasPermission;

  it.each([
    ['PROJECTS', 'DEFAULT', false, true],
    ['INVENTORY', 'DESC', true, false],
    ['INVENTORY', 'DEFAULT', false, true],
    ['PROJECTS', 'ASC', false, false],
    ['MEMBERS', 'DESC', false, false],
  ])('shows the menu selection for %s %s', (column, direction, editedActive, defaultActive) => {
    const onSelect = vi.fn();
    renderProjectTableHeader({ ...sampleProps, sorted: { column, direction }, onInventorySortChange: onSelect });
    const toggle = screen.getByRole('button', { name: 'Inventory sort options' });
    const header = screen.getByRole('columnheader', { name: 'Inventory' });
    if (editedActive) expect(header).toHaveAttribute('aria-sort', 'descending');
    else expect(header).not.toHaveAttribute('aria-sort');
    expect(toggle).toHaveClass(editedActive ? 'btn-secondary' : 'btn-outline-secondary');
    fireEvent.click(toggle);
    expect(onSelect).not.toHaveBeenCalled();
    const menuItems = within(header).getAllByRole('button').filter(button => button !== toggle);
    expect(menuItems.map(item => item.textContent.trim())).toEqual(['Edited', 'Default order']);
    const edited = within(header).getByRole('button', { name: 'Edited', exact: true });
    const defaultOrder = within(header).getByRole('button', { name: 'Default order', exact: true });
    expect(edited.classList.contains('active')).toBe(editedActive);
    expect(defaultOrder.classList.contains('active')).toBe(defaultActive);
    fireEvent.click(edited);
    expect(onSelect).toHaveBeenLastCalledWith('EDITED', expect.anything());
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    fireEvent.click(defaultOrder);
    expect(onSelect).toHaveBeenLastCalledWith('DEFAULT', expect.anything());
  });

  it('supports keyboard opening, option focus, and Escape without selecting a sort', async () => {
    const onSelect = vi.fn();
    renderProjectTableHeader({ ...sampleProps, onInventorySortChange: onSelect });
    const toggle = screen.getByRole('button', { name: 'Inventory sort options' });
    fireEvent.keyDown(toggle, { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 });
    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'true'));
    const edited = screen.getByRole('button', { name: 'Edited', exact: true });
    await waitFor(() => expect(edited).toHaveFocus());
    fireEvent.keyDown(edited, { key: 'Escape', code: 'Escape', keyCode: 27 });
    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'false'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('uses dark dropdown styling', () => {
    renderProjectTableHeader({ ...sampleProps, darkMode: true, sorted: { column: 'INVENTORY', direction: 'DESC' } });
    const toggle = screen.getByRole('button', { name: 'Inventory sort options' });
    expect(toggle).toHaveClass('btn-light');
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Edited', exact: true })).toHaveClass('bg-darkmode-liblack', 'text-light');
  });

  it.each(['PROJECTS', 'MEMBERS'])('marks only %s as sorted', column => {
    renderProjectTableHeader({ ...sampleProps, sorted: { column, direction: 'ASC' } });
    const sortedHeaders = screen.getAllByRole('columnheader').filter(header => header.hasAttribute('aria-sort'));
    expect(sortedHeaders).toHaveLength(1);
    expect(sortedHeaders[0]).toHaveAttribute('aria-sort', 'ascending');
    expect(screen.getByRole('columnheader', { name: 'Inventory' })).not.toHaveAttribute('aria-sort');
  });

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
      canDeleteProject: false,
      userProfile: {
        ...userProfileMock,
        role: 'Volunteer',
      }
    };
    const hasPermission = vi.fn((a) => false)
    stateWithoutDeletePermission.hasPermission = hasPermission;
    const { queryByText } = renderProjectTableHeader(stateWithoutDeletePermission);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(queryByText('Archive')).not.toBeInTheDocument();
  });

});
