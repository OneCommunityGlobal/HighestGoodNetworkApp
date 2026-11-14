import httpService from './httpService';
import { ApiEndpoint } from '~/utils/URL';
import dayjs from 'dayjs';

const ApiUri = `${ApiEndpoint}/project-status`;

// Day.js parses date-only years 0001-0099 as 1901-1999.
const formatDate = value =>
  typeof value === 'string' && /^00(?:0[1-9]|[1-9]\d)-\d{2}-\d{2}$/.test(value)
    ? value
    : dayjs(value).format('YYYY-MM-DD');

export const fetchProjectStatusSummary = async ({ startDate, endDate } = {}) => {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', formatDate(startDate));
  if (endDate) params.set('endDate', formatDate(endDate));

  const query = params.toString() ? `?${params}` : '';
  const url = `${ApiUri}/summary${query}`;

  try {
    const res = await httpService.get(url);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch project status data');
  }
};
