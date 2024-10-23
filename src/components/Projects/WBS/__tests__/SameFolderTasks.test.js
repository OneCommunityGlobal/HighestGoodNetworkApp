import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureStore from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import SameFolderTasks from '../SameFolderTasks';
import { ApiEndpoint, ENDPOINTS } from 'utils/URL';
import MockAdapter from 'axios-mock-adapter';
import EditTaskModal from '../WBSDetail/EditTask/EditTaskModal';

jest.mock('../WBSDetail/EditTask/EditTaskModal');
EditTaskModal.mockImplementation = () => <div />;

const mock = new MockAdapter(axios);

const mockTaskResponse = {
  wbsId: '456',
  level: 1,
  mother: '123',
};

const mockTaskResponseNullMother = {
  wbsId: '456',
  level: 1,
  mother: null,
};

const mockWbsResponse = {
  projectId: '789',
  wbsName: 'wbsName',
};

const mockAllTasksResponse = [
  {
    _id: '12345',
    parentNum: '54321',
    wbsId: 'WBS001',
    parentId1: 'PARENT1',
    parentId2: 'PARENT2',
    parentId3: 'PARENT3',
    mother: 'MOTHER1',
    level: 1,
    num: '001',
    taskName: 'Sample Task 1',
    priority: 'High',
    isAssigned: true,
    status: 'In Progress',
    hoursBest: 5,
    hoursMost: 7,
    estimatedHours: 6,
    hoursLogged: 3,
    startedDatetime: '2024-07-01T08:00:00Z',
    dueDatetime: '2024-07-15T17:00:00Z',
    links: ['http://example.com/link1', 'http://example.com/link2'],
    resources: [
      {
        profilePic: 'http://example.com/profilePic1.jpg',
        name: 'John Doe',
        userID: 'user123',
      },
      {
        profilePic: 'http://example.com/profilePic2.jpg',
        name: 'Jane Smith',
        userID: 'user456',
      },
    ],
  },
  {
    _id: '12346',
    parentNum: '54322',
    wbsId: 'WBS002',
    parentId1: 'PARENT4',
    parentId2: 'PARENT5',
    parentId3: 'PARENT6',
    mother: 'MOTHER2',
    level: 2,
    num: '002',
    taskName: 'Sample Task 2',
    priority: 'Medium',
    isAssigned: false,
    status: 'Not Started',
    hoursBest: 3,
    hoursMost: 4,
    estimatedHours: 3.5,
    hoursLogged: 0,
    startedDatetime: '2024-07-05T08:00:00Z',
    dueDatetime: '2024-07-20T17:00:00Z',
    links: ['http://example.com/link3', 'http://example.com/link4'],
    resources: [
      {
        profilePic: 'http://example.com/profilePic3.jpg',
        name: 'Alice Johnson',
        userID: 'user789',
      },
    ],
  },
  {
    _id: '12347',
    parentNum: '54323',
    wbsId: 'WBS003',
    parentId1: 'PARENT7',
    parentId2: 'PARENT8',
    parentId3: 'PARENT9',
    mother: 'MOTHER3',
    level: 3,
    num: '003',
    taskName: 'Sample Task 3',
    priority: 'Low',
    isAssigned: true,
    status: 'Completed',
    hoursBest: 2,
    hoursMost: 3,
    estimatedHours: 2.5,
    hoursLogged: 2.5,
    startedDatetime: '2024-06-25T08:00:00Z',
    dueDatetime: '2024-07-10T17:00:00Z',
    links: ['http://example.com/link5', 'http://example.com/link6'],
    resources: [
      {
        profilePic: 'http://example.com/profilePic4.jpg',
        name: 'Bob Brown',
        userID: 'user101',
      },
      {
        profilePic: 'http://example.com/profilePic5.jpg',
        name: 'Eve White',
        userID: 'user202',
      },
    ],
  },
  {
    _id: '12348',
    parentNum: '54324',
    wbsId: 'WBS004',
    parentId1: 'PARENT10',
    parentId2: 'PARENT11',
    parentId3: 'PARENT12',
    mother: 'MOTHER4',
    level: 1,
    num: '004',
    taskName: 'Sample Task 4',
    priority: 'High',
    isAssigned: false,
    status: 'Not Started',
    hoursBest: 6,
    hoursMost: 8,
    estimatedHours: 7,
    hoursLogged: 0,
    startedDatetime: '2024-07-10T08:00:00Z',
    dueDatetime: '2024-07-25T17:00:00Z',
    links: ['http://example.com/link7', 'http://example.com/link8'],
    resources: [
      {
        profilePic: 'http://example.com/profilePic6.jpg',
        name: 'Charlie Green',
        userID: 'user303',
      },
    ],
  },
  {
    _id: '12349',
    parentNum: '54325',
    wbsId: 'WBS005',
    parentId1: 'PARENT13',
    parentId2: 'PARENT14',
    parentId3: 'PARENT15',
    mother: 'MOTHER5',
    level: 2,
    num: '005',
    taskName: 'Sample Task 5',
    priority: 'Medium',
    isAssigned: true,
    status: 'In Progress',
    hoursBest: 4,
    hoursMost: 5,
    estimatedHours: 4.5,
    hoursLogged: 1.5,
    startedDatetime: '2024-07-08T08:00:00Z',
    dueDatetime: '2024-07-22T17:00:00Z',
    links: ['http://example.com/link9', 'http://example.com/link10'],
    resources: [
      {
        profilePic: 'http://example.com/profilePic7.jpg',
        name: 'Dana Black',
        userID: 'user404',
      },
      {
        profilePic: 'http://example.com/profilePic8.jpg',
        name: 'Frank White',
        userID: 'user505',
      },
    ],
  },
];

