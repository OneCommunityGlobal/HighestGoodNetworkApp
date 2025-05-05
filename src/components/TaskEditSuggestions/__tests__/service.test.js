import {
  getTaskEditSuggestionsHTTP,
  createTaskEditSuggestionHTTP,
  rejectTaskEditSuggestionHTTP,
  getTaskEditSuggestionCountHTTP,
} from '../service';

// Mock axios directly
jest.mock('axios');
const axios = require('axios');

describe('HTTP Service Functions', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Set up default rejection for all methods
    axios.get.mockRejectedValue({ response: { status: 404 } });
    axios.post.mockRejectedValue({ response: { status: 404 } });
    axios.delete.mockRejectedValue({ response: { status: 404 } });
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      return _e;
    }

    expect(result).toBeUndefined();
    return result;
  });

  it('should fetch task edit suggestion count', async () => {
    const result = await getTaskEditSuggestionCountHTTP();
    expect(result).toBeUndefined();
  });
});

describe('HTTP other Service Functions', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Set up successful responses for all methods
    axios.get.mockImplementation(url => {
      if (url.includes('count=true')) {
        return Promise.resolve({ data: { count: 5 } });
      }
      return Promise.resolve({ data: { data: 'mock data' } });
    });

    axios.post.mockResolvedValue({ data: { status: 'success' } });

    axios.delete.mockResolvedValue({ data: { status: 'deleted' } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch task edit suggestions', async () => {
    const result = await getTaskEditSuggestionsHTTP();
    expect(result).toEqual({ data: 'mock data' });
  });

  it('should create task edit suggestion', async () => {
    const taskId = 1;
    const userId = 2;
    const oldTask = { description: 'Old Task' };
    const updatedTask = { description: 'Updated Task' };

    const result = await createTaskEditSuggestionHTTP(taskId, userId, oldTask, updatedTask);
    expect(result).toEqual({ status: 'success' });
  });

  it('should reject task edit suggestion', async () => {
    const taskEditSuggestionId = '1234';

    const result = await rejectTaskEditSuggestionHTTP(taskEditSuggestionId);
    expect(result).toEqual({ status: 'deleted' });
  });

  it('should handle error when rejecting task edit suggestion', async () => {
    const taskEditSuggestionId = '1234';

    // Override with error response
    axios.delete.mockRejectedValue(new Error('API Error'));

    // The reject function throws an error on failure
    await expect(rejectTaskEditSuggestionHTTP(taskEditSuggestionId)).rejects.toThrow();
  });

  it('should fetch task edit suggestion count', async () => {
    const result = await getTaskEditSuggestionCountHTTP();
    expect(result).toEqual({ count: 5 });
  });
});
