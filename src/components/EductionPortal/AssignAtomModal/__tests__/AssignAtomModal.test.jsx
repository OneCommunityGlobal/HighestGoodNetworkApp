import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({ toast: { success: vi.fn() } }));
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AssignAtomModal } from '../AssignAtomModal';
import httpService from '~/services/httpService';
import { getGroups, getGroupMembers } from '~/services/studentGroupsService';
import { assignGroupAtoms, classifyAssignmentError } from '~/services/atomAssignmentService';

vi.mock('axios', () => ({ default: { get: vi.fn().mockResolvedValue({ data: [] }) } }));
vi.mock('~/services/httpService', () => ({ default: { post: vi.fn() } }));
vi.mock('~/services/studentGroupsService', () => ({
  getGroups: vi.fn(),
  getGroupMembers: vi.fn(),
  normalizeMemberIds: rows => rows.map(row => row.student_id._id),
}));

test('individual search shows no-match feedback only for a non-empty search term', async () => {
  axios.get.mockResolvedValueOnce({
    data: [{ _id: 'learner-1', firstName: 'Alice', lastName: 'Smith', isActive: true }],
  });
  render(<AssignAtomModal {...props()} studentId={null} studentName={null} />);
  const search = screen.getByPlaceholderText('Search for a student...');
  fireEvent.focus(search);
  await waitFor(() => expect(screen.queryByText('Loading users...')).not.toBeInTheDocument());
  expect(screen.queryByText('No users found')).not.toBeInTheDocument();
  fireEvent.change(search, { target: { value: '   ' } });
  expect(screen.queryByText('No users found')).not.toBeInTheDocument();
  fireEvent.change(search, { target: { value: 'Alice' } });
  expect(await screen.findByRole('button', { name: 'Alice Smith' })).toBeInTheDocument();
  expect(screen.queryByText('No users found')).not.toBeInTheDocument();
  fireEvent.change(search, { target: { value: 'Nobody' } });
  expect(screen.getByText('No users found')).toBeInTheDocument();
  fireEvent.change(search, { target: { value: '' } });
  expect(screen.queryByText('No users found')).not.toBeInTheDocument();
});

const props = () => ({
  isModalOpen: true,
  studentId: 'individual',
  studentName: 'Individual Learner',
  availableAtoms: [{ _id: 'a1', name: 'Atom One' }],
  selectedAtoms: ['a1'],
  note: 'Same note',
  isLoadingAtoms: false,
  isSubmitting: false,
  submitError: null,
  darkMode: false,
  fetchAvailableAtoms: vi.fn(),
  assignAtoms: vi.fn().mockResolvedValue({}),
  selectAtom: vi.fn(),
  deselectAtom: vi.fn(),
  setNote: vi.fn(),
  hideModal: vi.fn(),
  clearForm: vi.fn(),
});
const members = ids => ids.map(id => ({ student_id: { _id: id } }));
const assigned = { data: { successfulAssignments: [{ atomId: { _id: 'a1' } }] } };

beforeEach(() => {
  vi.clearAllMocks();
  getGroups.mockResolvedValue([{ id: 'g1', name: 'Readers' }]);
  getGroupMembers.mockResolvedValue(members(['s1', 's2', 's1']));
  httpService.post.mockReset().mockResolvedValue(assigned);
});

test('generic 400 responses and incomplete successes are never counted as assigned', async () => {
  expect(
    classifyAssignmentError({ response: { status: 400, data: { error: 'Duplicate key' } } }, [
      'a1',
    ]),
  ).toBe('unconfirmed');
  httpService.post.mockResolvedValueOnce({ data: { message: 'Unexpected response' } });
  expect(await assignGroupAtoms(['s1'], ['a1'], '', new Map())).toEqual([
    { studentId: 's1', status: 'unconfirmed' },
  ]);
});

test('overlapping selections never replay previously attempted student/atom pairs', async () => {
  const ledger = new Map();
  httpService.post.mockRejectedValueOnce(new Error('Response lost'));
  await assignGroupAtoms(['s1'], ['a1'], 'Original note', ledger);
  httpService.post.mockResolvedValueOnce({
    data: { successfulAssignments: [{ atomId: { _id: 'a2' } }] },
  });
  const result = await assignGroupAtoms(['s1'], ['a1', 'a2'], 'Changed note', ledger);
  expect(httpService.post).toHaveBeenLastCalledWith(
    expect.any(String),
    { studentId: 's1', atomTypes: ['a2'], note: 'Changed note' },
    { skipGlobalErrorToast: true },
  );
  expect(result).toEqual([{ studentId: 's1', status: 'unconfirmed' }]);
});

test('group list failure is visible and blocks submission', async () => {
  getGroups.mockRejectedValueOnce(new Error('Read failed'));
  render(<AssignAtomModal {...props()} />);
  fireEvent.change(screen.getByLabelText('Assign to:'), { target: { value: 'group' } });
  await screen.findByText(/Could not load groups/);
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expect(httpService.post).not.toHaveBeenCalled();
});

