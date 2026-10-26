import React from 'react';
import { toast } from 'react-toastify';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AnnouncementModal from '../AnnouncementModal';
import AnnouncementsPage from '../AnnouncementsPage';
import * as service from '~/services/announcementService';
import { getGroups } from '~/services/studentGroupsService';

let authUser;
vi.mock('react-redux', () => ({
  useSelector: selector => selector({ auth: { user: authUser }, theme: { darkMode: false } }),
}));
vi.mock('~/services/studentGroupsService', () => ({ getGroups: vi.fn() }));
vi.mock('~/services/announcementService', async () => {
  const actual = await vi.importActual('~/services/announcementService');
  return {
    ...actual,
    getStudentAnnouncements: vi.fn(),
    getEducatorAnnouncements: vi.fn(),
    createAnnouncement: vi.fn(),
    updateAnnouncement: vi.fn(),
  };
});
vi.mock('~/services/httpService', () => ({ default: {} }));
const doc = (id, audience = 'all') => ({
  _id: id,
  title: `Title ${id}`,
  body: 'Message content',
  audience,
  user_id: 'owner',
  created_at: '2026-01-01T00:00:00Z',
  creatorInfo: { firstName: 'Ada', lastName: 'Lovelace' },
});
const page = data => ({ data, pagination: { totalPages: 1 } });
const edit = { id: 'a1', title: 'Title', body: 'Message', audience: 'students', groupId: 'g1' };

beforeEach(() => {
  vi.clearAllMocks();
  authUser = { _id: 'owner', role: 'Owner' };
  getGroups.mockResolvedValue([
    { id: 'g1', name: 'Readers' },
    { id: 'g2', name: 'Writers' },
  ]);
  service.getStudentAnnouncements.mockResolvedValue(page([]));
  service.getEducatorAnnouncements.mockResolvedValue(page([]));
});

function fill() {
  fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: 'New title' } });
  fireEvent.change(screen.getByLabelText(/Message/), { target: { value: 'New message' } });
}

