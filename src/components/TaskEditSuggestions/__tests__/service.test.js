import axios from 'axios';
import MockAdapter from 'axios-mock-adapter'; 
import{
  getTaskEditSuggestionsHTTP, 
  createTaskEditSuggestionHTTP, 
  rejectTaskEditSuggestionHTTP, 
  getTaskEditSuggestionCountHTTP,
}from '../service'; 
import { ENDPOINTS } from 'utils/URL';



const mock = new MockAdapter(axios);

describe('HTTP Service Functions',()=>{ 
  beforeEach(()=>{
    // Mock all requests with a 404 error 
    mock.onAny().reply(404); 
    mock.onGet(ENDPOINTS.TASK_EDIT_SUGGESTION()).reply(200, { data: 'mock data' });
    mock.onPost(ENDPOINTS.TASK_EDIT_SUGGESTION()).reply(200);
    mock.onDelete(/\/taskeditsuggestion\/\d+/).reply(200);
    mock.onGet(`${ENDPOINTS.TASK_EDIT_SUGGESTION()}?count=true`).reply(200, { count: 5 }); 
  });
  
  afterEach(()=>{ 
    mock.reset(); 
  });
  
  it('should fetch task edit suggestions', async ()=> { 
    const result = await getTaskEditSuggestionsHTTP(); 
    expect(result).toBeUndefined();
  
  });
  
  it('should create task edit suggestion', async () => { 
    const taskId = 1;
    const userId = 2;
    const oldTask = { description: "Old Task" };
    const updatedTask = { description: "Updated Task" };

    const result = await createTaskEditSuggestionHTTP(taskId, userId, oldTask, updatedTask);
    expect(result).toBeUndefined();
  });

  it('should reject task edit suggestion', async () => {
    const taskEditSuggestionId = '1234';
    const result = await rejectTaskEditSuggestionHTTP(taskEditSuggestionId);
    expect(result).toBeUndefined();
  });

  it('should fetch task edit suggestion count', async () => {
    const result = await getTaskEditSuggestionCountHTTP();
    expect(result).toBeUndefined();
  });
});

describe('HTTP other Service Functions', () => {
  beforeEach(()=>{
    mock.onGet('${APIEndpoint}/taskeditsuggestion').reply(200, { data: 'mock data' });
    mock.onPost('${APIEndpoint}/taskeditsuggestion').reply(200);
    mock.onDelete(/\/taskeditsuggestion\/\d+/).reply(200);
    mock.onGet(`${'${APIEndpoint}/taskeditsuggestion'}?count=true`).reply(200, { count: 5 }); 
  });
  
  afterEach(()=>{ 
    mock.reset(); 
  });
  it('should fetch task edit suggestions', async ()=> { 
    try {
      const result = await getTaskEditSuggestionsHTTP();
      console.log('Received result:', result); // Log the actual result
      expect(result).toEqual({ data: 'mock data' });
  } catch (error) {
      console.error('Error fetching task edit suggestions:', error);
  }
    
  });
  
  it('should create task edit suggestion', async () => { 
    const taskId = 1;
    const userId = 2;
    const oldTask = { description: "Old Task" };
    const updatedTask = { description: "Updated Task" };
    mock.onPost('${APIEndpoint}/taskeditsuggestion').reply(200, { status: 'success' });

    const result = await createTaskEditSuggestionHTTP(taskId, userId, oldTask, updatedTask);
    expect(result).toEqual({ status: 'success' });
  });

  it('should reject task edit suggestion', async () => {
    const taskEditSuggestionId = '1234';
    const result = await rejectTaskEditSuggestionHTTP(taskEditSuggestionId);
    expect(result).toEqual({ status: 'deleted' });
  });

  it('should fetch task edit suggestion count', async () => {
    try {
      mock.onGet(`${$APIEndpoint}/taskeditsuggestion?count=true`).reply(200, { count: 5 });
      const result = await getTaskEditSuggestionCountHTTP();
      expect(result).toEqual({ count: 5 });
  } catch (error) {
      console.error('Error fetching task edit suggestion count:', error);
  }
  });  


});