test('switching groups ignores an older membership response', async () => {
  getGroups.mockResolvedValue([
    { id: 'g1', name: 'Readers' },
    { id: 'g2', name: 'Writers' },
  ]);
  let resolve;
  getGroupMembers.mockReturnValueOnce(
    new Promise(done => {
      resolve = done;
    }),
  );
  render(<AssignAtomModal {...props()} />);
  await chooseGroup();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  getGroupMembers.mockResolvedValueOnce(members(['s3']));
  fireEvent.change(screen.getByLabelText('Student Group:'), { target: { value: 'g2' } });
  await screen.findByText('1 group members');
  await act(async () => resolve(members(['s1', 's2'])));
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(toast.success).toHaveBeenCalledWith(
      '1 selected atom assigned successfully to 1 student.',
    ),
  );
  expect(httpService.post).toHaveBeenCalledTimes(1);
  expect(httpService.post).toHaveBeenCalledWith(
    expect.any(String),
    { studentId: 's3', atomTypes: ['a1'], note: 'Same note' },
    { skipGlobalErrorToast: true },
  );
});

async function chooseGroup() {
  fireEvent.change(screen.getByLabelText('Assign to:'), { target: { value: 'group' } });
  await screen.findByRole('option', { name: 'Readers' });
  fireEvent.change(screen.getByLabelText('Student Group:'), { target: { value: 'g1' } });
}

test('individual submission still calls the original action and closes the modal', async () => {
  const input = props();
  render(<AssignAtomModal {...input} />);
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(input.hideModal).toHaveBeenCalledTimes(1));
  expect(input.assignAtoms).toHaveBeenCalledWith('individual', ['a1'], 'Same note');
  expect(httpService.post).not.toHaveBeenCalled();
});

test('fully successful group assignment closes with one toast and no recovery panel', async () => {
  const input = props();
  render(<AssignAtomModal {...input} />);
  await chooseGroup();
  await screen.findByText('2 group members');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(input.hideModal).toHaveBeenCalledTimes(1));
  expect(httpService.post).toHaveBeenCalledTimes(2);
  expect(httpService.post).toHaveBeenCalledWith(
    expect.stringContaining('/educator/assign-atoms'),
    { studentId: 's1', atomTypes: ['a1'], note: 'Same note' },
    { skipGlobalErrorToast: true },
  );
  expect(input.assignAtoms).not.toHaveBeenCalled();
  expect(input.clearForm).toHaveBeenCalledTimes(1);
  expect(toast.success).toHaveBeenCalledTimes(1);
  expect(toast.success).toHaveBeenCalledWith(
    '1 selected atom assigned successfully to 2 students.',
  );
  expect(screen.queryByText('Group assignment results')).not.toBeInTheDocument();
  expect(httpService.post).toHaveBeenCalledTimes(2);
});

test('pending group submission locks controls and prevents duplicate submissions and dismissal', async () => {
  let resolve;
  httpService.post.mockReturnValueOnce(
    new Promise(done => {
      resolve = done;
    }),
  );
  const input = props();
  render(<AssignAtomModal {...input} />);
  await chooseGroup();
  await screen.findByText('2 group members');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(screen.getByRole('button', { name: /Submitting/ })).toBeDisabled();
  expect(screen.getByLabelText('Assign to:')).toBeDisabled();
  expect(screen.getByRole('checkbox')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: /close/i }));
  expect(input.hideModal).not.toHaveBeenCalled();
  await act(async () => resolve(assigned));
  await waitFor(() => expect(input.hideModal).toHaveBeenCalledTimes(1));
  expect(httpService.post).toHaveBeenCalledTimes(2);
});

test('separates already-assigned, failed and uncertain outcomes and retains the draft', async () => {
  getGroupMembers.mockResolvedValue(members(['s1', 's2', 's3']));
  httpService.post
    .mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          error: 'All atoms are already assigned to this student',
          alreadyAssignedAtomIds: ['a1'],
        },
      },
    })
    .mockRejectedValueOnce({ response: { status: 404, data: { error: 'Student not found' } } })
    .mockRejectedValueOnce(new Error('Response lost'));
  const input = props();
  render(<AssignAtomModal {...input} />);
  await chooseGroup();
  await screen.findByText('3 group members');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await screen.findByText(/0 assigned; 1 already assigned; 1 failed; 1 unconfirmed/);
  expect(screen.getByDisplayValue('Same note')).toBeInTheDocument();
  expect(screen.getByRole('checkbox')).toBeChecked();
  expect(input.clearForm).not.toHaveBeenCalled();
  expect(input.hideModal).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await screen.findByText(/1 assigned; 1 already assigned; 0 failed; 1 unconfirmed/);
  expect(httpService.post).toHaveBeenCalledTimes(4);
  expect(httpService.post.mock.calls[3][1].studentId).toBe('s2');
});

