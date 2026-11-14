import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import { ModalProvider } from '~/context/ModalContext';
import { ENDPOINTS } from '~/utils/URL';
import { FETCH_INFOS_SUCCESS } from '~/constants/information';
import { permissions as permissionKeys } from '~/utils/constants';
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

    // every heading and every permission row has the blue icon; no black one is left
    expect(screen.getAllByTitle(BLUE_ICON_TITLE)).toHaveLength(7);
    expect(screen.queryByTitle(BLACK_ICON_TITLE)).not.toBeInTheDocument();
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

    expect(screen.getAllByTitle(BLUE_ICON_TITLE)).toHaveLength(7);
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
    expect(screen.getAllByTitle(BLUE_ICON_TITLE)).toHaveLength(headings + permissions);
    expect(screen.queryByTitle(BLACK_ICON_TITLE)).not.toBeInTheDocument();
    expect(infoTextRequests()).toHaveLength(1);
  });
});

describe('Opening and closing headings', () => {
  const originalInnerWidth = window.innerWidth;
  const ROWS = ['See Reports', 'See Weekly Summaries', 'See Badges', 'Edit Header Message'];

  beforeEach(() => {
    axios.get.mockClear();
    axios.get.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
  });

  const heading = name => screen.getByRole('button', { name });
  // a heading button's aria-expanded is true while its rows are shown
  const openHeadingNames = () =>
    screen.queryAllByRole('button', { expanded: true }).map(button => button.textContent);
  const closedHeadingNames = () =>
    screen.queryAllByRole('button', { expanded: false }).map(button => button.textContent);
  const shownRows = () => ROWS.filter(row => screen.queryByText(row));

  it('starts with every heading open, with one Open all and one Collapse all', async () => {
    renderList(makeStore());
    await settle();

    expect(openHeadingNames()).toEqual(['Reports', 'Weekly Summaries', 'Badges']);
    expect(shownRows()).toEqual(ROWS);
    // only above the outer list, not above each sub-list
    expect(screen.getAllByRole('button', { name: 'Open all' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Collapse all' })).toHaveLength(1);
  });

  it('shows the two buttons only once in the mobile layout, where sub-lists keep depth 0', async () => {
    window.innerWidth = 500;
    renderList(makeStore());
    await settle();

    expect(screen.getAllByRole('button', { name: 'Open all' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Collapse all' })).toHaveLength(1);
  });

  it('closes and opens one heading at a time, a nested one too, without counting a change', async () => {
    const onChange = vi.fn();
    renderList(makeStore(), { onChange });
    await settle();

    fireEvent.click(heading('Badges'));
    expect(closedHeadingNames()).toEqual(['Badges']);
    expect(shownRows()).toEqual(['See Reports', 'See Weekly Summaries', 'Edit Header Message']);

    // the nested heading closes on its own; Reports stays open
    fireEvent.click(heading('Weekly Summaries'));
    expect(closedHeadingNames()).toEqual(['Weekly Summaries', 'Badges']);
    expect(shownRows()).toEqual(['See Reports', 'Edit Header Message']);

    fireEvent.click(heading('Badges'));
    expect(closedHeadingNames()).toEqual(['Weekly Summaries']);
    expect(shownRows()).toEqual(['See Reports', 'See Badges', 'Edit Header Message']);

    // closing and opening Reports keeps its nested heading closed
    fireEvent.click(heading('Reports'));
    fireEvent.click(heading('Reports'));
    expect(closedHeadingNames()).toEqual(['Weekly Summaries']);
    // opening and closing is not a permission change
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Collapse all closes the headings at every level, and Open all opens them all', async () => {
    renderList(makeStore());
    await settle();

    fireEvent.click(screen.getByRole('button', { name: 'Collapse all' }));
    expect(closedHeadingNames()).toEqual(['Reports', 'Badges']);
    expect(shownRows()).toEqual(['Edit Header Message']);

    // the nested heading was closed too
    fireEvent.click(heading('Reports'));
    expect(closedHeadingNames()).toEqual(['Weekly Summaries', 'Badges']);
    expect(shownRows()).toEqual(['See Reports', 'Edit Header Message']);

    fireEvent.click(screen.getByRole('button', { name: 'Open all' }));
    expect(closedHeadingNames()).toEqual([]);
    expect(shownRows()).toEqual(ROWS);
    // sub-lists that are drawn again do not ask the server again
    expect(infoTextRequests()).toHaveLength(1);
  });

  it('never sends the form around the list', async () => {
    // Manage User Permissions and Add New Role put the list inside a form
    const onSubmit = vi.fn(event => event.preventDefault());
    render(
      <Provider store={makeStore()}>
        <ModalProvider>
          <form onSubmit={onSubmit}>
            <PermissionList permissionsList={testPermissions} />
          </form>
        </ModalProvider>
      </Provider>,
    );
    await settle();

    fireEvent.click(heading('Reports'));
    fireEvent.click(screen.getByRole('button', { name: 'Collapse all' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open all' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('works with the keyboard: Tab, then Enter or Space', async () => {
    renderList(makeStore());
    await settle();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Open all' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Collapse all' })).toHaveFocus();
    await userEvent.tab();
    expect(heading('Reports')).toHaveFocus();

    await userEvent.type(heading('Reports'), '{enter}', { skipClick: true });
    expect(closedHeadingNames()).toEqual(['Reports']);
    await userEvent.type(heading('Reports'), '{space}', { skipClick: true });
    expect(closedHeadingNames()).toEqual([]);
  });

  it('keeps Add working on a closed heading, and its icon and Add do not open it', async () => {
    // the signed-in Owner may edit roles, so the Add buttons can be clicked
    const store = mockStore({
      ...makeStore().getState(),
      role: { roles: [{ roleName: 'Owner', permissions: [permissionKeys.putRole] }] },
    });
    const setPermissions = vi.fn();
    const onChange = vi.fn();
    renderList(store, { editable: true, setPermissions, onChange });
    await settle();

    fireEvent.click(heading('Reports'));
    // the first blue icon belongs to the Reports heading
    fireEvent.click(screen.getAllByTitle(BLUE_ICON_TITLE)[0]);
    fireEvent.click(screen.getByText('Close'));
    expect(closedHeadingNames()).toEqual(['Reports']);

    // the first Add button belongs to the Reports heading too
    fireEvent.click(screen.getAllByRole('button', { name: 'Add' })[0]);
    expect(closedHeadingNames()).toEqual(['Reports']);
    // Add sends one "add this key" function per permission; run each on an empty list
    const added = setPermissions.mock.calls.map(([addKey]) => addKey([]));
    expect(added).toEqual([['getReports'], ['getWeeklySummaries']]);
    expect(onChange).toHaveBeenCalled();
  });
});
