import axios from 'axios';
import * as actions from '../../constants/weeklySummaries';
import { ENDPOINTS } from '../../utils/URL';
import { fetchWeeklySummariesBegin, fetchWeeklySummariesSuccess, fetchWeeklySummariesError, getWeeklySummaries, updateWeeklySummaries } from '../weeklySummaries'
import { getUserProfileActionCreator } from '../../actions/userProfile';


jest.mock('axios');


describe('Weekly Summaries Action',() => {

  it('Should return action FETCH_WEEKLY_SUMMARIES_BEGIN', () => {
    
    const data = fetchWeeklySummariesBegin();

    expect(data).toEqual( {type: actions.FETCH_WEEKLY_SUMMARIES_BEGIN });
    
  });

  it('Should fetch weekly summaries success', () => {
    
    const weeklySummariesData = {
      id: 1,
      dueDate: "2024-12-29",
      summary: "Weekly Summary"
    };

    const result = fetchWeeklySummariesSuccess(weeklySummariesData);

    const expecteResult = {
      type: actions.FETCH_WEEKLY_SUMMARIES_SUCCESS,
      payload : {weeklySummariesData}
    }

    expect(result).toEqual(expecteResult);
  
  });

  it('Should return action FETCH_WEEKLY_SUMMARIES_ERROR ', () => {

    const error = {};
    const result = fetchWeeklySummariesError(error);

    expect(result).toEqual({ 
      type: actions.FETCH_WEEKLY_SUMMARIES_ERROR,
      payload: {error}
    });
  })

});

describe('Weekly Summaries', () => {
  
  jest.mock('axios');
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Get Weekly Summaries', () => {

    it('Should dispatch actions and return status 200 on successful API call', async() => {

      const mockData = {
        weeklySummariesCount : 1,
        weeklySummaries: [
          {
            id: "1",
            dueDate: "2024-12-29",
            summary: "Weekly Summary"
          }
        ],
        mediaUrl: 'http://media.com',
        adminLinks: [{ Name: 'Media Folder', Link: 'http://newmedia.com' }]
      }

      axios.get.mockResolvedValue({ data: mockData, status:200 });
    
      const result = await getWeeklySummaries(1)(dispatch);
      
      expect(dispatch).toHaveBeenCalledWith(fetchWeeklySummariesBegin());
      expect(dispatch).toHaveBeenCalledWith(fetchWeeklySummariesSuccess({
        weeklySummariesCount:1, 
        weeklySummaries:[
          {
            id: "1",
            dueDate: "2024-12-29",
            summary: "Weekly Summary"
          }
        ],
        mediaUrl: 'http://newmedia.com'
      }));

      expect(dispatch).toHaveBeenCalledWith(getUserProfileActionCreator(mockData));
      expect(result).toBe(200);

    });

    it('Should dispatch an error action when GET request fails', async() => {

      const mockError = { response : { status: 500 } };
      axios.get.mockRejectedValueOnce(mockError);

      const result = await getWeeklySummaries(1)(dispatch);
      
      expect(dispatch).toHaveBeenCalledWith(fetchWeeklySummariesBegin());
      expect(dispatch).toHaveBeenCalledWith(fetchWeeklySummariesError(mockError));
      expect(result).toBe(500);
    })
    
  });

  describe('Update Weekly Summaries', () => {
    
    it('Should successfully update weekly summaries and return status 200', async() => {

      const mockUserProfile = {
        firstName: 'User First Name',
        lastName: 'User Last Name',
        weeklySummariesCount : 0,
        weeklySummaries:[]
      }

      const weeklySummariesData = {
        weeklySummariesCount : 1,
        weeklySummaries: [
          {
            id: "1",
            dueDate: "2025-01-05",
            summary: "Weekly Summary Week1"
          },
        ],
        mediaUrl: 'http://media.com'
      }
  
      axios.get.mockResolvedValue({ data: mockUserProfile });
      axios.put.mockResolvedValue({ status: 200 });

      const result = await updateWeeklySummaries(1, weeklySummariesData )(dispatch);
      expect(result).toBe(200);
      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.USER_PROFILE(1));
      expect(axios.put).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(getUserProfileActionCreator({
        ...mockUserProfile,
        'adminLinks' : [{ Name: 'Media Folder', Link: 'http://media.com' }] ,
        ...weeklySummariesData
      }));

    });

    it('Ensure that if the "Media Folder" link already exists, it should be updated correctly.', async() => {

      const mockUserProfile = {
        firstName: 'User First Name',
        lastName: 'User Last Name',
        weeklySummariesCount : 0,
        weeklySummaries:[],
        'adminLinks' : [{ Name: 'Media Folder', Link: 'http://media.com' }]
      }

      const weeklySummariesData = {
        weeklySummariesCount : 1,
        weeklySummaries: [
          {
            id: "1",
            dueDate: "2025-01-05",
            summary: "Weekly Summary Week1"
          },
        ],
        mediaUrl: 'http://newmedia.com'
      }

      axios.get.mockResolvedValue({ data: mockUserProfile });
      axios.put.mockResolvedValue({ status: 200 });

      const result = await updateWeeklySummaries(1, weeklySummariesData )(dispatch);
      expect(result).toBe(200);
      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.USER_PROFILE(1));
      expect(axios.put).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(getUserProfileActionCreator({
        ...mockUserProfile,
        'adminLinks' : [{ Name: 'Media Folder', Link: 'http://newmedia.com' }] ,
        ...weeklySummariesData
      }));

    });

    it('Should throw error when API request fails', async() => {

      const mockError = { response : { status: 500 } };
      axios.get.mockRejectedValueOnce(mockError);

      const result = await updateWeeklySummaries(1, { 
        mediaUrl: 'http://newmedia.com', 
        weeklySummaries: [], 
        weeklySummariesCount: 2 })(dispatch);
      
      expect(dispatch).not.toHaveBeenCalled();
      expect(result).toBe(500);

    });

  });
  
});