test('normalizes backend names, IDs, dates and targeting centrally', () => {
  expect(service.normalizeAnnouncement({ ...doc('a1'), groupId: 'g1' })).toMatchObject({
    id: 'a1',
    author: 'Ada Lovelace',
    groupId: 'g1',
    createdAt: '2026-01-01T00:00:00Z',
  });
});
test('loads all pages for existing client-side filtering', async () => {
  const getPage = vi
    .fn()
    .mockResolvedValueOnce({ data: [doc('a1')], pagination: { totalPages: 2 } })
    .mockResolvedValueOnce(page([doc('a2')]));
  expect(await service.loadAnnouncementFeed(getPage)).toHaveLength(2);
  expect(getPage).toHaveBeenLastCalledWith({ page: 2, limit: 100 });
});
test('student page loads API data and ignores stored/sample announcements', async () => {
  authUser = { _id: 'student', role: 'student' };
  localStorage.setItem('edu_announcements', JSON.stringify([{ title: 'Old local title' }]));
  service.getStudentAnnouncements.mockResolvedValue(page([doc('student-feed')]));
  render(<AnnouncementsPage />);
  expect(await screen.findByText('Title student-feed')).toBeInTheDocument();
  expect(screen.queryByText('Old local title')).not.toBeInTheDocument();
  expect(service.getEducatorAnnouncements).not.toHaveBeenCalled();
});
test('educator page combines authored and Everyone records without duplicates', async () => {
  service.getStudentAnnouncements.mockResolvedValue(
    page([doc('own'), doc('public'), doc('student-only', 'students')]),
  );
  service.getEducatorAnnouncements.mockResolvedValue(page([doc('own')]));
  render(<AnnouncementsPage />);
  expect(await screen.findByText('Title public')).toBeInTheDocument();
  expect(screen.getAllByText('Title own')).toHaveLength(1);
  expect(screen.queryByText('Title student-only')).not.toBeInTheDocument();
});
test('load failure offers retry rather than sample fallback', async () => {
  service.getStudentAnnouncements.mockRejectedValueOnce(new Error('offline'));
  render(<AnnouncementsPage />);
  await screen.findByText(/Could not load announcements/);
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('No announcements found')).toBeInTheDocument();
});
test('creates Everyone through the API and displays the saved document', async () => {
  service.createAnnouncement.mockResolvedValue({ data: doc('saved') });
  render(<AnnouncementsPage />);
  await screen.findByText('No announcements found');
  fireEvent.click(screen.getByRole('button', { name: '+ Create Announcement' }));
  fill();
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  await waitFor(() =>
    expect(service.createAnnouncement).toHaveBeenCalledWith({
      title: 'New title',
      body: 'New message',
      audience: 'all',
    }),
  );
  expect(await screen.findByText('Title saved')).toBeInTheDocument();
  expect(toast.success).toHaveBeenCalledWith('Announcement created successfully.');
});
test.each(['', 'g2'])(
  'creates broad or group Students Only without member IDs: %s',
  async groupId => {
    const onSave = vi.fn().mockResolvedValue();
    render(<AnnouncementModal isOpen toggle={vi.fn()} onSave={onSave} />);
    fill();
    fireEvent.change(screen.getByLabelText(/Audience/), { target: { value: 'students' } });
    await screen.findByRole('option', { name: 'Writers' });
    fireEvent.change(screen.getByLabelText('Student Group (optional)'), {
      target: { value: groupId },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        title: 'New title',
        body: 'New message',
        audience: 'students',
        ...(groupId ? { groupId } : {}),
      }),
    );
  },
);
test.each(['g1', 'g2', ''])('edit preserves or explicitly changes targeting: %s', async groupId => {
  const onSave = vi.fn().mockResolvedValue();
  render(<AnnouncementModal isOpen announcement={edit} toggle={vi.fn()} onSave={onSave} />);
  await screen.findByRole('option', { name: 'Writers' });
  fireEvent.change(screen.getByLabelText('Student Group (optional)'), {
    target: { value: groupId },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Update' }));
  await waitFor(() =>
    expect(onSave).toHaveBeenCalledWith({
      title: 'Title',
      body: 'Message',
      audience: 'students',
      ...(groupId === 'g1' ? {} : { groupId: groupId || null }),
    }),
  );
});
test('changing targeted audience to Everyone explicitly clears targeting', async () => {
  const onSave = vi.fn().mockResolvedValue();
  render(<AnnouncementModal isOpen announcement={edit} toggle={vi.fn()} onSave={onSave} />);
  fireEvent.change(screen.getByLabelText(/Audience/), { target: { value: 'all' } });
  fireEvent.click(screen.getByRole('button', { name: 'Update' }));
  await waitFor(() =>
    expect(onSave).toHaveBeenCalledWith({
      title: 'Title',
      body: 'Message',
      audience: 'all',
      groupId: null,
    }),
  );
});
test('group loading failure retries and an empty list still permits broad students', async () => {
  getGroups.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([]);
  render(<AnnouncementModal isOpen announcement={edit} toggle={vi.fn()} onSave={vi.fn()} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Retry groups' }));
  expect(await screen.findByText(/No Student Groups available/)).toBeInTheDocument();
});
test('API validation failure preserves draft and permits corrected retry', async () => {
  const onSave = vi
    .fn()
    .mockRejectedValueOnce({ response: { data: { error: 'Group has no valid student members' } } })
    .mockResolvedValueOnce();
  const toggle = vi.fn();
  render(<AnnouncementModal isOpen announcement={edit} toggle={toggle} onSave={onSave} />);
  fireEvent.click(screen.getByRole('button', { name: 'Update' }));
  expect(await screen.findByText('Group has no valid student members')).toBeInTheDocument();
  expect(screen.getByDisplayValue('Title')).toBeInTheDocument();
  expect(toggle).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Update' }));
  await waitFor(() => expect(toggle).toHaveBeenCalledTimes(1));
});
test('group-only changes trigger discard confirmation', async () => {
  render(<AnnouncementModal isOpen announcement={edit} toggle={vi.fn()} onSave={vi.fn()} />);
  await screen.findByRole('option', { name: 'Writers' });
  fireEvent.change(screen.getByLabelText('Student Group (optional)'), { target: { value: 'g2' } });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(await screen.findByText('Unsaved Changes')).toBeInTheDocument();
});

test('search filters API records and only authored records can be edited through the API', async () => {
  service.getStudentAnnouncements.mockResolvedValue(page([doc('public')]));
  service.getEducatorAnnouncements.mockResolvedValue(page([doc('own')]));
  service.updateAnnouncement.mockResolvedValue({ data: { ...doc('own'), title: 'Updated title' } });
  render(<AnnouncementsPage />);
  await screen.findByText('Title own');
  expect(screen.queryByRole('button', { name: 'Edit Title public' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText('Search Announcements...'), {
    target: { value: 'own' },
  });
  expect(screen.queryByText('Title public')).not.toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText('Search Announcements...'), {
    target: { value: '' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Edit Title own' }));
  fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: 'Updated title' } });
  fireEvent.click(screen.getByRole('button', { name: 'Update' }));
  await waitFor(() =>
    expect(service.updateAnnouncement).toHaveBeenCalledWith('own', {
      title: 'Updated title',
      body: 'Message content',
      audience: 'all',
    }),
  );
  expect(await screen.findByText('Updated title')).toBeInTheDocument();
  expect(toast.success).toHaveBeenCalledWith('Announcement updated successfully.');
});

test('pending save blocks duplicate submission and closing', async () => {
  let resolve;
  const onSave = vi.fn().mockReturnValue(
    new Promise(done => {
      resolve = done;
    }),
  );
  const toggle = vi.fn();
  render(<AnnouncementModal isOpen announcement={edit} toggle={toggle} onSave={onSave} />);
  fireEvent.click(screen.getByRole('button', { name: 'Update' }));
  expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: /close/i }));
  expect(toggle).not.toHaveBeenCalled();
  expect(onSave).toHaveBeenCalledTimes(1);
  resolve();
  await waitFor(() => expect(toggle).toHaveBeenCalledTimes(1));
});

test('API group and creator hydrate the card and edit without resending targeting', async () => {
  service.getEducatorAnnouncements.mockResolvedValue(
    page([{ ...doc('targeted', 'students'), groupId: 'g1' }]),
  );
  service.updateAnnouncement.mockResolvedValue({
    data: { ...doc('targeted', 'students'), groupId: 'g1' },
  });
  render(<AnnouncementsPage />);
  await screen.findByText('Title targeted');
  expect(screen.getByText(/Ada Lovelace/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Edit Title targeted' }));
  await screen.findByRole('option', { name: 'Readers' });
  expect(screen.getByLabelText('Student Group (optional)')).toHaveValue('g1');
  fireEvent.click(screen.getByRole('button', { name: 'Update' }));
  await waitFor(() =>
    expect(service.updateAnnouncement).toHaveBeenCalledWith('targeted', {
      title: 'Title targeted',
      body: 'Message content',
      audience: 'students',
    }),
  );
});

test('failed API create does not show a success toast', async () => {
  service.createAnnouncement.mockRejectedValue({
    response: { status: 400, data: { error: 'Invalid group' } },
  });
  render(<AnnouncementsPage />);
  await screen.findByText('No announcements found');
  fireEvent.click(screen.getByRole('button', { name: '+ Create Announcement' }));
  fill();
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  await screen.findByText('Invalid group');
  expect(toast.success).not.toHaveBeenCalled();
});
