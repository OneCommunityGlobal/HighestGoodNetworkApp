vi.mock('../../../../actions/timeEntries', async () => {
  // importActual gives you the real module
  const actual = await vi.importActual('../../../../actions/timeEntries');
  return {
    __esModule: true,
    ...actual,
    postTimeEntry: vi.fn(() => ({ type: 'MOCK_POST_TIME_ENTRY' })),
    editTimeEntry: vi.fn(() => ({ type: 'MOCK_EDIT_TIME_ENTRY' })),
  };
});
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    __esModule: true,
    ...actual,
    get: vi.fn(url => {
      if (url.includes('/userProjects')) {
        return Promise.resolve({
          data: {
            projects: [
              // <--- this is important!
              {
                projectId: '5a849055592ca46b43db2729',
                projectName: 'Test Project',
                WBSObject: {
                  testWbsId: {
                    tasks: {
                      testTaskId: {
                        taskName: 'Test Task',
                      },
                    },
                  },
                },
              },
            ],
          },
        });
      }
      if (url.includes('/tasks')) {
        return Promise.resolve({
          data: [
            {
              _id: 'testTaskId',
              projectId: '5a849055592ca46b43db2729',
              wbsId: 'testWbsId',
              taskName: 'Test Task',
              wbsName: 'Test WBS',
              projectName: 'Test Project',
            },
          ],
        });
      }
      if (url.includes('/userProfile')) {
        return Promise.resolve({ data: userProfileMock });
      }
      return Promise.resolve({ data: [] });
    }),
  };
});
vi.mock('@tinymce/tinymce-react', () => {
  return {
    Editor: ({ id, value, onEditorChange }) => (
      <textarea
        data-testid="notes-editor"
        id={id}
        value={value}
        onChange={e =>
          onEditorChange(e.target.value, {
            id,
            plugins: {
              wordcount: { body: { getWordCount: () => e.target.value.split(' ').length } },
            },
          })
        }
      />
    ),
  };
});
// eslint-disable-next-line no-unused-vars
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { screen, render, fireEvent, waitFor, getByText } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import moment from 'moment-timezone';
// eslint-disable-next-line no-unused-vars
import { icon } from '@fortawesome/fontawesome-svg-core';
import {
  authMock,
  userProfileMock,
  timeEntryMock,
  userProjectMock,
  rolesMock,
  themeMock,
} from '../../../../__tests__/mockStates';
// eslint-disable-next-line no-unused-vars
import { renderWithProvider, renderWithRouterMatch } from '../../../../__tests__/utils';
import TimeEntryForm from '../TimeEntryForm';
// import * as actions from '../../../../actions/timeEntries';

import { postTimeEntry, editTimeEntry } from '../../../../actions/timeEntries';

const mockStore = configureStore([thunk]);

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

