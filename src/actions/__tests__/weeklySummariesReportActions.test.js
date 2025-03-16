import axios from "axios";
import * as actions from '../../constants/weeklySummariesReport';
import * as weeklySummaryReport from '../weeklySummariesReport';
import { ENDPOINTS } from '../../utils/URL';

jest.mock('axios');

describe('Weekly Summaries Report Actions',() => {
  
  it('Should return action FETCH_SUMMARIES_REPORT_BEGIN', () => {

    const data = weeklySummaryReport.fetchWeeklySummariesReportBegin();
    expect(data).toEqual({ type: actions.FETCH_SUMMARIES_REPORT_BEGIN });

  });

  it('Should return action FETCH_SUMMARIES_REPORT_SUCCESS',() => {

    const weeklySummariesData = {
      id: 1,
      dueDate: "2024-12-29",
      summary: "Weekly Summary"
    };

    const data = weeklySummaryReport.fetchWeeklySummariesReportSuccess(weeklySummariesData);
    
    const expectedResult = {
      type: actions.FETCH_SUMMARIES_REPORT_SUCCESS,
      payload: { weeklySummariesData }
    }

    expect(data).toEqual(expectedResult);

  });

  it('Should return action FETCH_SUMMARIES_REPORT_ERROR',() => {

    const error = {}

    const data = weeklySummaryReport.fetchWeeklySummariesReportError(error);

    expect(data).toEqual({
      type:actions.FETCH_SUMMARIES_REPORT_ERROR,
      payload: {error}
    });

  })

});

describe('Weekly Summary Report', () => {

  const dispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Get Weekly Summaries Report', () => {

    it('Should dispatch actions and return 200 on successful API call ', async() => {
  
      const mockData = {
        'weeklySummaries' : [
          {
            id: "1",
            dueDate: "2024-12-29",
            summary: "Week1 Summary"
          }
        ]
      }
  
      axios.get.mockResolvedValue({ data: mockData, status:200 });

      const result = await weeklySummaryReport.getWeeklySummariesReport()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(weeklySummaryReport.fetchWeeklySummariesReportBegin());
      expect(dispatch).toHaveBeenCalledWith(weeklySummaryReport.fetchWeeklySummariesReportSuccess(result.data));
      expect(result.status).toBe(200);

    });
  
    it('Should dispatch error action when GET request fails', async() => {
  
      const mockError = { response : { status: 500 } };
      axios.get.mockRejectedValueOnce(mockError);

      const result = await weeklySummaryReport.getWeeklySummariesReport()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(weeklySummaryReport.fetchWeeklySummariesReportBegin());
      expect(dispatch).toHaveBeenCalledWith(weeklySummaryReport.fetchWeeklySummariesReportError(mockError))
      expect(result).toBe(500);

    });
  
  });
  

  describe('Update One Summary Report', () => {

    let mockUserProfile, updatedField;

    beforeEach(() => {

      mockUserProfile = {
        firstName: 'User First Name',
        lastName: 'User Last Name',
        weeklySummariesCount : 0,
        weeklySummaries:[
          {
            id: "1",
            dueDate: "2024-12-29",
            summary: "Weekly Summary Week1"
          }
        ]
      }

      updatedField = {

        weeklySummaries: [
          {
            id: "2",
            dueDate: "2025-01-05",
            summary: "Weekly Summary Week2"
          },
        ]

      };

    });

    it('Should successfully update user profile with weekly summary and dispatch UPDATE_SUMMARY_REPORT action ', async() => {

      axios.get.mockResolvedValue({ data: mockUserProfile });
      axios.put.mockResolvedValue({ 
        status: 200 
      });

      const result = await weeklySummaryReport.updateOneSummaryReport(1, updatedField )(dispatch);
      expect(result.status).toBe(200);
      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.USER_PROFILE(1));
      expect(axios.put).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(weeklySummaryReport.updateSummaryReport({ _id: 1, updatedField }));

    });

    it('Should throw error when PUT request fails', async() => {

      axios.get.mockResolvedValue({ data: mockUserProfile });
      axios.put.mockResolvedValue({ 
        status: 500 
      });

      const result = weeklySummaryReport.updateOneSummaryReport(1, updatedField );
      await expect(result(dispatch)).rejects.toThrow( new Error ('An error occurred while attempting to save the changes to the profile.'));

    });

    it('Should throw error when GET request fails', async() => {

      axios.get.mockRejectedValue(new Error('Failed to fetch user profile'));

      const result = weeklySummaryReport.updateOneSummaryReport(1, updatedField );
      await expect(result(dispatch)).rejects.toThrow( new Error('Failed to fetch user profile') );
      
    });

  });
});