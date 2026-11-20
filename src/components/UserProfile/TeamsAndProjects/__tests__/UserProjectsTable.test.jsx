import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createEvent, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { toast } from 'react-toastify';
import appStyles from '~/App.module.css';
import UserProjectsTable from '../UserProjectsTable';
import styles from '../UserProjectsTable.module.css';

vi.mock('~/utils/permissions', () => ({
  default: () => () => true,
}));

vi.mock('~/components/UserProfile/EditableModal/EditableInfoModal', () => ({
  default: () => null,
}));

const projects = [
  { _id: 'project-1', projectName: 'Project One' },
  { projectId: 'project-2', projectName: 'Project Two' },
];
const firstLink = 'https://example.com/submission-one';
const secondLink = 'https://example.com/submission-two';
const tasks = [
  {
    _id: 'active',
    num: '1',
    taskName: 'Active task',
    status: 'Started',
    projectId: projects[0]._id,
    resources: [
      { userID: 'other-user', completedTask: true },
      { userID: 'profile-user', completedTask: false },
    ],
    links: ['https://example.com/reference'],
  },
  {
    _id: 'resolved',
    num: '2',
    taskName: 'Resolved task',
    status: 'Started',
    projectId: [projects[1].projectId],
    resources: [
      { userID: 'profile-user', completedTask: true, reviewStatus: 'Reviewed' },
      { userID: 'other-user', completedTask: false },
    ],
    relatedWorkLinks: [firstLink],
  },
  {
    _id: 'multiple',
    num: '3',
    taskName: 'Task with multiple links',
    projectId: projects[0]._id,
    resources: [{ userID: 'profile-user' }],
    relatedWorkLinks: [firstLink, secondLink, '', 'javascript:void(0)'],
  },
];

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
const renderTable = (overrides = {}) => {
  const props = {
    userProjectsById: projects,
    userTasks: tasks,
    userId: 'profile-user',
    role: 'Administrator',
    ...overrides,
  };
  return (
    <Provider store={store}>
      <MemoryRouter>
        <UserProjectsTable {...props} />
      </MemoryRouter>
    </Provider>
  );
};

const desktopId = 'userProjectTest';
const tabletId = 'userProjectTabletTest';
const desktop = () => within(screen.getByTestId(desktopId));
const tablet = () => within(screen.getByTestId(tabletId));
const clickFilter = (layoutId, name) =>
  fireEvent.click(within(screen.getByTestId(layoutId)).getByRole('button', { name }));
const taskRow = (layoutId, name) =>
  within(within(screen.getByTestId(layoutId)).getByRole('row', { name }));

const mockPopup = () => ({
  opener: window,
  closed: false,
  location: { replace: vi.fn() },
});

afterEach(() => vi.restoreAllMocks());

