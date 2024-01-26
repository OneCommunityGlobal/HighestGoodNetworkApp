import axios from axios;
import MockAdapter from 'axios-mock-adapter'; 
import{
  getTaskEditSuggestionsHTTP, 
  createTaskEditSuggestionHTTP, 
  rejectTaskEditSuggestionHTTP, 
  getTaskEditSuggestionCountHTTP,
}from '../service'; 


const mock = new MockAdapter(axios);

describe('HTTP Service Functions',()=>{ 
  beforeEach(()=>{
    // Mock all requests with a 404 error 
    mock.onAny().reply(404);  
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