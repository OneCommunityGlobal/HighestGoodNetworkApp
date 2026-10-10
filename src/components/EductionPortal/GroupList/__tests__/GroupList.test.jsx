import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import GroupList from '../GroupList';
import * as service from '~/services/studentGroupsService';

vi.mock('react-redux', () => ({
  useSelector: selector => selector({ theme: { darkMode: false } }),
}));
vi.mock('~/services/studentGroupsService', async () => {
  const actual = await vi.importActual('~/services/studentGroupsService');
  return {
    ...actual,
    getStudents: vi.fn(),
    getGroups: vi.fn(),
    getGroupMembers: vi.fn(),
    createGroup: vi.fn(),
    updateGroup: vi.fn(),
    deleteGroup: vi.fn(),
    addGroupMembers: vi.fn(),
    removeGroupMembers: vi.fn(),
  };
});

const group = { id: 'server-group', name: 'Reading', description: 'Keep this' };
const membership = id => ({ _id: `membership-${id}`, student_id: { _id: id } });
const deferred = () => {
  let resolve;
  const promise = new Promise(done => {
    resolve = done;
  });
  return { promise, resolve };
};

beforeEach(() => {
  vi.resetAllMocks();
  service.getStudents.mockResolvedValue([
    { id: 's1', displayName: 'Alice' },
    { id: 's2', displayName: 'Bob' },
  ]);
  service.getGroups.mockResolvedValue([group]);
  service.getGroupMembers.mockResolvedValue([membership('s1')]);
  service.updateGroup.mockResolvedValue(group);
  service.addGroupMembers.mockResolvedValue({ added: 1 });
  service.removeGroupMembers.mockResolvedValue({ removed: 1 });
  service.deleteGroup.mockResolvedValue(undefined);
});

async function openEdit() {
  render(<GroupList />);
  const edit = await screen.findByRole('button', { name: 'Edit Reading' });
  await waitFor(() => expect(edit).not.toBeDisabled());
  fireEvent.click(edit);
  return screen.getByRole('dialog');
}

async function openNew() {
  service.getGroups.mockResolvedValue([]);
  render(<GroupList />);
  const button = screen.getByRole('button', { name: '+ New Group' });
  await waitFor(() => expect(button).not.toBeDisabled());
  fireEvent.click(button);
  return screen.getByRole('dialog');
}

