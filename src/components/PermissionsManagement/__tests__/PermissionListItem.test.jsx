import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import { ModalProvider } from '~/context/ModalContext';
import { ENDPOINTS } from '~/utils/URL';
import PermissionListItem from '../PermissionListItem';

vi.mock('axios');

vi.mock('@tinymce/tinymce-react', () => ({
  Editor: ({ value, onEditorChange }) => (
    <textarea
      aria-label="Mock Editor"
      value={value}
      onChange={e => onEditorChange(e.target.value)}
    />
  ),
}));

const mockStore = configureMockStore([thunk]);

const BLUE_ICON_TITLE = 'Click for information about this';
const BLACK_ICON_TITLE = 'Click for more information';

const permissionRow = {
  label: 'Interact with Task "Ready for Review"',
  permission: 'putReviewStatus',
  description: "Lets the user's team mark a task as ready & reviewed",
};

const headingRow = {
  label: 'Tasks',
  description: 'Category for all permissions related to tasks',
  subperms: [
    {
      label: permissionRow.label,
      key: permissionRow.permission,
      description: permissionRow.description,
    },
  ],
};

// role is the SIGNED-IN user's role (state.auth.user.role)
const renderItem = ({ itemProps, role = 'Owner', darkMode = false, infos = [] }) => {
  const store = mockStore({
    auth: {
      user: { role, permissions: { frontPermissions: [], backPermissions: [] } },
    },
    role: { roles: [] },
    theme: { darkMode },
    infoCollections: { infos },
  });
  render(
    <Provider store={store}>
      <ModalProvider>
        <PermissionListItem
          rolePermissions={[]}
          immutablePermissions={[]}
          editable={false}
          depth={0}
          setPermissions={vi.fn()}
          onChange={vi.fn()}
          {...itemProps}
        />
      </ModalProvider>
    </Provider>,
  );
};

const infoTextRequests = () =>
  axios.get.mock.calls.filter(([url]) => url === ENDPOINTS.INFO_COLLECTIONS);

describe('PermissionListItem info icons', () => {
  beforeEach(() => {
    axios.get.mockClear();
    axios.get.mockResolvedValue({ data: [] });
  });

  it('shows the blue, editable info icon on a permission row instead of the black one', () => {
    renderItem({ itemProps: permissionRow });

    const row = screen.getByTestId('putReviewStatus');
    // the title tells the two icons apart; the blue colour is EditableInfoModal's own styling
    const icon = within(row).getByTitle(BLUE_ICON_TITLE);
    expect(icon).toHaveClass('fa-info-circle');
    expect(within(row).queryByTitle(BLACK_ICON_TITLE)).not.toBeInTheDocument();
    // the row icon does not ask the server by itself
    expect(infoTextRequests()).toHaveLength(0);

    fireEvent.click(icon);
    expect(
      screen.getByText('Welcome to the Interact with Task "Ready for Review" Information Page!'),
    ).toBeInTheDocument();
    // nothing saved yet: the description from Permissions.json is shown
    // (an exact match, so ' and & are shown as typed, not as &#39; or &amp;)
    const text = screen.getByText(permissionRow.description);

    // the signed-in Owner can edit the text
    fireEvent.click(text);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('lets a signed-in user who is not an Owner read the text but not edit it', () => {
    renderItem({ itemProps: permissionRow, role: 'Administrator' });

    fireEvent.click(screen.getByTitle(BLUE_ICON_TITLE));
    fireEvent.click(screen.getByText(permissionRow.description));

    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('shows the saved text stored under the permission key, not under the label', () => {
    renderItem({
      itemProps: permissionRow,
      infos: [
        {
          infoName: 'Permission: putReviewStatus Info',
          infoContent: '<p>Saved by an Owner</p>',
          visibility: '0',
        },
        {
          infoName: `Permission: ${permissionRow.label} Info`,
          infoContent: '<p>Saved under the label</p>',
          visibility: '0',
        },
      ],
    });

    fireEvent.click(screen.getByTitle(BLUE_ICON_TITLE));

    expect(screen.getByText('Saved by an Owner')).toBeInTheDocument();
    expect(screen.queryByText('Saved under the label')).not.toBeInTheDocument();
    expect(screen.queryByText(permissionRow.description)).not.toBeInTheDocument();
  });

  it('uses dark mode in the blue icon modal', () => {
    renderItem({ itemProps: permissionRow, darkMode: true });

    fireEvent.click(screen.getByTitle(BLUE_ICON_TITLE));

    expect(screen.getByRole('document')).toHaveClass('text-light');
  });

  it('shows the blue, editable info icon on a heading row too', () => {
    renderItem({ itemProps: headingRow });

    // no black icon is left: the heading and its permission row both have the blue one
    expect(screen.queryByTitle(BLACK_ICON_TITLE)).not.toBeInTheDocument();
    const blueIcons = screen.getAllByTitle(BLUE_ICON_TITLE);
    expect(blueIcons).toHaveLength(2);
    expect(
      within(screen.getByTestId('putReviewStatus')).getByTitle(BLUE_ICON_TITLE),
    ).toBeInTheDocument();
    // the sub-list under the heading is nested, so it does not ask the server
    expect(infoTextRequests()).toHaveLength(0);

    // the heading's icon comes first
    fireEvent.click(blueIcons[0]);
    expect(screen.getByText('Welcome to the Tasks Information Page!')).toBeInTheDocument();
    // nothing saved yet: the description from Permissions.json is shown
    const text = screen.getByText(headingRow.description);

    // the signed-in Owner can edit the text
    fireEvent.click(text);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('shows the saved heading text stored under the lower-case label', () => {
    renderItem({
      itemProps: headingRow,
      infos: [
        {
          infoName: 'Permission Heading: tasks Info',
          infoContent: '<p>Saved by an Owner</p>',
          visibility: '0',
        },
      ],
    });

    fireEvent.click(screen.getAllByTitle(BLUE_ICON_TITLE)[0]);

    expect(screen.getByText('Saved by an Owner')).toBeInTheDocument();
    expect(screen.queryByText(headingRow.description)).not.toBeInTheDocument();
  });
});
