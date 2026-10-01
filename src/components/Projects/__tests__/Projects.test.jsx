import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Projects from '..';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { rolesMock } from '__tests__/mockStates';

import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';

const mockStore = configureMockStore([thunk]);

const auth = {
  user: {
    permissions: {
      frontPermissions: [],
      backPermissions: [],
    },
    role: 'Manager',
    userid: 'user123',
  },
};

const theme = { darkMode: false };
const infoCollections = { loading: false };

const projects = [
  {
    _id: 'project123',
    isActive: true,
    modifiedDatetime: '2024-06-20T15:57:30.463+00:00',
    projectName: 'Team Calls',
    createdDatetime: '2018-04-19T23:11:22.503+00:00',
    __v: 0,
    category: 'Society',
    isArchived: false,
  },
];

let store;

beforeEach(() => {
  store = mockStore({
    auth: auth,
    theme: theme,
    projectTarget: { projectId: 'project123', projectName: 'project name 1' },
    projectInfoModal: false,
    userProfile: { role: 'Manager' },
    popupEditor: { currPopup: { popupContent: 'project content 1' } },
    infoCollections: infoCollections,
    role: { roles: rolesMock.role.roles },
    projectMembers: { activeMemberCounts: {} },
    allProjects: {
      error: null,
      fetched: true,
      fetching: false,
      projects: [
        {
          category: 'Food',
          inventoryModifiedDatetime: '2025-08-13T16:51:36.975Z',
          isActive: true,
          membersModifiedDatetime: '2025-08-13T16:51:36.975Z',
          modifiedDatetime: '2025-08-13T16:57:40.613Z',
          projectName: 'Name test ',
          _id: '689cc4042da8947a0b085tfs',
        },
      ],
      status: 200,
    },
  });
});

vi.mock('axios');

const mockAxiosSuccess = () => {
  axios.get.mockResolvedValue({
    status: 200,
    data: [],
  });
};

const renderProjects = (customStore = store) =>
  render(
    <MemoryRouter>
      <Provider store={customStore}>
        <Projects />
      </Provider>
    </MemoryRouter>,
  );

const buildTestAuth = frontPermissions => ({
  user: {
    permissions: {
      frontPermissions,
      backPermissions: [],
    },
    role: 'Owner',
    userid: 'user123',
  },
});

const buildTestStore = ({
  authState = auth,
  userProfileRole = 'Manager',
  allProjectsState = { projects: [], status: 'Active', fetching: true, fetched: false },
} = {}) =>
  mockStore({
    auth: authState,
    theme: theme,
    projectTarget: { projectId: 'project123', projectName: 'project name 1' },
    projectInfoModal: false,
    allProjects: allProjectsState,
    userProfile: { role: userProfileRole },
    popupEditor: { currPopup: { popupContent: 'project content 1' } },
    infoCollections: infoCollections,
    role: { roles: rolesMock.role.roles },
  });