test('creates with selected IDs, hydrates the server ID, and locks all dismissal paths while pending', async () => {
  const request = deferred();
  service.createGroup.mockReturnValue(request.promise);
  const dialog = await openNew();
  fireEvent.change(within(dialog).getByLabelText('Group name'), {
    target: { value: ' New group ' },
  });
  fireEvent.click(within(dialog).getByLabelText('Bob'));
  const save = within(dialog).getByRole('button', { name: 'Save' });
  fireEvent.click(save);
  fireEvent.click(save);
  expect(service.createGroup).toHaveBeenCalledTimes(1);
  expect(service.createGroup).toHaveBeenCalledWith({ name: 'New group', studentIds: ['s2'] });
  expect(save).toBeDisabled();
  expect(within(dialog).getByLabelText('Group name')).toBeDisabled();
  expect(within(dialog).getByLabelText('Bob')).toBeDisabled();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Close', exact: true }));
  fireEvent.keyDown(document, { key: 'Escape' });
  fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
  fireEvent.keyDown(screen.getByRole('button', { name: 'Close dialog' }), { key: 'Enter' });
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  service.getGroupMembers.mockResolvedValue([membership('s2')]);
  await act(async () => request.resolve({ id: 'created-id', name: 'New group' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(service.getGroupMembers).toHaveBeenCalledWith('created-id');
  expect(screen.getByRole('button', { name: 'Edit New group' })).not.toBeDisabled();
});

test('edits name and membership differences and preserves description', async () => {
  const dialog = await openEdit();
  fireEvent.change(within(dialog).getByLabelText('Group name'), { target: { value: ' Updated ' } });
  fireEvent.click(within(dialog).getByLabelText('Alice'));
  fireEvent.click(within(dialog).getByLabelText('Bob'));
  service.updateGroup.mockResolvedValue({ ...group, name: 'Updated' });
  service.getGroupMembers.mockResolvedValue([membership('s2')]);
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(service.updateGroup).toHaveBeenCalledWith(group.id, {
    name: 'Updated',
    description: 'Keep this',
  });
  expect(service.addGroupMembers).toHaveBeenCalledWith(group.id, ['s2']);
  expect(service.removeGroupMembers).toHaveBeenCalledWith(group.id, ['s1']);
  expect(screen.getByText('1 students')).toBeInTheDocument();
});

test('skips empty membership differences and permits a group with zero members', async () => {
  service.getGroupMembers.mockResolvedValue([]);
  const dialog = await openEdit();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(service.addGroupMembers).not.toHaveBeenCalled();
  expect(service.removeGroupMembers).not.toHaveBeenCalled();
  expect(screen.getByText('0 students')).toBeInTheDocument();
});

test('delete retains the group until the backend confirms success', async () => {
  const dialog = await openEdit();
  const request = deferred();
  service.deleteGroup.mockReturnValue(request.promise);
  fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
  expect(screen.getByRole('button', { name: 'Edit Reading' })).toBeInTheDocument();
  expect(within(dialog).getByRole('button', { name: 'Delete' })).toBeDisabled();
  await act(async () => request.resolve());
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.queryByRole('button', { name: 'Edit Reading' })).not.toBeInTheDocument();
});

test('delete failure keeps the group and modal', async () => {
  service.deleteGroup.mockRejectedValue(new Error('Network unavailable'));
  const dialog = await openEdit();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
  expect(await screen.findByText(/Deletion could not be confirmed/)).toBeInTheDocument();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Edit Reading' })).toBeInTheDocument();
});

test('confirmed creation with failed hydration retains the real ID and never creates twice', async () => {
  service.createGroup.mockResolvedValue({ id: 'created-id', name: 'New group' });
  service.getGroupMembers.mockRejectedValue(new Error('Read failed'));
  const dialog = await openNew();
  fireEvent.change(within(dialog).getByLabelText('Group name'), { target: { value: 'New group' } });
  fireEvent.click(within(dialog).getByLabelText('Bob'));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  expect(
    await screen.findByText(/Group created, but its members could not be loaded/),
  ).toBeInTheDocument();
  expect(screen.getByText('Failed to load members.')).toBeInTheDocument();
  expect(screen.queryByText('0 students')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Bob')).toBeChecked();
  service.getGroups.mockResolvedValue([{ id: 'created-id', name: 'New group' }]);
  service.getGroupMembers.mockResolvedValue([membership('s2')]);
  service.updateGroup.mockResolvedValue({ id: 'created-id', name: 'New group' });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(service.createGroup).toHaveBeenCalledTimes(1);
  expect(service.addGroupMembers).not.toHaveBeenCalled();
});

test('partial edit reconciles and retries only outstanding membership differences without resetting the draft', async () => {
  const dialog = await openEdit();
  fireEvent.change(within(dialog).getByLabelText('Group name'), { target: { value: 'Updated' } });
  fireEvent.click(within(dialog).getByLabelText('Alice'));
  fireEvent.click(within(dialog).getByLabelText('Bob'));
  service.updateGroup.mockResolvedValue({ ...group, name: 'Updated' });
  service.removeGroupMembers.mockRejectedValueOnce(new Error('Removal failed'));
  service.getGroups.mockResolvedValue([{ ...group, name: 'Updated' }]);
  service.getGroupMembers.mockResolvedValue([membership('s1'), membership('s2')]);
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  expect(await screen.findByText(/Save did not complete/)).toBeInTheDocument();
  expect(screen.getByLabelText('Group name')).toHaveValue('Updated');
  expect(screen.getByLabelText('Alice')).not.toBeChecked();
  expect(screen.getByLabelText('Bob')).toBeChecked();
  expect(screen.getByText('2 students')).toBeInTheDocument();
  service.getGroupMembers.mockResolvedValue([membership('s2')]);
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(service.addGroupMembers).toHaveBeenCalledTimes(1);
  expect(service.removeGroupMembers).toHaveBeenCalledTimes(2);
});

test('preserves trimming, self-ID exclusion, and whitespace rejection', async () => {
  const dialog = await openEdit();
  const input = within(dialog).getByLabelText('Group name');
  fireEvent.change(input, { target: { value: '   ' } });
  expect(within(dialog).getByRole('button', { name: 'Save' })).toBeDisabled();
  fireEvent.change(input, { target: { value: ' Reading ' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(service.updateGroup).toHaveBeenCalledWith(group.id, {
      name: 'Reading',
      description: 'Keep this',
    }),
  );
});

test('failed reconciliation preserves draft and blocks further writes until membership is known', async () => {
  const dialog = await openEdit();
  fireEvent.click(within(dialog).getByLabelText('Bob'));
  service.addGroupMembers.mockRejectedValue(new Error('Write interrupted'));
  service.getGroupMembers.mockRejectedValue(new Error('Read interrupted'));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  expect(
    await screen.findByText(/Current server data could not be fully confirmed/),
  ).toBeInTheDocument();
  expect(screen.getByText('Failed to load members.')).toBeInTheDocument();
  expect(screen.queryByText('0 students')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Bob')).toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText(/No further changes were sent/)).toBeInTheDocument();
  expect(service.updateGroup).toHaveBeenCalledTimes(1);
  expect(service.addGroupMembers).toHaveBeenCalledTimes(1);
});

test('unconfirmed creation preserves input and prevents repeating POST', async () => {
  service.createGroup.mockRejectedValue(new Error('Connection lost'));
  const dialog = await openNew();
  fireEvent.change(within(dialog).getByLabelText('Group name'), { target: { value: 'Draft' } });
  fireEvent.click(within(dialog).getByLabelText('Bob'));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  expect(await screen.findByText(/Creation could not be confirmed/)).toBeInTheDocument();
  expect(screen.getByLabelText('Group name')).toHaveValue('Draft');
  expect(screen.getByLabelText('Bob')).toBeChecked();
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  expect(service.createGroup).toHaveBeenCalledTimes(1);
});

test('duplicate comparison trims names but remains case-sensitive', async () => {
  service.getGroups.mockResolvedValue([group, { id: 'other', name: 'Other' }]);
  const dialog = await openEdit();
  fireEvent.change(within(dialog).getByLabelText('Group name'), { target: { value: ' Other ' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  expect(screen.getByText('A group with this name already exists.')).toBeInTheDocument();
  expect(service.updateGroup).not.toHaveBeenCalled();
  fireEvent.change(within(dialog).getByLabelText('Group name'), { target: { value: 'other' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(service.updateGroup).toHaveBeenCalledWith(group.id, {
      name: 'other',
      description: 'Keep this',
    }),
  );
});

test('shows resolved member names beneath the full member count', async () => {
  service.getGroupMembers.mockResolvedValue([membership('s1'), membership('s2')]);
  render(<GroupList />);
  expect(await screen.findByLabelText('Group members')).toHaveTextContent('Alice, Bob');
  expect(screen.getByText('2 students')).toBeInTheDocument();
});

test('shows zero count without a names line for successfully loaded empty memberships', async () => {
  service.getGroupMembers.mockResolvedValue([]);
  render(<GroupList />);
  expect(await screen.findByText('0 students')).toBeInTheDocument();
  expect(screen.queryByLabelText('Group members')).not.toBeInTheDocument();
});

test('shows membership loading without a zero count or names until hydration succeeds', async () => {
  const request = deferred();
  service.getGroupMembers.mockReturnValue(request.promise);
  render(<GroupList />);
  expect(await screen.findByText('Loading members…')).toBeInTheDocument();
  expect(screen.queryByText('0 students')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Group members')).not.toBeInTheDocument();
  await act(async () => request.resolve([membership('s1')]));
  expect(await screen.findByLabelText('Group members')).toHaveTextContent('Alice');
});

test('shows membership failure without a zero count or names', async () => {
  service.getGroupMembers.mockRejectedValue(new Error('Read failed'));
  render(<GroupList />);
  expect(await screen.findByText('Failed to load members.')).toBeInTheDocument();
  expect(screen.queryByText('0 students')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Group members')).not.toBeInTheDocument();
});

test('omits unresolved learner IDs without changing the membership count', async () => {
  service.getGroupMembers.mockResolvedValue([membership('missing-id'), membership('s2')]);
  render(<GroupList />);
  expect(await screen.findByLabelText('Group members')).toHaveTextContent(/^Bob$/);
  expect(screen.getByText('2 students')).toBeInTheDocument();
  expect(screen.queryByText(/missing-id/)).not.toBeInTheDocument();
});

test('uncertain create stays blocked across reopening until authoritative refresh succeeds', async () => {
  service.createGroup.mockRejectedValueOnce(new Error('Response lost'));
  await openNew();
  fireEvent.change(screen.getByLabelText('Group name'), { target: { value: 'Draft' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await screen.findByText(/Creation could not be confirmed/);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('button', { name: '+ New Group' }));
  fireEvent.change(screen.getByLabelText('Group name'), { target: { value: 'Draft' } });
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(service.createGroup).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  service.getGroups.mockRejectedValueOnce(new Error('Read failed'));
  fireEvent.click(screen.getByRole('button', { name: 'Refresh groups' }));
  await screen.findByText(/Could not refresh groups/);
  fireEvent.click(screen.getByRole('button', { name: '+ New Group' }));
  fireEvent.change(screen.getByLabelText('Group name'), { target: { value: 'Draft' } });
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  service.getGroups.mockResolvedValue([{ ...group, name: 'Draft' }]);
  fireEvent.click(screen.getByRole('button', { name: 'Refresh groups' }));
  await waitFor(() =>
    expect(screen.queryByRole('button', { name: 'Refresh groups' })).not.toBeInTheDocument(),
  );
  expect(service.createGroup).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: '+ New Group' }));
  fireEvent.change(screen.getByLabelText('Group name'), { target: { value: 'Draft' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByText('A group with this name already exists.')).toBeInTheDocument();
  service.createGroup.mockResolvedValue({ id: 'another', name: 'Another' });
  fireEvent.change(screen.getByLabelText('Group name'), { target: { value: 'Another' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(service.createGroup).toHaveBeenCalledTimes(2);
});

test('partial reconciliation cannot become an edit baseline after closing and reopening', async () => {
  await openEdit();
  service.updateGroup.mockRejectedValueOnce(new Error('Update response lost'));
  service.getGroups.mockRejectedValue(new Error('Information unavailable'));
  service.getGroupMembers.mockResolvedValue([membership('s1'), membership('s2')]);
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await screen.findByText(/Current server data could not be fully confirmed/);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.getByText('2 students')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Edit Reading' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Edit Reading' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh groups' }));
  await screen.findByText(/Could not refresh groups/);
  expect(screen.getByRole('button', { name: 'Edit Reading' })).toBeDisabled();
  service.getGroups.mockResolvedValue([{ ...group, name: 'Server name' }]);
  fireEvent.click(screen.getByRole('button', { name: 'Refresh groups' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Edit Server name' })).not.toBeDisabled(),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Edit Server name' }));
  expect(screen.getByLabelText('Group name')).toHaveValue('Server name');
  expect(screen.getByLabelText('Bob')).toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(service.updateGroup).toHaveBeenLastCalledWith(group.id, {
    name: 'Server name',
    description: 'Keep this',
  });
  expect(service.addGroupMembers).not.toHaveBeenCalled();
  expect(service.removeGroupMembers).not.toHaveBeenCalled();
});
