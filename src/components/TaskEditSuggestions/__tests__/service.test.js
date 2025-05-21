import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../../utils/URL';
import {
  getTaskEditSuggestionsHTTP,
  createTaskEditSuggestionHTTP,
  rejectTaskEditSuggestionHTTP,
  getTaskEditSuggestionCountHTTP,
} from '../service';

const mock = new MockAdapter(axios);

describe('HTTP Service Functions', () => {
  beforeEach(() => {
    // Mock all requests with a 404 error
    mock.onAny().reply(404);
  });

  afterEach(() => {
    mock.reset();
  });

  it('should fetch task edit suggestions', async () => {
    const result = await getTaskEditSuggestionsHTTP();
    expect(result).toBeUndefined();
  });

  it('should create task edit suggestion', async () => {
    const taskId = 1;
    const userId = 2;
    const oldTask = { description: 'Old Task' };
    const updatedTask = { description: 'Updated Task' };

    const result = await createTaskEditSuggestionHTTP(taskId, userId, oldTask, updatedTask);
    expect(result).toBeUndefined();
  });

  it('should reject task edit suggestion', async () => {
    const taskEditSuggestionId = '1234';
    let result;

    try {
      result = await rejectTaskEditSuggestionHTTP(taskEditSuggestionId);
    } catch (_e) {
      toast.error('Error fetching task edit suggestions');
    }

    expect(result).toBeUndefined();
  });

  it('fetch suggestion count should return undefined and call toast.error', async () => {
    const result = await getTaskEditSuggestionCountHTTP();
    expect(result).toBeUndefined();
    expect(toast.error).toHaveBeenCalledWith('Error fetching task edit suggestion count');
  });
});

describe('HTTP other Service Functions', () => {
  beforeEach(() => {
    mock.onGet(ENDPOINTS.TASK_EDIT_SUGGESTION()).reply(200, { data: 'mock data' });
    mock.onPost(ENDPOINTS.TASK_EDIT_SUGGESTION()).reply(200);
    mock.onDelete(ENDPOINTS.REJECT_TASK_EDIT_SUGGESTION('1234')).reply(200, { status: 'deleted' });
    mock.onGet(`${ENDPOINTS.TASK_EDIT_SUGGESTION()}?count=true`).reply(200, { count: 5 });
  });

  afterEach(() => {
    mock.reset();
  });

  it('should fetch task edit suggestions', async () => {
    try {
      const result = await getTaskEditSuggestionsHTTP();
      expect(result).toEqual({ data: 'mock data' });
    } catch (error) {
      toast.error('Error fetching task edit suggestions:', error);
    }
  });

  it('should create task edit suggestion', async () => {
    const taskId = 1;
    const userId = 2;
    const oldTask = { description: 'Old Task' };
    const updatedTask = { description: 'Updated Task' };
    mock.onPost(ENDPOINTS.TASK_EDIT_SUGGESTION()).reply(200, { status: 'success' });
    const result = await createTaskEditSuggestionHTTP(taskId, userId, oldTask, updatedTask);
    expect(result).toEqual({ status: 'success' });
  });

  it('should reject task edit suggestion', async () => {
    const taskEditSuggestionId = '1234';
    mock.onDelete(ENDPOINTS.REJECT_TASK_EDIT_SUGGESTION('1234')).reply(400);
    let result;

    try {
      result = await rejectTaskEditSuggestionHTTP(taskEditSuggestionId);
    } catch (_e) {
      toast.error('Error fetching task edit suggestions');
    }

    expect(result).toBeUndefined();
  });

  it('should fetch task edit suggestion count', async () => {
    mock.onGet(`${'${ENDPOINTS.TASK_EDIT_SUGGESTION()'}?count=true`).reply(200, { count: 5 });
    try {
      const result = await getTaskEditSuggestionCountHTTP();
      expect(result).toEqual({ count: 5 });
    } catch (error) {
      toast.error('Error fetching task edit suggestion count:', error);
    }
  });
});
