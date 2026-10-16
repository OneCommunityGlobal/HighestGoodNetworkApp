import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { toast } from 'react-toastify';
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
    postTimeEntry: vi.fn(),
  };
});

vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

// TinyMCE cannot load in jsdom, so the mock reports word count like the real editor does.
vi.mock('@tinymce/tinymce-react', async () => {
  const ReactModule = await import('react');
  return {
    Editor: ({ id, value, onEditorChange }) =>
      ReactModule.createElement('textarea', {
        id,
        value,
        onChange: e => {
          const text = e.target.value;
          onEditorChange(text, {
            id,
            focus: () => {},
            plugins: {
              wordcount: { body: { getWordCount: () => text.split(/\s+/).filter(Boolean).length } },
            },
          });
        },
      }),
  };
});

vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  const get = vi.fn(url => {
    if (url.includes('/projects/user')) {
      return Promise.resolve({ data: userProjectMock.projects });
    }
    if (url.includes('/tasks')) {
      return Promise.resolve({ data: [] });
    }
    if (url.toLowerCase().includes('/userprofile')) {
      return Promise.resolve({ data: userProfileMock });
    }
    return Promise.resolve({ data: [] });
  });
  return { __esModule: true, ...actual, default: { ...actual.default, get }, get };
});

const mockStore = configureMockStore([thunk]);

// More than 10 words and an https link, as the form's validation requires.
const NOTES =
  'Reviewed the onboarding flow and documented all of the findings in https://example.com/doc today';
const TASK_TIME_ACTION = 'UPDATE_TEAM_MEMBERS_TASK_TIME';

describe('<TimeEntryForm /> submitting a new time entry from the timer', () => {
  const project = userProjectMock.projects[0];
  const data = { hours: 1, minutes: 30 };
  let store;
  let toggle;
  let sendStop;
  let onTimeSubmitted;

  beforeEach(() => {
    vi.clearAllMocks();
    toggle = vi.fn();
    sendStop = vi.fn();
    onTimeSubmitted = vi.fn();
    store = mockStore({
      auth: authMock,
      userProjects: { projects: userProjectMock.projects },
      userProfile: userProfileMock,
      role: rolesMock,
      theme: { darkMode: false },
    });
  });

  const submitButton = () => screen.getByRole('button', { name: /^(submit|submitting\.\.\.)$/i });

  const respondWithStatus = status => {
    postTimeEntry.mockImplementation(() => async () => status);
  };

  const fillAndSubmit = async () => {
    renderWithProvider(
      <TimeEntryForm
        from="Timer"
        edit={false}
        data={data}
        toggle={toggle}
        isOpen
        sendStop={sendStop}
        onTimeSubmitted={onTimeSubmitted}
        timerConnected
      />,
      { store },
    );

    await screen.findByRole('option', { name: project.projectName });
    await userEvent.selectOptions(screen.getByLabelText(/project\/task/i), project.projectId);
    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: NOTES } });

    await waitFor(() => expect(submitButton()).toBeEnabled());
    await userEvent.click(submitButton());

    // The request must actually be attempted; otherwise validation blocked the fixture.
    await waitFor(() => expect(postTimeEntry).toHaveBeenCalledTimes(1));
    // The control is disabled while submitting, so re-enabled means the submission settled.
    await waitFor(() => expect(submitButton()).toBeEnabled());
  };

  const taskTimeActions = () => store.getActions().filter(a => a.type === TASK_TIME_ACTION);

  it.each([400, 403, 409, 500])(
    'keeps the form open, the timer running and the input intact on HTTP %i',
    async status => {
      respondWithStatus(status);

      await fillAndSubmit();

      expect.soft(sendStop).not.toHaveBeenCalled();
      expect.soft(toggle).not.toHaveBeenCalled();
      expect.soft(onTimeSubmitted).not.toHaveBeenCalled();
      expect.soft(taskTimeActions()).toHaveLength(0);
      expect.soft(toast.success).not.toHaveBeenCalled();

      const [hours, minutes] = screen.getAllByRole('spinbutton');
      expect.soft(hours).toHaveValue(1);
      expect.soft(minutes).toHaveValue(30);
      expect.soft(screen.getByLabelText(/project\/task/i)).toHaveValue(project.projectId);
      expect.soft(screen.getByLabelText(/notes/i)).toHaveValue(NOTES);

      expect.soft(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('An error occurred while attempting to submit your time entry'),
      );
      expect.soft(submitButton()).toHaveTextContent(/^Submit$/);
      expect.soft(submitButton()).toBeEnabled();
    },
  );

  it('keeps the form open, the timer running and the input intact when the request rejects', async () => {
    postTimeEntry.mockImplementation(() => async () => {
      throw new Error('Network Error');
    });

    await fillAndSubmit();

    expect.soft(sendStop).not.toHaveBeenCalled();
    expect.soft(toggle).not.toHaveBeenCalled();
    expect.soft(onTimeSubmitted).not.toHaveBeenCalled();
    expect.soft(taskTimeActions()).toHaveLength(0);
    expect.soft(toast.success).not.toHaveBeenCalled();
    expect.soft(screen.getByLabelText(/notes/i)).toHaveValue(NOTES);
    expect.soft(screen.getByLabelText(/project\/task/i)).toHaveValue(project.projectId);
    expect.soft(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('An error occurred while attempting to submit your time entry'),
    );
    expect.soft(submitButton()).toBeEnabled();
  });

  it('stops the timer, reports the submission and closes the form on HTTP 200', async () => {
    respondWithStatus(200);

    await fillAndSubmit();

    expect(postTimeEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: NOTES,
        projectId: project.projectId,
        hours: 1,
        minutes: 30,
        isTangible: true,
        entryType: 'default',
      }),
      expect.any(Object),
    );
    expect(sendStop).toHaveBeenCalledTimes(1);
    expect(onTimeSubmitted).toHaveBeenCalledTimes(1);
    expect(onTimeSubmitted).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 1, minutes: 30 }),
    );
    expect(taskTimeActions()).toHaveLength(1);
    expect(toggle).toHaveBeenCalledTimes(1);
    expect(toast.error).not.toHaveBeenCalled();
  });
});