describe('Profile project tasks', () => {
  it('filters both layouts by the profiled user’s assignment and labels each status', () => {
    render(renderTable());
    expect(desktop().getByRole('link', { name: /Active task/ })).toHaveAttribute(
      'href',
      '/wbs/tasks/active',
    );
    expect(desktop().queryByText(/Resolved task/)).toBeNull();
    expect(desktop().getByRole('button', { name: 'Active' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    clickFilter(desktopId, 'All');
    [desktopId, tabletId].forEach(layout => {
      expect(taskRow(layout, /Active task/).getByText('Active')).toHaveClass(styles.active);
      expect(taskRow(layout, /Resolved task/).getByText('Resolved')).toHaveClass(styles.resolved);
    });

    clickFilter(tabletId, 'Resolved');
    expect(desktop().getByText(/Resolved task/)).toBeVisible();
    expect(desktop().queryByText(/Active task/)).toBeNull();
    expect(tablet().queryByText(/Task with multiple links/)).toBeNull();

    clickFilter(desktopId, 'Active');
    expect(tablet().getByText(/Active task/)).toBeVisible();
    expect(tablet().queryByText(/Resolved task/)).toBeNull();
  });

  it('keeps the filter on project and task refreshes', () => {
    const { rerender } = render(renderTable());
    clickFilter(desktopId, 'All');
    rerender(
      renderTable({ userProjectsById: [{ ...projects[1], projectName: 'Updated project' }] }),
    );
    expect(desktop().getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    expect(desktop().getByText(/Resolved task/)).toBeVisible();
    expect(desktop().queryByText(/Active task/)).toBeNull();
    rerender(renderTable({ userTasks: [tasks[0]] }));
    expect(desktop().getByText(/Active task/)).toBeVisible();
    expect(desktop().queryByText(/Resolved task/)).toBeNull();
  });

  it('reopens the existing assignment without duplicating it', () => {
    const updateTask = vi.fn();
    render(renderTable({ edit: true, updateTask }));
    clickFilter(desktopId, 'All');
    fireEvent.click(taskRow(desktopId, /Resolved task/).getByRole('button', { name: 'Add' }));
    expect(updateTask).toHaveBeenCalledWith(
      'resolved',
      {
        resources: [
          { userID: 'profile-user', completedTask: false, reviewStatus: 'Unsubmitted' },
          tasks[1].resources[1],
        ],
        status: 'Started',
      },
      'add',
    );
    fireEvent.click(taskRow(desktopId, /Active task/).getByRole('button', { name: 'Delete' }));
    expect(updateTask).toHaveBeenCalledWith('active', undefined, 'remove');
  });

  it('opens a single submitted link in a detached window and preserves native modified clicks', () => {
    const popup = mockPopup();
    const open = vi.spyOn(window, 'open').mockReturnValue(popup);
    render(renderTable());
    clickFilter(desktopId, 'All');

    expect(taskRow(desktopId, /Active task/).queryByRole('link', { name: /submitted/ })).toBeNull();
    const icon = desktop().getByRole('link', { name: /open submitted link for resolved task/i });
    expect(icon).toHaveClass(styles.submittedLinkIcon);
    expect(icon).toHaveAttribute('href', firstLink);
    expect(icon).toHaveAttribute('target', '_blank');
    expect(icon).toHaveAttribute('rel', 'noopener noreferrer');
    fireEvent.click(icon);
    expect(open).toHaveBeenCalledWith('about:blank', '_blank', expect.stringContaining('popup'));
    expect(popup.opener).toBeNull();
    expect(popup.location.replace).toHaveBeenCalledWith(firstLink);

    [{ metaKey: true }, { ctrlKey: true }].forEach(modifier => {
      const event = createEvent.click(icon, modifier);
      fireEvent(icon, event);
      expect(event.defaultPrevented).toBe(false);
    });
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('reports a blocked single popup and leaves its link available', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    const warn = vi.spyOn(toast, 'warn').mockImplementation(() => {});
    render(renderTable());
    clickFilter(desktopId, 'All');
    const icon = desktop().getByRole('link', { name: /open submitted link for resolved task/i });
    fireEvent.click(icon);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Allow pop-ups'));
    expect(icon).toBeVisible();
  });

  it('lists valid links, opens them individually and in bulk, and closes only with Close', async () => {
    const popup = mockPopup();
    const open = vi.spyOn(window, 'open').mockReturnValue(popup);
    render(renderTable({ darkMode: true }));
    const trigger = tablet().getByRole('button', { name: /view submitted links/i });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = await screen.findByRole('dialog', {
      name: /submitted links for task with multiple links/i,
    });
    const modal = within(dialog);
    expect(modal.getAllByRole('link')).toHaveLength(2);
    expect(modal.getByRole('link', { name: secondLink })).toHaveAttribute('href', secondLink);
    fireEvent.click(modal.getByRole('link', { name: firstLink }));
    expect(popup.location.replace).toHaveBeenLastCalledWith(firstLink);
    fireEvent.keyUp(dialog, { key: 'Escape', keyCode: 27 });
    fireEvent.mouseDown(dialog);
    fireEvent.click(dialog);
    expect(dialog).toBeVisible();

    fireEvent.click(modal.getByRole('button', { name: 'Open All' }));
    expect(popup.location.replace.mock.calls).toEqual([[firstLink], [firstLink], [secondLink]]);
    open.mockReturnValueOnce(null);
    fireEvent.click(modal.getByRole('button', { name: 'Open All' }));
    expect(modal.getByRole('status')).toHaveTextContent('1 of 2 windows were blocked');
    expect(dialog).toBeVisible();

    fireEvent.click(modal.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(trigger).toHaveFocus();
  });

  it('uses scoped classes for desktop, tablet and dark mode', () => {
    render(renderTable({ darkMode: true }));
    expect(screen.getByTestId('userProjectTest')).toHaveClass(styles.desktop);
    expect(screen.getByTestId('userProjectTabletTest')).toHaveClass(styles.tablet);
    expect(screen.getByTestId('userProjectTaskTest')).toHaveClass(
      styles.tableContainer,
      appStyles['bg-yinmn-blue'],
    );
  });
});
