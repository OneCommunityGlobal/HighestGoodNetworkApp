import { ENDPOINTS } from '../../utils/URL';
import httpService from '../../services/httpService';

const getApplicationData = async (startDate, endDate, roles) => {
  try {
    const url = ENDPOINTS.APPLICATION_TIME_DATA(startDate, endDate, roles);
    const response = await httpService.get(url);

    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      // Fallback to mock data if backend doesn't return expected format
      console.warn('Backend returned unexpected data format, using mock data');
      return getMockData();
    }
  } catch (error) {
    console.error('Error fetching application time data:', error);
    // Fallback to mock data on error
    return getMockData();
  }
};

// Mock data fallback function
const getMockData = () => {
  const sampleData = [
    {
      role: 'Software Developer',
      timeToApply: 8,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: 'Software Developer',
      timeToApply: 12,
      timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: 'Software Developer',
      timeToApply: 9,
      timestamp: new Date(Date.now() - 51 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: 'Architect',
      timeToApply: 15,
      timestamp: new Date(Date.now() - 29 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: 'Architect',
      timeToApply: 18,
      timestamp: new Date(Date.now() - 74 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: 'Master Electrician',
      timeToApply: 25,
      timestamp: new Date(Date.now() - 56 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: 'Master Electrician',
      timeToApply: 22,
      timestamp: new Date(Date.now() - 97 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: 'Product Manager',
      timeToApply: 6,
      timestamp: new Date(Date.now() - 76 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: 'Product Manager',
      timeToApply: 9,
      timestamp: new Date(Date.now() - 122 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: 'Data Scientist',
      timeToApply: 13,
      timestamp: new Date(Date.now() - 102 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: 'Data Scientist',
      timeToApply: 11,
      timestamp: new Date(Date.now() - 147 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: 'UX Designer',
      timeToApply: 14,
      timestamp: new Date(Date.now() - 127 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: 'UX Designer',
      timeToApply: 16,
      timestamp: new Date(Date.now() - 172 * 60 * 60 * 1000).toISOString(),
    },
  ];
  return sampleData;
};

export default getApplicationData;