test.each(['empty', 'error'])('does not submit for %s memberships', async mode => {
  if (mode === 'empty') getGroupMembers.mockResolvedValue([]);
  else getGroupMembers.mockRejectedValue(new Error('Read failed'));
  render(<AssignAtomModal {...props()} />);
  await chooseGroup();
  await screen.findByText(
    mode === 'empty' ? 'This group has no members to assign.' : /Could not load members/,
  );
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expect(httpService.post).not.toHaveBeenCalled();
});

test('results follow the submitted atoms and note; changing targets does not resend successes', async () => {
  httpService.post
    .mockResolvedValueOnce(assigned)
    .mockRejectedValueOnce(new Error('Response lost'));
  const input = props();
  const { rerender } = render(<AssignAtomModal {...input} />);
  await chooseGroup();
  await screen.findByText('2 group members');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await screen.findByText('Group assignment results');
  fireEvent.change(screen.getByDisplayValue('Same note'), { target: { value: 'New note' } });
  expect(screen.queryByText('Group assignment results')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await screen.findByText(/1 previously assigned/);
  expect(httpService.post).toHaveBeenCalledTimes(2);
  rerender(<AssignAtomModal {...input} selectedAtoms={[]} />);
  expect(screen.queryByText('Group assignment results')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Assign to:'), { target: { value: 'student' } });
  expect(screen.queryByLabelText('Student Group:')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Assign to:'), { target: { value: 'group' } });
  expect(screen.queryByText('Group assignment results')).not.toBeInTheDocument();
});

test('cancel detects group selection, ignores hidden student selection, and resets group UI', async () => {
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
  const input = { ...props(), selectedAtoms: [], note: '' };
  render(<AssignAtomModal {...input} />);
  fireEvent.change(screen.getByLabelText('Assign to:'), { target: { value: 'group' } });
  await screen.findByRole('option', { name: 'Readers' });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(confirm).not.toHaveBeenCalled();
  await chooseGroup();
  await screen.findByText('2 group members');
  confirm.mockReturnValueOnce(false);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.getByLabelText('Student Group:')).toHaveValue('g1');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(confirm).toHaveBeenCalledTimes(2);
  expect(screen.getByLabelText('Assign to:')).toHaveValue('student');
  fireEvent.change(screen.getByLabelText('Assign to:'), { target: { value: 'group' } });
  expect(screen.getByLabelText('Student Group:')).toHaveValue('');
  confirm.mockRestore();
});

test('new flow rechecks confirmed assignments but retains uncertain request protection after cancel', async () => {
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
  httpService.post
    .mockResolvedValueOnce(assigned)
    .mockRejectedValueOnce(new Error('Response lost'));
  render(<AssignAtomModal {...props()} />);
  await chooseGroup();
  await screen.findByText('2 group members');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await screen.findByText(/1 assigned; 0 already assigned; 0 failed; 1 unconfirmed/);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.queryByText('Group assignment results')).not.toBeInTheDocument();
  await chooseGroup();
  await screen.findByText('2 group members');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await screen.findByText(/1 assigned; 0 already assigned; 0 failed; 1 unconfirmed/);
  expect(httpService.post).toHaveBeenCalledTimes(3);
  expect(httpService.post.mock.calls[2][1].studentId).toBe('s1');
  confirm.mockRestore();
});

test.each(['failed', 'unconfirmed', 'already assigned'])(
  'shows only relevant recovery messaging for %s results',
  async outcome => {
    getGroupMembers.mockResolvedValue(members(['s1']));
    if (outcome === 'failed') httpService.post.mockRejectedValue({ response: { status: 403 } });
    else if (outcome === 'unconfirmed')
      httpService.post.mockRejectedValue(new Error('Response lost'));
    else
      httpService.post.mockRejectedValue({
        response: {
          status: 400,
          data: {
            error: 'All atoms are already assigned to this student',
            alreadyAssignedAtomIds: ['a1'],
          },
        },
      });
    const input = props();
    render(<AssignAtomModal {...input} />);
    await chooseGroup();
    await screen.findByText('1 group members');
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByText('Group assignment results');
    expect(input.hideModal).not.toHaveBeenCalled();
    expect(input.clearForm).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue('Same note')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(Boolean(screen.queryByText('Submit again to retry confirmed failures.'))).toBe(
      outcome === 'failed',
    );
    expect(Boolean(screen.queryByText(/Unconfirmed requests are not resent/))).toBe(
      outcome === 'unconfirmed',
    );
    expect(Boolean(screen.queryByText(/Existing or successful assignments are not resent/))).toBe(
      outcome === 'already assigned',
    );
  },
);
