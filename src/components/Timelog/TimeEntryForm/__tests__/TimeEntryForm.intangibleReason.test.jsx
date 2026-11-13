import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import {
  authMock,
  userProfileMock,
  userProjectMock,
  rolesMock,
} from '../../../../__tests__/mockStates';
import { renderWithProvider } from '../../../../__tests__/utils';
import TimeEntryForm from '../TimeEntryForm';
import { postTimeEntry } from '../../../../actions/timeEntries';

vi.mock('../../../../actions/timeEntries', async () => {
  const actual = await vi.importActual('../../../../actions/timeEntries');
  return {
    __esModule: true,
    ...actual,
    postTimeEntry: vi.fn(() => ({ type: 'MOCK_POST_TIME_ENTRY' })),
  };
});

vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    __esModule: true,
    ...actual,
    get: vi.fn(url => {
      if (url.includes('/userProjects')) {
        return Promise.resolve({ data: userProjectMock.projects });
      }
      if (url.includes('/tasks')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/userProfile')) {
        return Promise.resolve({ data: userProfileMock });
      }
      return Promise.resolve({ data: [] });
    }),
  };
});

const mockStore = configureMockStore([thunk]);

// Already contains 10+ words and a link so the pre-existing notes/link
// validation in validateForm() is satisfied without needing to drive the
// TinyMCE editor's own word-count plugin from a test.
const VALID_NOTES = 'This is a sufficiently detailed description of completed work today https://example.com';

describe('<TimeEntryForm from="TimeLog" new entry/> Intangible Time reason modal', () => {
  let store;
  let toggle;

  beforeEach(() => {
    vi.clearAllMocks();
    toggle = vi.fn();
    store = mockStore({
      auth: authMock,
      userProjects: {
        ...userProjectMock,
        projects: Array.isArray(userProjectMock.projects) ? userProjectMock.projects : [],
      },
      userProfile: userProfileMock,
      role: rolesMock,
      theme: { darkMode: false },
    });
    store.dispatch = vi.fn();
  });

  const renderForm = (isTangible = false) =>
    renderWithProvider(
      <TimeEntryForm
        from="TimeLog"
        edit={false}
        toggle={toggle}
        isOpen
        data={{ isTangible, personId: authMock.user.userid, notes: VALID_NOTES }}
      />,
      { store },
    );

  const selectProjectAndHours = async () => {
    await screen.findByRole('option', { name: 'Select Project/Task' });
    const select = screen.getByLabelText(/project\/task/i);
    const [project] = userProjectMock.projects;
    await userEvent.selectOptions(select, project.projectId);

    const [hours] = screen.getAllByRole('spinbutton');
    fireEvent.change(hours, { target: { value: '1' } });
  };

  it('shows the INTANGIBLE TIME REASON modal instead of submitting when Tangible is unchecked', async () => {
    renderForm();
    await selectProjectAndHours();

    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    expect(await screen.findByText('INTANGIBLE TIME REASON')).toBeInTheDocument();
    expect(postTimeEntry).not.toHaveBeenCalled();
  });

  it('keeps the modal submit button disabled until the reason has 10+ words', async () => {
    renderForm();
    await selectProjectAndHours();
    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    await screen.findByText('INTANGIBLE TIME REASON');

    const modalSubmit = screen.getByRole('button', {
      name: "I've added all the specifics, submit!",
    });
    expect(modalSubmit).toBeDisabled();

    const reasonInput = screen.getByPlaceholderText('Detailed reason (10-word minimum)');
    fireEvent.change(reasonInput, { target: { value: 'too short' } });
    expect(modalSubmit).toBeDisabled();
  });

  it('appends the reason and date to the bottom of notes and submits once valid', async () => {
    renderForm();
    await selectProjectAndHours();
    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    await screen.findByText('INTANGIBLE TIME REASON');

    const reasonInput = screen.getByPlaceholderText('Detailed reason (10-word minimum)');
    fireEvent.change(reasonInput, {
      target: { value: 'Field work made the timer unusable so I logged this manually' },
    });
    const dateInput = screen.getByLabelText('DATE THIS BELONGS ON:');
    fireEvent.change(dateInput, { target: { value: '2026-01-15' } });

    const modalSubmit = screen.getByRole('button', {
      name: "I've added all the specifics, submit!",
    });
    expect(modalSubmit).not.toBeDisabled();
    await userEvent.click(modalSubmit);

    await waitFor(() => expect(postTimeEntry).toHaveBeenCalled());
    const [submittedEntry] = postTimeEntry.mock.calls[0];
    expect(submittedEntry.notes).toContain(
      'Reason: Field work made the timer unusable so I logged this manually',
    );
    expect(submittedEntry.notes).toContain('Date this belongs on: Thursday, 15/01/26');
  });

  it('returns to the form without submitting when "Whoops, take me back to edit this." is clicked', async () => {
    renderForm();
    await selectProjectAndHours();
    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    await screen.findByText('INTANGIBLE TIME REASON');

    await userEvent.click(screen.getByText('Whoops, take me back to edit this.'));

    await waitFor(() =>
      expect(screen.queryByText('INTANGIBLE TIME REASON')).not.toBeInTheDocument(),
    );
    expect(postTimeEntry).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/project\/task/i)).toBeInTheDocument();
  });

  it('does not show the modal when the entry is already Tangible (checkbox behavior unaffected)', async () => {
    renderForm(true);
    await selectProjectAndHours();

    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    expect(screen.queryByText('INTANGIBLE TIME REASON')).not.toBeInTheDocument();
    await waitFor(() => expect(postTimeEntry).toHaveBeenCalled());
  });
});
