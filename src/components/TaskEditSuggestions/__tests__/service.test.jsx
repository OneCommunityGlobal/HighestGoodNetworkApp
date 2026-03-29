import axios from 'axios';
import {
  getTaskEditSuggestionsHTTP,
  createTaskEditSuggestionHTTP,
  rejectTaskEditSuggestionHTTP,
  getTaskEditSuggestionCountHTTP,
} from '../service';

// mock out axios completely
vi.mock('axios');

describe('TaskEditSuggestions HTTP Service', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('fetches task edit suggestions successfully', async () => {
    const payload = { data: 'mock data' };
    axios.get.mockResolvedValue({ data: payload });

    const result = await getTaskEditSuggestionsHTTP();
    expect(axios.get).toHaveBeenCalledWith(expect.any(String));
    expect(result).toEqual(payload);
  });

  it('returns undefined when fetching suggestions fails', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    const result = await getTaskEditSuggestionsHTTP();
    expect(result).toBeUndefined();
  });

  it('creates task edit suggestion and returns response data', async () => {
    const taskId = 1;
    const userId = 2;
    const oldTask = { description: 'Old' };
    const updatedTask = { description: 'New' };
    const payload = { suggestionId: 'abcd1234', status: 'pending' };

    axios.post.mockResolvedValue({ data: payload });

    const result = await createTaskEditSuggestionHTTP(taskId, userId, oldTask, updatedTask);

    expect(axios.post).toHaveBeenCalledWith(expect.any(String), {
      taskId,
      userId,
      oldTask,
      newTask: updatedTask,
    });
    expect(result).toEqual(payload);
  });

  it('returns undefined when create suggestion fails', async () => {
    axios.post.mockRejectedValue(new Error('Server error'));

    const result = await createTaskEditSuggestionHTTP(1, 2, {}, {});
    expect(result).toBeUndefined();
  });

  it('rejects task edit suggestion and returns response data', async () => {
    const suggestionId = '1234';
    const payload = { status: 'deleted' };

    axios.delete.mockResolvedValue({ data: payload });

    const result = await rejectTaskEditSuggestionHTTP(suggestionId);
    expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining(suggestionId));
    expect(result).toEqual(payload);
  });

  it('throws when reject suggestion endpoint errors', async () => {
    axios.delete.mockRejectedValue(new Error('Bad request'));
    await expect(rejectTaskEditSuggestionHTTP('1234')).rejects.toThrow('Bad request');
  });

  it('fetches suggestion count successfully', async () => {
    const payload = { count: 5 };
    axios.get.mockResolvedValue({ data: payload });

    const result = await getTaskEditSuggestionCountHTTP();
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('?count=true'));
    expect(result).toEqual(payload);
  });

  it('returns undefined when fetching suggestion count fails', async () => {
    axios.get.mockRejectedValue(new Error('Timeout'));

    const result = await getTaskEditSuggestionCountHTTP();
    expect(result).toBeUndefined();
  });
});
