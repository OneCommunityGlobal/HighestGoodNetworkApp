import axios from 'axios'; // Import axios for mocking
import { createOrUpdateTaskNotificationHTTP } from '../taskNotification'; // Import the function to be tested
import { ENDPOINTS } from '../../utils/URL'; // Import the endpoints
jest.mock('axios'); // Mock axios
describe('createOrUpdateTaskNotificationHTTP', () => {
  it('should post the correct payload to the endpoint', async () => {
    const taskId = '123'; // Define a sample taskId
    const oldTask = { name: 'Old Task' }; // Define a sample oldTask
    const userIds = ['user1', 'user2']; // Define sample userIds
    const payload = { oldTask, userIds }; // Define the expected payload
    const endpoint = ENDPOINTS.CREATE_OR_UPDATE_TASK_NOTIFICATION(taskId); // Define the expected endpoint
    axios.post.mockResolvedValue({}); // Mock axios.post to resolve successfully
    await createOrUpdateTaskNotificationHTTP(taskId, oldTask, userIds); // Call the function
    expect(axios.post).toHaveBeenCalledWith(endpoint, payload); // Assert that axios.post was called with the correct arguments
  });
  it('should log an error message if the request fails', async () => {
    const taskId = '123';
    const oldTask = { name: 'Old Task' };
    const userIds = ['user1', 'user2'];
    const errorMessage = 'Network Error';
    axios.post.mockRejectedValue(new Error(errorMessage));
    console.log = jest.fn();
    await createOrUpdateTaskNotificationHTTP(taskId, oldTask, userIds);
    expect(console.log).toHaveBeenCalledWith(`Error on create or update task notification with error: Error: ${errorMessage}`);
  });
});