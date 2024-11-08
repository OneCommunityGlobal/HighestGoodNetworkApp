import axios from 'axios';
import MockAdapter from 'axios-mock-adapter'; 
import { ENDPOINTS } from 'utils/URL';
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
    const result = await getTaskEditSuggestionsHTTP().catch(() => undefined); 
    expect(result).toBeUndefined();
  });
  
  it('should create task edit suggestion', async () => { 
    const taskId = 1;
    const userId = 2;
    const oldTask = { description: "Old Task" };
    const updatedTask = { description: "Updated Task" };

    const result = await createTaskEditSuggestionHTTP(taskId, userId, oldTask, updatedTask).catch(() => undefined);
    expect(result).toBeUndefined();
  });

  it('should reject task edit suggestion', async () => {
    const taskEditSuggestionId = '1234';
    const result = await rejectTaskEditSuggestionHTTP(taskEditSuggestionId).catch(() => undefined);

    expect(result).toBeUndefined();
  });

  it('should fetch task edit suggestion count', async () => {
    const result = await getTaskEditSuggestionCountHTTP().catch(() => undefined);
    expect(result).toBeUndefined();
  });
});

describe('HTTP other Service Functions', () => {
  beforeEach(() => {
    mock.onGet(ENDPOINTS.TASK_EDIT_SUGGESTION()).reply(200, { data: 'mock data' });
    mock.onPost(ENDPOINTS.TASK_EDIT_SUGGESTION()).reply(200, { status: 'success' });
    mock.onDelete(ENDPOINTS.REJECT_TASK_EDIT_SUGGESTION('1234')).reply(400);
    mock.onGet(`${ENDPOINTS.TASK_EDIT_SUGGESTION()}?count=true`).reply(200, { count: 5 }); 
  });
  
  afterEach(() => { 
    mock.reset(); 
  });

  it('should fetch task edit suggestions', async () => { 
    const result = await getTaskEditSuggestionsHTTP().catch(() => undefined);
    expect(result).toEqual({ data: 'mock data' });
  });
  
  it('should create task edit suggestion', async () => { 
    const taskId = 1;
    const userId = 2;
    const oldTask = { description: "Old Task" };
    const updatedTask = { description: "Updated Task" };

    const result = await createTaskEditSuggestionHTTP(taskId, userId, oldTask, updatedTask).catch(() => undefined);
    expect(result).toEqual({ status: 'success' });
  });

  it('should reject task edit suggestion', async () => {
    const taskEditSuggestionId = '1234';
    const result = await rejectTaskEditSuggestionHTTP(taskEditSuggestionId).catch(() => undefined);

    expect(result).toBeUndefined();
  });

  it('should fetch task edit suggestion count', async () => {
    const result = await getTaskEditSuggestionCountHTTP().catch(() => undefined);
    expect(result).toEqual({ count: 5 });
  });  
});