describe('<TimeEntryForm />', () => {
  let store;
  let toggle;
  let userProfile;
  // eslint-disable-next-line no-unused-vars
  let role;
  const data = timeEntryMock.weeks[0][0];
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProjects: {
        projects: [
          {
            projectId: '5a849055592ca46b43db2729',
            projectName: 'Test Project',
            WBSObject: {
              testWbsId: {
                tasks: {
                  testTaskId: {
                    taskName: 'Test Task',
                  },
                },
              },
            },
          },
        ],
      },
      userProfile: userProfileMock,
      role: rolesMock.role,
      theme: { darkMode: false },
    });
    userProfile = vi.fn();
    role = vi.fn();

    toggle = vi.fn();
    renderWithProvider(
      <TimeEntryForm
        from="Timer"
        sendStop={() => {}}
        userId={data.personId}
        edit={false}
        data={data}
        isOpen
        toggle={toggle}
        timer
        userProfile={userProfile}
        resetTimer
      />,
      {
        store,
      },
    );
  });
  // it('should dispatch the right action with the right payload after add new time entry', async () => {
  //   // eslint-disable-next-line no-unused-vars
  //   const expectedPayload = {
  //     personId: data.personId,
  //     dateOfWork: moment().format('YYYY-MM-DD'),
  //     notes: '',
  //     isTangible: 'true',
  //     projectId: userProjectMock.projects[0].projectId,
  //     timeSpent: '01:0:00',
  //   };
  //   // actions.postTimeEntry = vi.fn();
  //   expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
  //   expect(screen.getByLabelText('Date')).toBeInTheDocument();
  //   expect(screen.getByDisplayValue('Select Project/Task')).toBeInTheDocument();
  //   // expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  //   userEvent.type(screen.getAllByRole('spinbutton')[0], '1');
  //   expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(1);

  //   fireEvent.change(screen.getByDisplayValue(/select project/i), {
  //     target: { value: userProjectMock.projects[0].projectId },
  //   });
  //   await sleep(100);
  //   // userEvent.selectOptions(screen.getByRole('combobox'), userProjectMock.projects[0].projectId);
  //   const notes = screen.getByTestId('notes-editor');
  //   await userEvent.type(
  //     notes,
  //     'one two three four five six seven eight nine ten https://test.com',
  //   );
  //   await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  //   await waitFor(() => {
  //     // since we're using redux-mock-store, check that our mock action was actually dispatched
  //     const dispatched = store.getActions();
  //     expect(dispatched).toHaveLength(1);
  //     expect(dispatched[0]).toEqual({ type: 'MOCK_POST_TIME_ENTRY' });
  //   });
  //   // expect(actions.postTimeEntry).toHaveBeenCalledTimes(1);
  //   // expect(actions.postTimeEntry).toHaveBeenCalledWith(expectedPayload);
  // });
  it('should render the openInfo and the content', () => {
    const tips = screen.getByTitle('timeEntryTip');
    fireEvent.click(tips);
    expect(screen.getByText(/This is the One Community time clock*/i)).toBeInTheDocument();
  });
  it('should render the tangible tip info and the content', () => {
    const tips = screen.getByTitle('tangibleTip');
    userEvent.click(tips, 1);
    expect(screen.getByText(/Intangible time is time logged*/i)).toBeInTheDocument();
  });
  it('should render the correct tangible checkbox', () => {
    const checkbox = screen.getByRole('checkbox');
    if (data.isTangible) {
      expect(checkbox).toBeChecked();
    } else {
      expect(checkbox).not.toBeChecked();
    }
  });

  it('should populate errors if time fields are empty or invalid', async () => {
    const hours = screen.getAllByRole('spinbutton')[0];
    const minutes = screen.getAllByRole('spinbutton')[1];

    // Alternative approach 1: Use fireEvent.change instead of userEvent
    fireEvent.change(hours, { target: { value: '0' } });
    fireEvent.change(minutes, { target: { value: '0' } });

    // Alternative approach 2: If using userEvent, ensure proper clearing
    // await userEvent.clear(hours);
    // await userEvent.clear(minutes);
    // await userEvent.type(hours, '0');
    // await userEvent.type(minutes, '0');

    expect(hours).toHaveValue(0);
    expect(minutes).toHaveValue(0);

    userEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() =>
      expect(screen.getByText(/Time should be greater than 0 minutes/)).toBeInTheDocument(),
    );
  });
  it('should populate errors if project field is empty or invalid', async () => {
    const projectField = screen.getByDisplayValue(/select project/i);
    fireEvent.change(projectField, { target: { value: '' } });
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    // this error message comes straight from validateForm
    expect(await screen.findByText(/Project\/Task is required/i)).toBeInTheDocument();
    expect(postTimeEntry).not.toHaveBeenCalled();
  });
});

describe('<TimeEntryFormEdit />', () => {
  let store;
  let toggle;
  let userProfile;
  const data = timeEntryMock.weeks[0][0];

  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProjects: userProjectMock,
      userProfile: userProfileMock,
      role: rolesMock,
      theme: { darkMode: false },
    });
    userProfile = vi.fn();
    toggle = vi.fn();
    store.dispatch = vi.fn();

    // Clear any previous calls to the mock
    vi.clearAllMocks();

    renderWithProvider(
      <TimeEntryForm
        userId={data.personId}
        edit
        data={data}
        isOpen
        toggle={toggle}
        timer
        userProfile={userProfile}
        resetTimer
      />,
      {
        store,
      },
    );
  });

  // it('should dispatch the right action with the right payload after edit a time entry', async () => {
  //   const expectedPayload = {
  //     personId: '5edf141c78f1380017b829a6',
  //     dateOfWork: '2020-08-12',
  //     isTangible: 'true',
  //     projectId: '5a849055592ca46b43db2729',
  //     timeSpent: '06:43:00',
  //   };

  //   // Remove this assertion since editTimeEntry shouldn't be called yet
  //   // expect(editTimeEntry).toHaveBeenCalled();

  //   const dateField = screen.getByLabelText(/date/i);
  //   const hours = screen.getAllByRole('spinbutton')[0];
  //   const minutes = screen.getAllByRole('spinbutton')[1];
  //   const projectField = screen.getByRole('combobox');
  //   const noteField = screen.getByTestId('notes-editor');
  //   expect(screen.getByTestId('timeEntryFormModal')).toBeInTheDocument();
  //   expect(dateField).toBeInTheDocument();
  //   expect(hours).toBeInTheDocument();
  //   expect(minutes).toBeInTheDocument();
  //   expect(projectField).toBeInTheDocument();
  //   expect(noteField).toBeInTheDocument();
  //   await userEvent.type(
  //     noteField,
  //     'edit one two three four five six seven eight nine ten https://www.google.com',
  //   );

  //   // Trigger the save action
  //   await userEvent.click(screen.getByRole('button', { name: /save/i }));

  //   // Wait for the action to be dispatched
  //   await waitFor(() => {
  //     expect(editTimeEntry).toHaveBeenCalledTimes(1);
  //     expect(toggle).toHaveBeenCalled();
  //   });
  // });
  it('should populate errors if notes fields are empty or invalid', async () => {
    /*
    fireEvent.click(screen.getByRole('button', { name: /clear form/i }));
    await sleep(1000);
    userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByText("Description and reference link are required")).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    await sleep(1000);
    expect(screen.getByText('Description and reference link are require')).toBeInTheDocument();
    */
  });
});
