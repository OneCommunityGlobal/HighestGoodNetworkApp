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

const MOCK_TASK = vi.hoisted(() => ({
  _id: '64b000000000000000000001',
  projectId: '5f2f7490dc35a608720d5ca6',
  wbsId: '64b000000000000000000002',
  wbsName: 'Mock WBS',
  projectName: 'Mock Project 1',
  taskName: 'Mock Task',
}));

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
    Editor: ({ id, value, onEditorChange, onInit }) => {
      const editorRef = ReactModule.useRef(null);
      ReactModule.useEffect(() => {
        onInit?.(null, { focus: () => editorRef.current?.focus() });
      }, [onInit]);
      return ReactModule.createElement('textarea', {
        id,
        ref: editorRef,
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
      });
    },
  };
});

vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  const get = vi.fn(url => {
    if (url.includes('/projects/user')) {
      return Promise.resolve({ data: userProjectMock.projects });
    }
    if (url.includes('/tasks')) {
      return Promise.resolve({ data: [MOCK_TASK] });
    }
    if (url.toLowerCase().includes('/userprofile')) {
      return Promise.resolve({ data: userProfileMock });
    }
    return Promise.resolve({ data: [] });
  });
  return { __esModule: true, ...actual, default: { ...actual.default, get }, get };
});

const mockStore = configureMockStore([thunk]);
const NOTES =
  'Reviewed the onboarding flow and documented all of the findings in https://example.com/doc today';
const DUPLICATE_WARNING =
  'Whoa there tiger, you’ve already submitted a time log exactly like this! Time logs need to be unique (and specific) or they’ll get flagged by the Time Log Administrator. Multiple flags will result in a blue square being issued.';
const TASK_TIME_ACTION = 'UPDATE_TEAM_MEMBERS_TASK_TIME';
const TASK_VALUE = `${MOCK_TASK.projectId}/${MOCK_TASK.wbsId}/${MOCK_TASK._id}`;
const LABELS = {
  cancel: 'CANCEL — I don’t want duplicates',
  edit: 'EDIT — I’ll update the description',
  proceed: 'PROCEED — I understand the consequences',
};

