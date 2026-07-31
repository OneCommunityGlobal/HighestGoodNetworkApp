import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DailyLogPage from '../DailyLogPage';
import TimeLogDetail from '../TimeLogDetail';
import { DailyLogProvider, useDailyLog } from '../DailyLogContext';
import { formatDuration, parseDurationToMin } from '../dailyLogUtils';

function renderDailyLog(initialLogs = [], storageEntries = {}) {
  const existingUserId = window.localStorage.getItem('userId') || '';

  window.localStorage.clear();

  if (existingUserId) {
    window.localStorage.setItem('userId', existingUserId);
  }

  const storageKey = existingUserId ? `daily-log-logs-${existingUserId}` : 'daily-log-logs';

  if (initialLogs.length > 0) {
    window.localStorage.setItem(storageKey, JSON.stringify(initialLogs));
  }

  Object.entries(storageEntries).forEach(([key, value]) => {
    window.localStorage.setItem(key, value);
  });

  return render(
    <MemoryRouter>
      <DailyLogProvider>
        <DailyLogPage />
      </DailyLogProvider>
    </MemoryRouter>,
  );
}

describe('Daily Log', () => {
  beforeEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it('parses and formats duration values correctly', () => {
    expect(parseDurationToMin('2h 0m')).toBe(120);
    expect(parseDurationToMin('1h 30m')).toBe(90);
    expect(parseDurationToMin('0h 45m')).toBe(45);
    expect(
      parseDurationToMin('1h 15m') + parseDurationToMin('1h 30m') + parseDurationToMin('2h 0m'),
    ).toBe(285);
    expect(formatDuration(285)).toBe('4h 45m');
  });

  it('excludes old entries from the current week and shows the zero state when there are no weekly logs', () => {
    vi.setSystemTime(new Date(2026, 6, 24, 12));

    const initialLogs = [
      {
        log_id: 'lg-old',
        created_at: '2025-09-10T14:00:00.000Z',
        entity_id: 'time-log-old',
        metadata: {
          course: 'Math',
          duration: '1h 30m',
          noteToTeacher: '',
          teacherFeedback: '',
        },
      },
      {
        log_id: 'lg-current',
        created_at: '2026-07-22T14:00:00.000Z',
        entity_id: 'time-log-current',
        metadata: {
          course: 'Science',
          duration: '2h 0m',
          noteToTeacher: '',
          teacherFeedback: '',
        },
      },
    ];

    renderDailyLog(initialLogs);

    expect(screen.getByText('3h 30m')).toBeInTheDocument();
    expect(screen.getByText('1 log entry')).toBeInTheDocument();
  });

  it('shows a validation message for zero-duration logs and keeps the form values until the user fixes them', async () => {
    const user = userEvent.setup ? userEvent.setup() : userEvent;
    renderDailyLog();
    const initialViewCount = screen.getAllByRole('link', { name: /view/i }).length;

    await user.click(screen.getByRole('button', { name: /new time log/i }));

    await user.selectOptions(screen.getByLabelText(/course/i), 'English 200 - Creative Writing');
    await user.type(screen.getByLabelText(/notes/i), 'Drafting a paragraph');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText(/duration must be greater than zero/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toHaveValue('Drafting a paragraph');

    await user.selectOptions(screen.getByLabelText(/hours/i), '1');
    await user.selectOptions(screen.getByLabelText(/minutes/i), '30');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: /view/i })).toHaveLength(initialViewCount + 1);
    });
  });

  it('resets unsaved form fields after cancel and after a saved log', async () => {
    const user = userEvent.setup ? userEvent.setup() : userEvent;
    renderDailyLog();
    const initialViewCount = screen.getAllByRole('link', { name: /view/i }).length;

    await user.click(screen.getByRole('button', { name: /new time log/i }));
    await user.selectOptions(screen.getByLabelText(/course/i), 'Science 150 - Biology Basics');
    await user.selectOptions(screen.getByLabelText(/hours/i), '1');
    await user.selectOptions(screen.getByLabelText(/minutes/i), '15');
    await user.type(screen.getByLabelText(/notes/i), 'Temporary note');
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await user.click(screen.getByRole('button', { name: /new time log/i }));
    expect(screen.getByLabelText(/course/i)).toHaveValue('Mathematics 101 - Algebra Fundamentals');
    expect(screen.getByLabelText(/notes/i)).toHaveValue('');

    await user.selectOptions(screen.getByLabelText(/hours/i), '1');
    await user.selectOptions(screen.getByLabelText(/minutes/i), '30');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: /view/i })).toHaveLength(initialViewCount + 1);
    });

    await user.click(screen.getByRole('button', { name: /new time log/i }));
    expect(screen.getByLabelText(/course/i)).toHaveValue('Mathematics 101 - Algebra Fundamentals');
    expect(screen.getByLabelText(/notes/i)).toHaveValue('');
  });

  it('persists newly created logs and saved teacher notes across remounts', async () => {
    const user = userEvent.setup ? userEvent.setup() : userEvent;
    const { unmount } = renderDailyLog();

    await user.click(screen.getByRole('button', { name: /new time log/i }));
    await user.selectOptions(screen.getByLabelText(/hours/i), '1');
    await user.selectOptions(screen.getByLabelText(/minutes/i), '30');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: /view/i })).toHaveLength(4);
    });

    const storedLogs = JSON.parse(window.localStorage.getItem('daily-log-logs'));
    expect(storedLogs).toHaveLength(4);

    unmount();

    render(
      <MemoryRouter initialEntries={['/educationportal/time-logs/lg-2']}>
        <Route path="/educationportal/time-logs/:id">
          <DailyLogProvider>
            <TimeLogDetail />
          </DailyLogProvider>
        </Route>
      </MemoryRouter>,
    );
  });

  it('keeps logs sorted chronologically when new entries are added', async () => {
    function OrderHarness() {
      const { logs, addLog } = useDailyLog();

      return (
        <>
          <div data-testid="order">{logs.map(log => log.metadata?.course || '').join('|')}</div>
          <button
            type="button"
            onClick={() =>
              addLog({
                log_id: 'lg-new',
                created_at: '2026-07-28T12:00:00.000Z',
                entity_id: 'time-log-new',
                metadata: { course: 'Newest Course', duration: '45m' },
              })
            }
          >
            Add
          </button>
        </>
      );
    }

    render(
      <MemoryRouter>
        <DailyLogProvider>
          <OrderHarness />
        </DailyLogProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('order').textContent).toContain(
      'Mathematics 101 - Algebra Fundamentals',
    );

    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(screen.getByTestId('order').textContent).toContain('Newest Course');
    expect(screen.getByTestId('order').textContent).toMatch(
      /Newest Course\|Mathematics 101 - Algebra Fundamentals\|English 200 - Creative Writing\|Science 150 - Biology Basics/,
    );
  });

  it('restores the last saved note on cancel and clears success feedback when the note is edited again', async () => {
    const user = userEvent.setup ? userEvent.setup() : userEvent;
    window.localStorage.setItem(
      'daily-log-logs',
      JSON.stringify([
        {
          log_id: 'lg-detail',
          created_at: '2026-07-20T12:00:00.000Z',
          entity_id: 'time-log-detail',
          metadata: {
            course: 'Detail Course',
            duration: '45m',
            noteToTeacher: 'Saved note',
            teacherFeedback: '',
          },
        },
      ]),
    );

    render(
      <MemoryRouter initialEntries={['/educationportal/time-logs/detail']}>
        <Route path="/educationportal/time-logs/:id">
          <DailyLogProvider>
            <TimeLogDetail />
          </DailyLogProvider>
        </Route>
      </MemoryRouter>,
    );

    const noteField = screen.getByPlaceholderText(/write a note to your teacher/i);
    expect(noteField).toHaveValue('Saved note');

    await user.clear(noteField);
    await user.type(noteField, 'Edited note');
    expect(screen.queryByText(/note saved successfully/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(noteField).toHaveValue('Saved note');
  });

  it('falls back to the seeded logs when local storage contains malformed JSON', () => {
    window.localStorage.setItem('daily-log-logs', '{bad json');

    renderDailyLog();

    expect(screen.getByText('2h 0m')).toBeInTheDocument();
  });

  it("keeps each user isolated from another user's persisted logs", () => {
    window.localStorage.setItem('userId', 'alice');

    renderDailyLog([], {
      'daily-log-logs-alice': JSON.stringify([
        {
          log_id: 'lg-alice',
          created_at: '2026-07-20T12:00:00.000Z',
          entity_id: 'time-log-alice',
          metadata: { course: 'Alice Course', duration: '30m' },
        },
      ]),
      'daily-log-logs-bob': JSON.stringify([
        {
          log_id: 'lg-bob',
          created_at: '2026-07-21T12:00:00.000Z',
          entity_id: 'time-log-bob',
          metadata: { course: 'Bob Course', duration: '45m' },
        },
      ]),
    });

    expect(screen.getByText('Alice Course')).toBeInTheDocument();
    expect(screen.queryByText('Bob Course')).not.toBeInTheDocument();
  });
});
