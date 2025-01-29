import axios from 'axios'; // Import axios for mocking
import {
  createOrUpdateTaskNotificationHTTP,
  createOrUpdateTaskNotification,
} from '../taskNotification'; // Import the functions to be tested
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
    const taskId = '123'; // Define a sample taskId
    const oldTask = { name: 'Old Task' }; // Define a sample oldTask
    const userIds = ['user1', 'user2']; // Define sample userIds
    const errorMessage = 'Network Error'; // Define a sample error message

    axios.post.mockRejectedValue(new Error(errorMessage)); // Mock axios.post to reject with an error
    console.log = jest.fn(); // Mock console.log

    await createOrUpdateTaskNotificationHTTP(taskId, oldTask, userIds); // Call the function

    expect(console.log).toHaveBeenCalledWith(
      `Error on create or update task notification with error: Error: ${errorMessage}`,
    ); // Assert that console.log was called with the correct error message
  });
});