describe('<TimeEntryForm /> duplicate submission workflow', () => {
  const project = userProjectMock.projects[0];
  const data = { hours: 1, minutes: 30 };
  let store;
  let toggle;
  let sendStop;
  let onTimeSubmitted;
  let onDuplicateCancel;

  beforeEach(() => {
    vi.clearAllMocks();
    toggle = vi.fn();
    sendStop = vi.fn();
    onTimeSubmitted = vi.fn();
    onDuplicateCancel = vi.fn();
    store = mockStore({
      auth: authMock,
      userProjects: { projects: userProjectMock.projects },
      userProfile: userProfileMock,
      role: rolesMock,
      theme: { darkMode: false },
    });
  });

  const submitButton = () => screen.getByRole('button', { name: /^(submit|submitting\.\.\.)$/i });
  const duplicateButton = key => screen.getByRole('button', { name: LABELS[key] });
  const taskTimeActions = () => store.getActions().filter(a => a.type === TASK_TIME_ACTION);

  const respondWithStatus = (status, code) => {
    postTimeEntry.mockImplementation(() => async () => (code ? { status, code } : { status }));
  };

  const respondInOrder = (...results) => {
    let callIndex = 0;
    postTimeEntry.mockImplementation(() => async () => results[callIndex++]);
  };

  const renderAndFill = async ({ from = 'Timer', isTangible = true } = {}) => {
    renderWithProvider(
      <TimeEntryForm
        from={from}
        edit={false}
        data={{
          ...data,
          isTangible,
          ...(from === 'TimeLog' ? { personId: authMock.user.userid } : {}),
        }}
        toggle={toggle}
        isOpen
        sendStop={sendStop}
        onTimeSubmitted={onTimeSubmitted}
        onDuplicateCancel={onDuplicateCancel}
        timerConnected
      />,
      { store },
    );

    await screen.findByRole('option', { name: project.projectName });
    await screen.findByRole('option', { name: /Mock Task/ });
    await userEvent.selectOptions(screen.getByLabelText(/project\/task/i), TASK_VALUE);
    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: NOTES } });
    await waitFor(() => expect(submitButton()).toBeEnabled());
  };

  const fillAndSubmit = async options => {
    await renderAndFill(options);
    await userEvent.click(submitButton());
    await waitFor(() => expect(postTimeEntry).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(submitButton()).toBeEnabled());
  };

  const expectFailedSubmissionLeftEverythingIntact = () => {
    expect.soft(sendStop).not.toHaveBeenCalled();
    expect.soft(toggle).not.toHaveBeenCalled();
    expect.soft(onTimeSubmitted).not.toHaveBeenCalled();
    expect.soft(taskTimeActions()).toHaveLength(0);
    expect.soft(toast.success).not.toHaveBeenCalled();
    expect.soft(screen.getByLabelText(/project\/task/i)).toHaveValue(TASK_VALUE);
    expect.soft(screen.getByLabelText(/notes/i)).toHaveValue(NOTES);
    const [hours, minutes] = screen.getAllByRole('spinbutton');
    expect.soft(hours).toHaveValue(1);
    expect.soft(minutes).toHaveValue(30);
    expect.soft(submitButton()).toBeEnabled();
  };

  it('preserves the normal successful submission lifecycle', async () => {
    respondWithStatus(200);
    await fillAndSubmit();

    expect(postTimeEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: NOTES,
        projectId: MOCK_TASK.projectId,
        taskId: MOCK_TASK._id,
        wbsId: MOCK_TASK.wbsId,
        hours: 1,
        minutes: 30,
        isTangible: true,
        entryType: 'default',
      }),
      expect.objectContaining({ detailed: true }),
    );
    expect(sendStop).toHaveBeenCalledTimes(1);
    expect(onTimeSubmitted).toHaveBeenCalledTimes(1);
    expect(taskTimeActions()).toHaveLength(1);
    expect(toggle).toHaveBeenCalledTimes(1);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it.each([400, 403, 409, 500])('uses ordinary failure behavior for HTTP %i', async status => {
    respondWithStatus(status);
    await fillAndSubmit();

    expect(screen.queryByText(DUPLICATE_WARNING)).not.toBeInTheDocument();
    expectFailedSubmissionLeftEverythingIntact();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining(`request failed with status ${status}`),
    );
  });

  it('opens the duplicate modal only for the exact duplicate code without generic error feedback', async () => {
    respondWithStatus(409, 'DUPLICATE_TIME_ENTRY');
    await fillAndSubmit();

    expect(screen.getByText(DUPLICATE_WARNING)).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
    expectFailedSubmissionLeftEverythingIntact();
    expect(postTimeEntry.mock.calls[0][0]).toMatchObject({
      taskId: MOCK_TASK._id,
      wbsId: MOCK_TASK.wbsId,
    });
  });

  it('uses ordinary failure behavior for an unrelated HTTP 409 code', async () => {
    respondWithStatus(409, 'SOME_OTHER_CONFLICT');
    await fillAndSubmit();

    expect(screen.queryByText(DUPLICATE_WARNING)).not.toBeInTheDocument();
    expectFailedSubmissionLeftEverythingIntact();
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('status 409'));
  });

  it('preserves failure behavior for a network rejection', async () => {
    postTimeEntry.mockImplementation(() => async () => {
      throw new Error('Network Error');
    });
    await fillAndSubmit();

    expectFailedSubmissionLeftEverythingIntact();
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Network Error'));
  });

  it('CANCEL closes the form and delegates current-week navigation without stopping the timer', async () => {
    respondWithStatus(409, 'DUPLICATE_TIME_ENTRY');
    await fillAndSubmit();

    await userEvent.click(duplicateButton('cancel'));

    expect(onDuplicateCancel).toHaveBeenCalledWith(authMock.user.userid);
    expect(toggle).toHaveBeenCalledTimes(1);
    expect(postTimeEntry).toHaveBeenCalledTimes(1);
    expect(sendStop).not.toHaveBeenCalled();
    expect(onTimeSubmitted).not.toHaveBeenCalled();
    expect(taskTimeActions()).toHaveLength(0);
  });

  it('EDIT closes only the warning, preserves project/task/date/time and focuses notes', async () => {
    respondWithStatus(409, 'DUPLICATE_TIME_ENTRY');
    await fillAndSubmit();
    const originalWorkDate = screen.getByLabelText(/date/i).value;

    await userEvent.click(duplicateButton('edit'));

    await waitFor(() => expect(screen.queryByText(DUPLICATE_WARNING)).not.toBeInTheDocument());
    expect(toggle).not.toHaveBeenCalled();
    expect(sendStop).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/notes/i)).toHaveValue(NOTES);
    await waitFor(() => expect(screen.getByLabelText(/notes/i)).toHaveFocus());
    expect(screen.getByLabelText(/project\/task/i)).toHaveValue(TASK_VALUE);
    expect(screen.getByLabelText(/date/i)).toHaveValue(originalWorkDate);
    const [hours, minutes] = screen.getAllByRole('spinbutton');
    expect(hours).toHaveValue(1);
    expect(minutes).toHaveValue(30);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('allows a revised description to be resubmitted after EDIT', async () => {
    respondInOrder({ status: 409, code: 'DUPLICATE_TIME_ENTRY' }, { status: 200 });
    await fillAndSubmit();
    await userEvent.click(duplicateButton('edit'));

    const revisedNotes = `${NOTES} and added a new project reference`;
    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: revisedNotes } });
    await userEvent.click(submitButton());

    await waitFor(() => expect(postTimeEntry).toHaveBeenCalledTimes(2));
    expect(postTimeEntry.mock.calls[1][0].notes).toBe(revisedNotes);
    await waitFor(() => expect(sendStop).toHaveBeenCalledTimes(1));
    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('Escape chooses EDIT and never retries or stops the timer', async () => {
    respondWithStatus(409, 'DUPLICATE_TIME_ENTRY');
    await fillAndSubmit();
    const editButton = duplicateButton('edit');
    await waitFor(() => expect(editButton).toHaveFocus());

    fireEvent.keyDown(editButton, { key: 'Escape', keyCode: 27 });
    fireEvent.keyUp(editButton, { key: 'Escape', keyCode: 27 });

    await waitFor(() => expect(screen.queryByText(DUPLICATE_WARNING)).not.toBeInTheDocument());
    expect(postTimeEntry).toHaveBeenCalledTimes(1);
    expect(sendStop).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/notes/i)).toHaveValue(NOTES);
  });

  it('PROCEED retries the original snapshot plus boolean allowDuplicate and cleans up once', async () => {
    respondInOrder({ status: 409, code: 'DUPLICATE_TIME_ENTRY' }, { status: 200 });
    await fillAndSubmit();
    const originalPayload = postTimeEntry.mock.calls[0][0];
    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: 'Changed after warning' } });

    await userEvent.click(duplicateButton('proceed'));

    await waitFor(() => expect(postTimeEntry).toHaveBeenCalledTimes(2));
    expect(postTimeEntry.mock.calls[1][0]).toEqual({ ...originalPayload, allowDuplicate: true });
    await waitFor(() => expect(screen.queryByText(DUPLICATE_WARNING)).not.toBeInTheDocument());
    expect(sendStop).toHaveBeenCalledTimes(1);
    expect(onTimeSubmitted).toHaveBeenCalledTimes(1);
    expect(taskTimeActions()).toHaveLength(1);
    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('PROCEED failure preserves state and allows a normal retry that can warn again', async () => {
    respondInOrder(
      { status: 409, code: 'DUPLICATE_TIME_ENTRY' },
      { status: 500 },
      { status: 409, code: 'DUPLICATE_TIME_ENTRY' },
    );
    await fillAndSubmit();
    await userEvent.click(duplicateButton('proceed'));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(screen.getByLabelText(/notes/i)).toHaveValue(NOTES);
    expect(sendStop).not.toHaveBeenCalled();
    expect(onTimeSubmitted).not.toHaveBeenCalled();
    expect(taskTimeActions()).toHaveLength(0);
    expect(submitButton()).toBeEnabled();

    await userEvent.click(submitButton());
    await waitFor(() => expect(postTimeEntry).toHaveBeenCalledTimes(3));
    expect(screen.getByText(DUPLICATE_WARNING)).toBeInTheDocument();
  });

  it('allows only one in-flight PROCEED request after rapid repeated clicks', async () => {
    let resolveProceed;
    respondInOrder(
      { status: 409, code: 'DUPLICATE_TIME_ENTRY' },
      new Promise(resolve => { resolveProceed = resolve; }),
    );
    await fillAndSubmit();
    const proceed = duplicateButton('proceed');

    fireEvent.click(proceed);
    fireEvent.click(proceed);
    await waitFor(() => expect(postTimeEntry).toHaveBeenCalledTimes(2));
    resolveProceed({ status: 200 });
    await waitFor(() => expect(sendStop).toHaveBeenCalledTimes(1));
    expect(postTimeEntry).toHaveBeenCalledTimes(2);
  });

  it('shows duplicate confirmation after intangible confirmation and does not show it twice', async () => {
    respondInOrder({ status: 409, code: 'DUPLICATE_TIME_ENTRY' }, { status: 200 });
    await renderAndFill({ isTangible: false });
    await userEvent.click(submitButton());

    expect(screen.getByText(/If you are logging Intangible Time/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Yep, totally did that! Please proceed/ }));
    await waitFor(() => expect(postTimeEntry).toHaveBeenCalledTimes(1));
    expect(screen.getByText(DUPLICATE_WARNING)).toBeInTheDocument();
    await userEvent.click(duplicateButton('proceed'));

    await waitFor(() => expect(postTimeEntry).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.queryByText(/If you are logging Intangible Time/)).not.toBeInTheDocument(),
    );
    expect(postTimeEntry.mock.calls[1][0]).toMatchObject({ isTangible: false, allowDuplicate: true });
  });

  it('uses the target user for CANCEL when opened from the Timelog page', async () => {
    respondWithStatus(409, 'DUPLICATE_TIME_ENTRY');
    await fillAndSubmit({ from: 'TimeLog' });
    await userEvent.click(duplicateButton('cancel'));

    expect(onDuplicateCancel).toHaveBeenCalledWith(postTimeEntry.mock.calls[0][0].personId);
    expect(sendStop).not.toHaveBeenCalled();
  });
});