describe('Projects component', () => {
  describe('combined search, filters, and sorting', () => {
    const items = [
      { ...projects[0], _id: 'old', projectName: 'Food Old', category: 'Food', inventoryModifiedDatetime: '2025-01-01' },
      { ...projects[0], _id: 'new', projectName: 'Food New', category: 'Food', inventoryModifiedDatetime: '2025-02-01' },
      { ...projects[0], _id: 'inactive', projectName: 'Food Inactive', category: 'Food', isActive: false },
      { ...projects[0], _id: 'energy', projectName: 'Energy', category: 'Energy' },
    ];
    const deferred = () => {
      let resolve;
      const promise = new Promise(done => { resolve = done; });
      return { promise, resolve };
    };
    let searchRequest;
    const makeStore = (overrides = {}) => mockStore({
      ...store.getState(),
      projectMembers: { activeMemberCounts: { old: 3, new: 1 } },
      allProjects: { ...store.getState().allProjects, projects: items, archivedProjects: [], ...overrides },
    });
    const enterSearch = async value => {
      vi.useFakeTimers();
      try {
        fireEvent.change(screen.getByPlaceholderText(/Search by .* Name/), { target: { value } });
        if (value.trim() && screen.getByLabelText('Filter by').value === 'person') {
          expect(screen.getByRole('status', { name: 'Searching projects' })).toBeInTheDocument();
          expect(screen.queryAllByTestId('projects__name--input')).toHaveLength(0);
        }
        await act(async () => { await vi.advanceTimersByTimeAsync(300); });
      } finally {
        vi.useRealTimers();
      }
    };
    const mode = value => fireEvent.change(screen.getByLabelText('Filter by'), { target: { value } });
    const sort = heading => fireEvent.click(within(screen.getByRole('columnheader', { name: heading })).getByRole('button'));
    const select = (heading, value) => {
      const header = within(screen.getByRole('columnheader', { name: heading }));
      fireEvent.click(header.getByRole('button', { name: '' }));
      fireEvent.click(header.getByRole('button', { name: value, exact: true }));
    };
    const expectNames = async names => waitFor(() => {
      expect(screen.queryAllByTestId('projects__name--input').map(cell => cell.textContent)).toEqual(names);
    });
    beforeEach(() => {
      searchRequest = vi.fn().mockResolvedValue({ status: 200, data: { allProjects: ['old', 'new', 'inactive', 'energy', 'archived'] } });
      axios.get.mockImplementation(url => url.includes('/userProfile/projects/')
        ? searchRequest(url)
        : Promise.resolve({ status: 200, data: [] }));
    });

    it.each(['person', 'project'])('combines %s search with filters and inventory sorting in either order', async searchMode => {
      renderProjects(makeStore());
      mode(searchMode);
      await enterSearch(searchMode === 'person' ? '  Alice  ' : '  FOOD  ');
      select('Category', 'Food');
      select('Active', 'Active');
      sort('Inventory');
      await expectNames(['Food New', 'Food Old']);
      if (searchMode === 'person') {
        await waitFor(() => expect(searchRequest).toHaveBeenCalledTimes(1));
        expect(searchRequest.mock.calls[0][0]).toMatch(/\/Alice$/);
      }
      await enterSearch('');
      await expectNames(['Food New', 'Food Old']);
      await enterSearch(searchMode === 'person' ? 'Alice' : 'food');
      await expectNames(['Food New', 'Food Old']);
      await enterSearch('   ');
      await expectNames(['Food New', 'Food Old']);
    });

    it('preserves member counts and does not refetch when controls or archived view change', async () => {
      renderProjects(makeStore({ archivedProjects: [{ ...items[0], _id: 'archived', projectName: 'Archived Food', isArchived: true }] }));
      await enterSearch('Alice');
      await expectNames(['Food Old', 'Food New', 'Food Inactive', 'Energy']);
      select('Category', 'Food');
      select('Active', 'Active');
      sort('Members');
      await expectNames(['Food New', 'Food Old']);
      const oldRow = screen.getByRole('row', { name: /Food Old/ });
      expect(within(oldRow).getByText('3')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Show Archived' }));
      await expectNames(['Archived Food']);
      expect(searchRequest).toHaveBeenCalledTimes(1);
    });

    it('ignores an older request that resolves after the newer request', async () => {
      const first = deferred();
      const second = deferred();
      searchRequest.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
      renderProjects(makeStore());
      await enterSearch('Alice');
      await waitFor(() => expect(searchRequest).toHaveBeenCalledTimes(1));
      await enterSearch('Bob');
      expect(screen.queryAllByTestId('projects__name--input')).toHaveLength(0);
      await waitFor(() => expect(searchRequest).toHaveBeenCalledTimes(2));
      await act(async () => second.resolve({ data: { allProjects: ['new'] } }));
      await expectNames(['Food New']);
      await act(async () => first.resolve({ data: { allProjects: ['old'] } }));
      await expectNames(['Food New']);
    });

    it.each(['clear', 'mode', 'unmount'])('ignores a pending response after %s', async action => {
      const request = deferred();
      searchRequest.mockReturnValueOnce(request.promise);
      const { unmount } = renderProjects(makeStore());
      await enterSearch('Food');
      await waitFor(() => expect(searchRequest).toHaveBeenCalledTimes(1));
      if (action === 'clear') await enterSearch('');
      if (action === 'mode') mode('project');
      if (action === 'unmount') unmount();
      await act(async () => request.resolve({ data: { allProjects: ['energy'] } }));
      if (action === 'clear') await expectNames(['Food Old', 'Food New', 'Food Inactive', 'Energy']);
      if (action === 'mode') await expectNames(['Food Old', 'Food New', 'Food Inactive']);
      if (action === 'unmount') expect(screen.queryByText('Energy')).not.toBeInTheDocument();
    });

    it.each([[], null, { unexpected: true }, 'old'])('handles empty or malformed search IDs: %j', async result => {
      searchRequest.mockResolvedValueOnce({ data: { allProjects: result } });
      renderProjects(makeStore());
      await enterSearch('Nobody');
      await waitFor(() => expect(searchRequest).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(screen.queryByRole('status', { name: 'Searching projects' })).not.toBeInTheDocument());
      await expectNames([]);
    });

    it('handles a failed search without displaying unrelated rows', async () => {
      searchRequest.mockRejectedValueOnce(new Error('Search unavailable'));
      renderProjects(makeStore());
      await enterSearch('Nobody');
      await waitFor(() => expect(searchRequest).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(screen.queryByRole('status', { name: 'Searching projects' })).not.toBeInTheDocument());
      await expectNames([]);
    });

    it('recomputes refreshed records while preserving project search, filters, and sort', async () => {
      const { rerender } = renderProjects(makeStore());
      mode('project');
      await enterSearch('Food');
      select('Category', 'Food');
      select('Active', 'Active');
      sort('Inventory');
      await expectNames(['Food New', 'Food Old']);
      const updated = items.map(item => item._id === 'old' ? { ...item, inventoryModifiedDatetime: '2025-03-01' } : item);
      rerender(<MemoryRouter><Provider store={makeStore({ projects: updated })}><Projects /></Provider></MemoryRouter>);
      await expectNames(['Food Old', 'Food New']);
    });
  });

  describe('inventory sorting', () => {
    const inventoryProjects = [
      { ...projects[0], _id: 'middle', projectName: 'Bravo', category: 'Food', inventoryModifiedDatetime: '2025-06-02T12:00:00Z' },
      { ...projects[0], _id: 'oldest', projectName: 'Charlie', category: 'Food', inventoryModifiedDatetime: '2025-06-01T12:00:00Z' },
      { ...projects[0], _id: 'newest', projectName: 'Alpha', category: 'Energy', inventoryModifiedDatetime: '2025-06-03T12:00:00Z' },
    ];
    const makeInventoryStore = items => mockStore({
      ...store.getState(),
      projectMembers: { activeMemberCounts: { middle: 2, oldest: 3, newest: 1 } },
      allProjects: { ...store.getState().allProjects, projects: items, archivedProjects: [] },
    });
    const clickSort = heading => {
      fireEvent.click(within(screen.getByRole('columnheader', { name: heading })).getByRole('button'));
    };
    const expectOrder = async ids => {
      await waitFor(() => {
        const inventoryLinks = screen.getAllByRole('link').filter(link =>
          link.getAttribute('href').startsWith('/inventory/'),
        );
        expect(inventoryLinks.map(link => link.getAttribute('href'))).toEqual(
          ids.map(id => `/inventory/${id}`),
        );
      });
    };

    beforeEach(mockAxiosSuccess);

    it('cycles newest-first, oldest-first, default without mutating source order', async () => {
      const source = Object.freeze(inventoryProjects.map(project => Object.freeze({ ...project })));
      renderProjects(makeInventoryStore(source));
      clickSort('Inventory');
      await expectOrder(['newest', 'middle', 'oldest']);
      clickSort('Inventory');
      await expectOrder(['oldest', 'middle', 'newest']);
      clickSort('Inventory');
      await expectOrder(['middle', 'oldest', 'newest']);
      clickSort('Inventory');
      await expectOrder(['newest', 'middle', 'oldest']);
      expect(source.map(project => project._id)).toEqual(['middle', 'oldest', 'newest']);
    });

    it.each(['Project Name', 'Members'])('preserves the %s cycle and starts Inventory newest-first', async heading => {
      renderProjects(makeInventoryStore(inventoryProjects));
      clickSort(heading);
      await expectOrder(['newest', 'middle', 'oldest']);
      clickSort(heading);
      await expectOrder(['oldest', 'middle', 'newest']);
      clickSort(heading);
      await expectOrder(['middle', 'oldest', 'newest']);
      clickSort('Inventory');
      await expectOrder(['newest', 'middle', 'oldest']);
    });

    it('keeps unknown dates last and breaks ties by name then ID in both directions', async () => {
      const extra = [
        { _id: 'tie-b', projectName: 'bravo', inventoryModifiedDatetime: '2025-06-02T12:00:00Z' },
        { _id: 'tie-a', projectName: 'Bravo', inventoryModifiedDatetime: '2025-06-02T12:00:00Z' },
        { _id: 'invalid', projectName: 'Zulu', inventoryModifiedDatetime: 'invalid' },
        { _id: 'missing-b', projectName: 'Unknown' },
        { _id: 'missing-a', projectName: 'unknown', inventoryModifiedDatetime: null },
        { _id: 'empty', projectName: 'Empty', inventoryModifiedDatetime: '' },
      ].map(project => ({ ...projects[0], ...project }));
      renderProjects(makeInventoryStore([...extra, ...inventoryProjects]));
      clickSort('Inventory');
      await expectOrder(['newest', 'middle', 'tie-a', 'tie-b', 'oldest', 'empty', 'missing-a', 'missing-b', 'invalid']);
      clickSort('Inventory');
      await expectOrder(['oldest', 'middle', 'tie-a', 'tie-b', 'newest', 'empty', 'missing-a', 'missing-b', 'invalid']);
    });

    it('preserves inventory direction when category and status filters change', async () => {
      renderProjects(makeInventoryStore([
        ...inventoryProjects,
        { ...inventoryProjects[0], _id: 'inactive', isActive: false, inventoryModifiedDatetime: '2025-06-04T12:00:00Z' },
      ]));
      clickSort('Inventory');
      const category = within(screen.getByRole('columnheader', { name: 'Category' }));
      fireEvent.click(category.getByRole('button', { name: '' }));
      fireEvent.click(category.getByRole('button', { name: 'Food', exact: true }));
      await expectOrder(['inactive', 'middle', 'oldest']);
      const status = within(screen.getByRole('columnheader', { name: 'Active' }));
      fireEvent.click(status.getByRole('button', { name: '' }));
      fireEvent.click(status.getByRole('button', { name: 'Active', exact: true }));
      await expectOrder(['middle', 'oldest']);
      clickSort('Inventory');
      await expectOrder(['oldest', 'middle']);
    });

    it('reorders refreshed timestamps without resetting the selected direction', async () => {
      const { rerender } = renderProjects(makeInventoryStore(inventoryProjects));
      clickSort('Inventory');
      await expectOrder(['newest', 'middle', 'oldest']);
      const updated = inventoryProjects.map(project => project._id === 'oldest'
        ? { ...project, inventoryModifiedDatetime: '2025-06-04T12:00:00Z' }
        : project);
      rerender(
        <MemoryRouter>
          <Provider store={makeInventoryStore(updated)}>
            <Projects />
          </Provider>
        </MemoryRouter>,
      );
      await expectOrder(['oldest', 'newest', 'middle']);
      clickSort('Inventory');
      await expectOrder(['middle', 'newest', 'oldest']);
    });
  });

  describe('category and status filtering', () => {
    const filterProjects = [
      { ...projects[0], _id: 'food-active', projectName: 'Zucchini', category: 'Food', isActive: true },
      { ...projects[0], _id: 'food-inactive', projectName: 'Apple', category: 'Food', isActive: false },
      { ...projects[0], _id: 'energy-active', projectName: 'Solar', category: 'Energy', isActive: true },
      { ...projects[0], _id: 'energy-inactive', projectName: 'Battery', category: 'Energy', isActive: false },
    ];

    const renderFilterProjects = (overrides = {}) => {
      mockAxiosSuccess();
      renderProjects(mockStore({
        ...store.getState(),
        allProjects: {
          ...store.getState().allProjects,
          projects: filterProjects,
          archivedProjects: [],
          ...overrides,
        },
      }));
    };

    const selectFilter = (headerName, option) => {
      const header = within(screen.getByRole('columnheader', { name: headerName }));
      fireEvent.click(header.getByRole('button', { name: '' }));
      fireEvent.click(header.getByRole('button', { name: option, exact: true }));
    };

    const expectVisibleProjects = async expectedNames => {
      await waitFor(() => {
        const visibleNames = screen.getAllByRole('row').slice(1).map(row =>
          filterProjects.find(project => within(row).queryByText(project.projectName))?.projectName,
        );
        expect(visibleNames).toEqual(expectedNames);
      });
    };

    it.each([
      ['', '', ['Zucchini', 'Apple', 'Solar', 'Battery']],
      ['Food', '', ['Zucchini', 'Apple']],
      ['', 'Active', ['Zucchini', 'Solar']],
      ['', 'Inactive', ['Apple', 'Battery']],
      ['Food', 'Active', ['Zucchini']],
      ['Food', 'Inactive', ['Apple']],
      ['Housing', 'Active', []],
    ])('filters category "%s" and status "%s"', async (category, status, expected) => {
      renderFilterProjects();
      if (category) selectFilter('Category', category);
      if (status) selectFilter('Active', status);
      await expectVisibleProjects(expected);
      expect(screen.queryByText('ERROR')).not.toBeInTheDocument();
    });

    it.each(['Active', 'Inactive'])('supports selecting %s before category', async status => {
      renderFilterProjects();
      selectFilter('Active', status);
      selectFilter('Category', 'Food');
      await expectVisibleProjects(status === 'Active' ? ['Zucchini'] : ['Apple']);
    });

    it('preserves the remaining filter and sort when clearing filters', async () => {
      renderFilterProjects();
      fireEvent.click(within(screen.getByRole('columnheader', { name: 'Project Name' })).getByRole('button'));
      selectFilter('Category', 'Food');
      await expectVisibleProjects(['Apple', 'Zucchini']);
      selectFilter('Active', 'Inactive');
      await expectVisibleProjects(['Apple']);
      selectFilter('Active', 'Clear filter');
      await expectVisibleProjects(['Apple', 'Zucchini']);
      selectFilter('Active', 'Inactive');
      selectFilter('Category', 'Clear filter');
      await expectVisibleProjects(['Apple', 'Battery']);
      selectFilter('Active', 'Clear filter');
      await expectVisibleProjects(['Apple', 'Battery', 'Solar', 'Zucchini']);
    });

    it('filters only the archived collection in the archived view', async () => {
      renderFilterProjects({
        projects: [{ ...projects[0], projectName: 'Unarchived Food', category: 'Food' }],
        archivedProjects: filterProjects.map(project => ({ ...project, isArchived: true })),
      });
      fireEvent.click(screen.getByRole('button', { name: 'Show Archived' }));
      await expectVisibleProjects(['Zucchini', 'Apple', 'Solar', 'Battery']);
      selectFilter('Category', 'Food');
      selectFilter('Active', 'Inactive');
      await expectVisibleProjects(['Apple']);
      expect(screen.queryByText('Unarchived Food')).not.toBeInTheDocument();
    });
  });

  it('renders without crashing', () => {
    mockAxiosSuccess();
    renderProjects();
  });
  it('check if Projects header displays as expected', () => {
    mockAxiosSuccess();
    renderProjects();
    expect(screen.getAllByText('Projects')[0]).toBeInTheDocument();
  });
  it('check if Project Name header displays as expected', async () => {
    mockAxiosSuccess();
    renderProjects();
    expect(screen.getAllByText('Project Name')[0]).toBeInTheDocument();
  });
  it('check if Category header displays as expected', () => {
    mockAxiosSuccess();
    renderProjects();
    expect(screen.getByText('Category')).toBeInTheDocument();
  });
  it('check if Active header displays as expected', () => {
    mockAxiosSuccess();
    renderProjects();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
  it('check if Members, WBS header displays as expected', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Projects
            projectList={[
              {
                category: 'Food',
                inventoryModifiedDatetime: '2025-08-13T16:51:36.975Z',
                isActive: true,
                membersModifiedDatetime: '2025-08-13T16:51:36.975Z',
                modifiedDatetime: '2025-08-13T16:57:40.613Z',
                projectName: 'Name test ',
                _id: '689cc4042da8947a0b085tfs',
              },
            ]}
          />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('WBS')).toBeInTheDocument();
  });
  it('check if loading elements get displayed when fetched is false', () => {
    mockAxiosSuccess();
    renderProjects();
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('WBS')).toBeInTheDocument();
  });
  it('check if loading spinner is displayed while projects are being fetched', () => {
    mockAxiosSuccess();
    const testStore = buildTestStore();
    renderProjects(testStore);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
  it('check if AddProject does not get displayed when postProject permission is not added', () => {
    mockAxiosSuccess();
    renderProjects();
    expect(screen.queryByText('Add New Project')).not.toBeInTheDocument();
  });
  it('check if AddProject gets displayed when postProject permission is added', () => {
    mockAxiosSuccess();
    const testAuth = buildTestAuth(['postProject', 'deleteProject', 'putProject']);
    const testStore = buildTestStore({ authState: testAuth, userProfileRole: 'Owner' });

    renderProjects(testStore);
    // expect(screen.queryByText('Add new project')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add new project/i })).toBeInTheDocument();
  });
  it('check if modal title is not set to error when the fetch status is 200', () => {
    mockAxiosSuccess();
    renderProjects();
    expect(screen.queryByText('ERROR')).not.toBeInTheDocument();
  });
  it('check if modal title is not set to error when modal is open', () => {
    mockAxiosSuccess();
    const testAuth = buildTestAuth(['postProject', 'deleteProject', 'putProject', 'deleteProject']);
    const testStore = buildTestStore({
      authState: testAuth,
      userProfileRole: 'Owner',
      allProjectsState: { projects: projects, status: 'Active', fetching: true, fetched: false },
    });

    const { container } = renderProjects(testStore);
    expect(screen.getByText('ERROR')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const ascendingButton = container.querySelector('[id="Ascending"]');
    if (ascendingButton) {
      fireEvent.click(ascendingButton);
    }

    // Code related to "Archive" functionality is refactored into Project component and will be tested in Project.test.js
    //   const archiveButton=screen.getAllByText('Archive')[1]
    //   fireEvent.click(archiveButton)

    //   expect(screen.getByText('Confirm Archive')).toBeInTheDocument();
    //   expect(screen.getByText(`Do you want to archive ${projects[0].projectName}?`)).toBeInTheDocument();

    //   const closeButton=screen.getByText('Close')
    //   fireEvent.click(closeButton)
    //   expect(screen.queryByText('Confirm Archive')).not.toBeInTheDocument();
  });

  it('searches archived projects while the archived view is open', async () => {
    axios.get.mockResolvedValue({ status: 200, data: [] });
    const activeProject = { ...projects[0], _id: 'active-project', projectName: 'Active Alpha' };
    const archivedProject = {
      ...projects[0],
      _id: 'archived-project',
      projectName: 'Archived Alpha',
      isArchived: true,
    };
    const archivedStore = buildTestStore({
      allProjectsState: {
        projects: [activeProject],
        archivedProjects: [archivedProject],
        status: 200,
        fetching: false,
        fetched: true,
      },
    });

    renderProjects(archivedStore);

    fireEvent.click(screen.getByRole('button', { name: 'Show Archived' }));
    fireEvent.change(screen.getByLabelText('Filter by'), { target: { value: 'project' } });
    fireEvent.change(screen.getByPlaceholderText('Search by Project Name'), {
      target: { value: 'Archived Alpha' },
    });

    // The search input is debounced, so poll until the filtered list settles rather
    // than sleeping for a hardcoded interval.
    await waitFor(() => {
      expect(screen.getByText('Archived Alpha')).toBeInTheDocument();
    });

    expect(screen.queryByText('Active Alpha')).not.toBeInTheDocument();
  });

  it('does not use the light Bootstrap button treatment in dark mode', () => {
    axios.get.mockResolvedValue({ status: 200, data: [] });
    const darkStore = mockStore({
      ...store.getState(),
      theme: { darkMode: true },
    });

    renderProjects(darkStore);

    expect(screen.getByRole('button', { name: 'Show Archived' })).not.toHaveClass(
      'btn-outline-light',
    );
  });
});
