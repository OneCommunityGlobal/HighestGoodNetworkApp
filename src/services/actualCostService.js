import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

const actualCostService = {
  // Get actual cost breakdown for a specific project
  getActualCostBreakdown: (projectId, fromDate, toDate) => {
    const params = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    return httpService.get(`${ApiEndpoint}/projects/${projectId}/actual-cost-breakdown`, {
      params,
    });
  },

  // Get all projects for the dropdown
  getAllProjects: () => {
    return httpService.get(`${ApiEndpoint}/projects`);
  },
};

export default actualCostService;