// No parameters, mock nothing
mock.onGet(ENDPOINTS.TASKS()).reply(200, {});
mock.onGet(ENDPOINTS.GET_WBS('')).reply(200, {});

mock
  .onGet(ENDPOINTS.TASKS(mockTaskResponse.wbsId, mockTaskResponse.level, mockTaskResponse.mother))
  .reply(200, mockAllTasksResponse);
mock
  .onGet(
    ENDPOINTS.TASKS(
      mockTaskResponse.wbsId,
      mockTaskResponse.level,
      mockTaskResponseNullMother.mother,
    ),
  )
  .reply(200, mockAllTasksResponse);
mock.onGet(ENDPOINTS.GET_WBS(mockTaskResponse.wbsId)).reply(200, mockWbsResponse);
mock.onGet(ENDPOINTS.GET_TASK('123')).reply(200, mockTaskResponse);
mock.onGet(ENDPOINTS.GET_TASK('321')).reply(200, mockTaskResponse);
mock.onGet(ENDPOINTS.GET_TASK('nullMother')).reply(200, mockTaskResponseNullMother);

const mockStore = configureStore();

describe('SameFolderTasks', () => {
  const store = mockStore({
    theme: themeMock,
    darkMode: false,
    projectMembers: { members: [] },
    tasks: { error: '' },
  });
  let renderSameFolderTasks = props => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SameFolderTasks {...props} />
        </MemoryRouter>
      </Provider>,
    );
  };

  describe('Render with no table when task.mother === null or task.mother === taskId', () => {
    let props;

    it(`If task.mother is null, then div with className App renders with <a> tag where href contains wbsId`, async () => {
      props.match.params.taskId = 'nullMother';
      renderSameFolderTasks(props);

      await waitFor(() => {
        expect(screen.getByRole('link')).toHaveAttribute(
          'href',
          `/wbs/tasks/${mockTaskResponse.wbsId}/${mockWbsResponse.projectId}/${mockWbsResponse.wbsName}`,
        );
      });
    });

    it(`If task.mother is equal to props.taskId, then div with className App renders with <a> tag where href contains wbsId`, async () => {
      renderSameFolderTasks(props);

      await waitFor(() => {
        expect(screen.getByRole('link')).toHaveAttribute(
          'href',
          `/wbs/tasks/${mockTaskResponse.wbsId}/${mockWbsResponse.projectId}/${mockWbsResponse.wbsName}`,
        );
      });
    });

    beforeEach(() => {
      props = {
        match: {
          params: {
            taskId: '123',
          },
        },
      };
    });
  });

  describe('Render Table tests', () => {
    let props;

    it('Before loading tasks, there is a Loading... span', () => {
      renderSameFolderTasks(props);
      expect(screen.findByText('Loading...'));
    });

    it('After loading tasks, there is a table', async () => {
      renderSameFolderTasks(props);
      await expect(screen.findByText('Loading...'));
      await expect(screen.findByText('Task Name'));
    });

    it('After loading tasks, there are 5 sample tasks', async () => {
      await renderSameFolderTasks(props);
      await expect(screen.findByText('Loading...'));

      await expect(screen.findByText('Sample Task 1'));
      await expect(screen.findByText('Sample Task 2'));
      await expect(screen.findByText('Sample Task 3'));
      await expect(screen.findByText('Sample Task 4'));
      await expect(screen.findByText('Sample Task 5'));
    });

    beforeEach(() => {
      props = {
        match: {
          params: {
            taskId: '321',
          },
        },
      };
    });
  });
});
