import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

const ApiUri = `${ApiEndpoint}/`;

const getCostBreakdown = (projectId, fromDate = null, toDate = null) => {
  let url = `${ApiUri}/project/${projectId}/cost-breakdown`;

  if (fromDate || toDate) {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    url += `?${params.toString()}`;
  }

  return httpService.get(url);
};

const createCostBreakdown = (projectId, costs) => {
  return httpService.post(`${ApiUri}/project/cost-breakdown`, {
    projectId,
    costs,
  });
};

const addCostEntry = (projectId, costEntry) => {
  return httpService.post(`${ApiUri}/project/${projectId}/cost-breakdown/entry`, costEntry);
};

const updateCostEntry = (projectId, costId, costEntry) => {
  return httpService.put(
    `${ApiUri}/project/${projectId}/cost-breakdown/entry/${costId}`,
    costEntry,
  );
};

const getAllCostBreakdowns = () => {
  return httpService.get(`${ApiUri}/cost-breakdowns`);
};

const deleteCostBreakdown = projectId => {
  return httpService.delete(`${ApiUri}/project/${projectId}/cost-breakdown`);
};

export default {
  getCostBreakdown,
  createCostBreakdown,
  addCostEntry,
  updateCostEntry,
  getAllCostBreakdowns,
  deleteCostBreakdown,
};
