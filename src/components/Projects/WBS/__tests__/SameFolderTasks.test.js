import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureStore from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';
import { Provider } from 'react-redux';
import axios from 'axios';
import SameFolderTasks from '../SameFolderTasks';
import { ApiEndpoint, ENDPOINTS } from 'utils/URL';
import MockAdapter from 'axios-mock-adapter';

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

// No parameters, mock nothing
mock.onGet(ENDPOINTS.TASKS()).reply(200, {});
mock.onGet(ENDPOINTS.GET_WBS('')).reply(200, {});

mock
  .onGet(ENDPOINTS.TASKS(mockTaskResponse.wbsId, mockTaskResponse.level, mockTaskResponse.mother))
  .reply(200, mockTaskResponse);
mock
  .onGet(ENDPOINTS.TASKS(mockTaskResponse.wbsId, mockTaskResponse.level, mockTaskResponseNullMother.mother))
  .reply(200, mockTaskResponse);
mock.onGet(ENDPOINTS.GET_WBS(mockTaskResponse.wbsId)).reply(200, mockWbsResponse);
mock.onGet(ENDPOINTS.GET_TASK('123')).reply(200, mockTaskResponse);
mock.onGet(ENDPOINTS.GET_TASK('nullMother')).reply(200, mockTaskResponseNullMother);

const mockStore = configureStore();

describe('SameFolderTasks', () => {
  const store = mockStore({
    theme: themeMock,
  });
  let renderSameFolderTasks = props => {
    render(
      <Provider store={store}>
        <SameFolderTasks {...props} />
      </Provider>,
    );
  };

  describe('fetchTaskData useEffect test', () => {
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
});
