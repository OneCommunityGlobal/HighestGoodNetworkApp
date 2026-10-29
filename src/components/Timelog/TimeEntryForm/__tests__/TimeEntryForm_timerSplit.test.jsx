import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import moment from 'moment-timezone';
import {
  authMock,
  userProfileMock,
  userProjectMock,
  rolesMock,
} from '../../../../__tests__/mockStates';
import { renderWithProvider } from '../../../../__tests__/utils';
import { postTimeEntry } from '../../../../actions/timeEntries';
import TimeEntryForm from '../TimeEntryForm';

vi.mock('../../../../actions/timeEntries', async () => {
  const actual = await vi.importActual('../../../../actions/timeEntries');
  return {
    __esModule: true,
    ...actual,
    postTimeEntry: vi.fn(() => async () => 200),
  };
});

vi.mock('@tinymce/tinymce-react', () => ({
  Editor: ({ onEditorChange }) => (
    <textarea
      aria-label="Work notes"
      onChange={event => {
        const content = event.target.value;
        onEditorChange(content, {
          focus: () => {},
          id: 'notes',
          plugins: { wordcount: { body: { getWordCount: () => content.split(/\s+/).length } } },
        });
      }}
    />
  ),
}));

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

// 10:42 PM PDT on Oct 26 to 3:42 AM PDT on Oct 27
const overnightRuns = [
  { startedAt: '2026-10-27T05:42:00.000Z', endedAt: '2026-10-27T10:42:00.000Z', open: false },
];
const daytimeRuns = [
  { startedAt: '2026-10-27T18:00:00.000Z', endedAt: '2026-10-27T23:00:00.000Z', open: false },
];

describe('<TimeEntryForm from="Timer"/> session that crosses midnight', () => {
  let store;
  let sendStop;

  beforeEach(() => {
    vi.clearAllMocks();
    postTimeEntry.mockImplementation(() => async () => 200);
    sendStop = vi.fn().mockResolvedValue(true);
    store = mockStore({
      auth: authMock,
      userProjects: userProjectMock,
      userProfile: userProfileMock,
      role: rolesMock,
      theme: { darkMode: false },
    });
  });

  const renderForm = (sessionRuns, hours = 5, minutes = 0) =>
    renderWithProvider(
      <TimeEntryForm
        from="Timer"
        edit={false}
        toggle={vi.fn()}
        isOpen
        data={{ hours, minutes }}
        sendStop={sendStop}
        timerConnected
        sessionId="session-1"
        sessionRuns={sessionRuns}
        sessionRunLimitMs={5 * 60 * 60 * 1000}
      />,
      { store },
    );

  const fillAndSubmit = async () => {
    await screen.findByRole('option', { name: userProjectMock.projects[0].projectName });
    await userEvent.selectOptions(
      screen.getByLabelText(/project\/task/i),
      userProjectMock.projects[0].projectId,
    );
    fireEvent.change(screen.getByLabelText('Work notes'), {
      target: {
        value: 'Worked on the weekly summary email and wrote the tests for it today. https://example.org/work',
      },
    });
    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));
  };

  it('tells the user how the session will be split and dates the form by its first day', async () => {
    renderForm(overnightRuns);

    await waitFor(() => {
      expect(screen.getByLabelText('Date')).toHaveValue('2026-10-26');
    });
    expect(screen.getByTestId('split-notice')).toHaveTextContent(
      'This session ran past midnight, so it will be logged as 2 entries: Oct 26 1h 18m, Oct 27 3h 42m.',
    );
  });

  it('dates a session inside one day by when it ran, with no split notice', async () => {
    renderForm(daytimeRuns);

    await waitFor(() => {
      expect(screen.getByLabelText('Date')).toHaveValue('2026-10-27');
    });
    expect(screen.queryByTestId('split-notice')).not.toBeInTheDocument();
  });

  it('keeps today as the date when the timer sent no runs', async () => {
    renderForm(undefined);

    const today = moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD');
    await waitFor(() => {
      expect(screen.getByLabelText('Date')).toHaveValue(today);
    });
    expect(screen.queryByTestId('split-notice')).not.toBeInTheDocument();
  });

  it('logs one entry per day and stops the timer once', async () => {
    renderForm(overnightRuns);
    await fillAndSubmit();

    await waitFor(() => expect(postTimeEntry).toHaveBeenCalledTimes(2));
    const [first, second] = postTimeEntry.mock.calls.map(call => call[0]);
    expect(first).toMatchObject({ dateOfWork: '2026-10-26', hours: 1, minutes: 18 });
    expect(second).toMatchObject({ dateOfWork: '2026-10-27', hours: 3, minutes: 42 });
    expect(first.notes).toContain('Part 1 of 2 (Oct 26)');
    expect(second.notes).toContain('Part 2 of 2 (Oct 27)');
    expect(first.notes).toContain('Worked on the weekly summary email');
    await waitFor(() => expect(sendStop).toHaveBeenCalledTimes(1));
  });

  it('logs a session inside one day as a single entry on the day it ran', async () => {
    renderForm(daytimeRuns);
    await fillAndSubmit();

    await waitFor(() => expect(postTimeEntry).toHaveBeenCalledTimes(1));
    expect(postTimeEntry.mock.calls[0][0]).toMatchObject({
      dateOfWork: '2026-10-27',
      hours: 5,
      minutes: 0,
    });
    expect(postTimeEntry.mock.calls[0][0].notes).not.toContain('Part 1');
  });

  it('does not stop the timer or repeat a logged day when a later day fails', async () => {
    postTimeEntry
      .mockImplementationOnce(() => async () => 200)
      .mockImplementationOnce(() => async () => 500);
    renderForm([
      { startedAt: '2026-10-27T05:42:00.000Z', endedAt: '2026-10-27T10:42:00.001Z', open: false },
    ]);
    await fillAndSubmit();

    await waitFor(() => expect(postTimeEntry).toHaveBeenCalledTimes(2));
    expect(sendStop).not.toHaveBeenCalled();

    postTimeEntry.mockImplementation(() => async () => 200);
    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => expect(postTimeEntry).toHaveBeenCalledTimes(3));
    expect(postTimeEntry.mock.calls[2][0]).toMatchObject({ dateOfWork: '2026-10-27' });
    await waitFor(() => expect(sendStop).toHaveBeenCalledTimes(1));
  });
});
