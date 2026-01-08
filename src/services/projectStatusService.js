import httpService from './httpService';
import { ApiEndpoint } from '~/utils/URL';
import dayjs from 'dayjs';

const ApiUri = `${ApiEndpoint}/project-status`;

export const fetchProjectStatusSummary = async ({ startDate, endDate, token } = {}) => {
  if (!token) {
    throw new Error('Authentication token is required');
  }

  const params = new URLSearchParams();
  if (startDate) params.set('startDate', dayjs(startDate).format('YYYY-MM-DD'));
  if (endDate) params.set('endDate', dayjs(endDate).format('YYYY-MM-DD'));

  const url = `${ApiUri}/summary${params.toString() ? `?${params}` : ''}`;

  try {
    const res = await httpService.get(url);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch project status summary:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch project status data');
  }
};
