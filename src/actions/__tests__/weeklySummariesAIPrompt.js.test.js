import axios from 'axios'; // Import axios for mocking HTTP requests
import { getDashboardDataAI, updateDashboardData, updateCopiedPromptDate, getCopiedDateOfPrompt } from '../weeklySummariesAIPrompt'; // Import the actions to be tested
import { getAIPrompt, updateAIPrompt, updateCopiedPrompt, getCopiedPromptDate } from '../../constants/weeklySummariesAIPrompt'; // Import the action creators

jest.mock('axios'); // Mock axios to control its behavior in tests

describe('getDashboardDataAI', () => {
  it('should dispatch getAIPrompt with data on success', async () => {
    const mockData = { prompt: 'AI Prompt' }; // Mock data to be returned by axios
    axios.get.mockResolvedValue({ data: mockData }); // Mock axios.get to resolve with mock data

    const dispatch = jest.fn(); // Mock dispatch function
    await getDashboardDataAI()(dispatch); // Call the action with the mock dispatch

    expect(axios.get).toHaveBeenCalledWith(expect.any(String)); // Assert axios.get was called with any URL
    expect(dispatch).toHaveBeenCalledWith(getAIPrompt(mockData)); // Assert dispatch was called with the correct action
  });

  it('should dispatch getAIPrompt with undefined on failure', async () => {
    axios.get.mockRejectedValue(new Error('Network Error')); // Mock axios.get to reject with an error

    const dispatch = jest.fn(); // Mock dispatch function
    await getDashboardDataAI()(dispatch); // Call the action with the mock dispatch

    expect(axios.get).toHaveBeenCalledWith(expect.any(String)); // Assert axios.get was called with any URL
    expect(dispatch).toHaveBeenCalledWith(getAIPrompt(undefined)); // Assert dispatch was called with the correct action
  });
});

describe('updateDashboardData', () => {
  it('should dispatch updateAIPrompt with textPrompt on success', async () => {
    const textPrompt = 'New AI Prompt'; // Mock text prompt
    axios.put.mockResolvedValue({ status: 200 }); // Mock axios.put to resolve with a success status

    const dispatch = jest.fn(); // Mock dispatch function
    await updateDashboardData(textPrompt)(dispatch); // Call the action with the mock dispatch

    expect(axios.put).toHaveBeenCalledWith(expect.any(String), { aIPromptText: textPrompt }); // Assert axios.put was called with the correct URL and data
    expect(dispatch).toHaveBeenCalledWith(updateAIPrompt(textPrompt)); // Assert dispatch was called with the correct action
  });
});

describe('updateCopiedPromptDate', () => {
  it('should dispatch updateCopiedPrompt with userId on success', async () => {
    const userId = '12345'; // Mock user ID
    axios.put.mockResolvedValue({ status: 200 }); // Mock axios.put to resolve with a success status

    const dispatch = jest.fn(); // Mock dispatch function
    await updateCopiedPromptDate(userId)(dispatch); // Call the action with the mock dispatch

    expect(axios.put).toHaveBeenCalledWith(expect.any(String)); // Assert axios.put was called with the correct URL
    expect(dispatch).toHaveBeenCalledWith(updateCopiedPrompt(userId)); // Assert dispatch was called with the correct action
  });
});

describe('getCopiedDateOfPrompt', () => {
  it('should dispatch getCopiedPromptDate with data on success', async () => {
    const userId = '12345'; // Mock user ID
    const mockData = { message: '2023-10-01' }; // Mock data to be returned by axios
    axios.get.mockResolvedValue({ data: mockData }); // Mock axios.get to resolve with mock data

    const dispatch = jest.fn(); // Mock dispatch function
    await getCopiedDateOfPrompt(userId)(dispatch); // Call the action with the mock dispatch

    expect(axios.get).toHaveBeenCalledWith(expect.any(String)); // Assert axios.get was called with the correct URL
    expect(dispatch).toHaveBeenCalledWith(getCopiedPromptDate(mockData.message)); // Assert dispatch was called with the correct action
  });

  it('should dispatch getCopiedPromptDate with undefined on failure', async () => {
    const userId = '12345'; // Mock user ID
    axios.get.mockRejectedValue(new Error('Network Error')); // Mock axios.get to reject with an error

    const dispatch = jest.fn(); // Mock dispatch function
    await getCopiedDateOfPrompt(userId)(dispatch); // Call the action with the mock dispatch

    expect(axios.get).toHaveBeenCalledWith(expect.any(String)); // Assert axios.get was called with the correct URL
    expect(dispatch).toHaveBeenCalledWith(getCopiedPromptDate(undefined)); // Assert dispatch was called with the correct action
  });
});
