import React from 'react';
import { render, screen, act } from '@testing-library/react';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import { ModalProvider } from '~/context/ModalContext';
import { ENDPOINTS } from '~/utils/URL';
import { FETCH_INFOS_SUCCESS } from '~/constants/information';
import PermissionList from '../PermissionList';
import permissionLabel from '../PermissionsConst';

vi.mock('axios');

const mockStore = configureMockStore([thunk]);

const BLUE_ICON_TITLE = 'Click for information about this';
const BLACK_ICON_TITLE = 'Click for more information';

// 3 headings (one nested inside another) and 4 permissions
const testPermissions = [
  {
    label: 'Reports',
    description: 'Category for reports',
    subperms: [
      { label: 'See Reports', key: 'getReports', description: 'Opens the reports page' },
      {
        label: 'Weekly Summaries',
        description: 'Category for weekly summaries',
        subperms: [
          {
            label: 'See Weekly Summaries',
            key: 'getWeeklySummaries',
            description: 'Opens the weekly summaries',
          },
        ],
      },
    ],
  },
  {
    label: 'Badges',
    description: 'Category for badges',
    subperms: [{ label: 'See Badges', key: 'seeBadges', description: 'Shows all badges' }],
  },
  { label: 'Edit Header Message', key: 'editHeaderMessage', description: 'Edits the header' },
];

const makeStore = () =>
  mockStore({
    auth: {
      user: { role: 'Owner', permissions: { frontPermissions: [], backPermissions: [] } },
    },
    role: { roles: [] },
    theme: { darkMode: false },
    infoCollections: { infos: [] },
  });

const renderList = (store, listProps = {}) =>
  render(
    <Provider store={store}>
      <ModalProvider>
        <PermissionList permissionsList={testPermissions} {...listProps} />
      </ModalProvider>
    </Provider>,
  );

// lets the mocked request resolve and any re-render after it finish
const settle = () =>
  act(async () => {
    await new Promise(resolve => {
      setTimeout(resolve, 0);
    });
  });

const infoTextRequests = () =>
  axios.get.mock.calls.filter(([url]) => url === ENDPOINTS.INFO_COLLECTIONS);

const countRows = list =>
  list.reduce(
    (count, item) => {
      if (!item.subperms) return { ...count, permissions: count.permissions + 1 };
      const inner = countRows(item.subperms);
      return {
        headings: count.headings + 1 + inner.headings,
        permissions: count.permissions + inner.permissions,
      };
    },
    { headings: 0, permissions: 0 },
  );

describe('PermissionList info texts', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    axios.get.mockClear();
    axios.get.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
  });

  it('asks for the saved info texts once for the whole list, not once per row', async () => {
    const store = makeStore();
    renderList(store);
    await settle();

    // every permission row has the blue icon and every heading keeps the black one
    expect(screen.getAllByTitle(BLUE_ICON_TITLE)).toHaveLength(4);
    expect(screen.getAllByTitle(BLACK_ICON_TITLE)).toHaveLength(3);
    // desktop layout: rows under a heading are indented
    expect(screen.getByText('See Reports')).toHaveStyle({ textIndent: '50px' });

    expect(infoTextRequests()).toHaveLength(1);
    expect(store.getActions().filter(action => action.type === FETCH_INFOS_SUCCESS)).toHaveLength(
      1,
    );
  });

  it('still asks only once when the list re-renders with new props', async () => {
    const store = makeStore();
    const { rerender } = renderList(store);
    await settle();

    // e.g. an Add/Delete click re-renders the list with new rolePermissions
    rerender(
      <Provider store={store}>
        <ModalProvider>
          <PermissionList permissionsList={testPermissions} rolePermissions={['getReports']} />
        </ModalProvider>
      </Provider>,
    );
    await settle();

    expect(infoTextRequests()).toHaveLength(1);
  });

  it('does not ask when the list is a nested sub-list', async () => {
    const store = makeStore();
    renderList(store, { isNested: true });
    await settle();

    expect(screen.getAllByTitle(BLUE_ICON_TITLE)).toHaveLength(4);
    expect(infoTextRequests()).toHaveLength(0);
    expect(store.getActions()).toHaveLength(0);
  });

  it('still asks only once in the mobile layout, where sub-lists keep depth 0', async () => {
    window.innerWidth = 500;
    renderList(makeStore());
    await settle();

    // mobile layout: rows under a heading are not indented
    expect(screen.getByText('See Reports')).toHaveStyle({ textIndent: '0px' });
    expect(infoTextRequests()).toHaveLength(1);
  });

  it('asks only once for the full permission list from Permissions.json', async () => {
    renderList(makeStore(), { permissionsList: permissionLabel });
    await settle();

    const { headings, permissions } = countRows(permissionLabel);
    expect(screen.getAllByTitle(BLUE_ICON_TITLE)).toHaveLength(permissions);
    expect(screen.getAllByTitle(BLACK_ICON_TITLE)).toHaveLength(headings);
    expect(infoTextRequests()).toHaveLength(1);
  });
});
