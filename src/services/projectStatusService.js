import httpService from './httpService';
import { ApiEndpoint } from '~/utils/URL';
import dayjs from 'dayjs';

const ApiUri = `${ApiEndpoint}/project-status`;

export const fetchProjectStatusSummary = async ({ startDate, endDate } = {}) => {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', dayjs(startDate).format('YYYY-MM-DD'));
  if (endDate) params.set('endDate', dayjs(endDate).format('YYYY-MM-DD'));

  const url = `${ApiUri}/summary${params.toString() ? `?${params}` : ''}`;

  // Always return just the data portion
  const res = await httpService.get(url);
  return res.data; // ✅ ensures only JSON body is returned
};
