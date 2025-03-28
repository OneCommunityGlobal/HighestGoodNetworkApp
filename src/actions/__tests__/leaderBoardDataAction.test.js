import { getLeaderboardData, getOrgData } from '../leaderBoardData';
import { ENDPOINTS } from '../../utils/URL';
import httpService from '../../services/httpService';
import {
  getOrgData as getOrgDataActionCreator,
  getLeaderBoardData as getLeaderBoardDataActionCreator,
} from '../../constants/leaderBoardData';

jest.mock('../../services/httpService');

describe('leaderBoardActions', () => {
  let dispatch;

  beforeEach(() => {
    dispatch = jest.fn(); // Mock the dispatch function
    jest.clearAllMocks(); // Clear mocks before each test
  });

  describe('getLeaderboardData', () => {
    it('should fetch leaderboard data and dispatch the corresponding action', async () => {
      const userId = '123';
      const mockData = { leaderBoard: [] };
      httpService.get.mockResolvedValueOnce({ data: mockData }); // Mock HTTP GET response

      await getLeaderboardData(userId)(dispatch);

      expect(httpService.get).toHaveBeenCalledWith(ENDPOINTS.LEADER_BOARD(userId));
      expect(dispatch).toHaveBeenCalledWith(getLeaderBoardDataActionCreator(mockData));
    });
  });

  describe('getOrgData', () => {
    it('should fetch organization data and dispatch the corresponding action', async () => {
      const mockData = { organization: {} };
      httpService.get.mockResolvedValueOnce({ data: mockData }); // Mock HTTP GET response

      await getOrgData()(dispatch);

      expect(httpService.get).toHaveBeenCalledWith(ENDPOINTS.ORG_DATA);
      expect(dispatch).toHaveBeenCalledWith(getOrgDataActionCreator(mockData));
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully in getLeaderboardData', async () => {
      const userId = '123';
      httpService.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(getLeaderboardData(userId)(dispatch)).rejects.toThrow('Network error');
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully in getOrgData', async () => {
      httpService.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(getOrgData()(dispatch)).rejects.toThrow('Network error');
      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});
