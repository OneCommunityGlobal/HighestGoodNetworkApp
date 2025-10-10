import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

/**
 * Service for fetching country application data
 */
export const countryApplicationService = {
  /**
   * Fetch country application data with filters
   * @param {Object} params - Filter parameters
   * @param {Array} params.roles - Selected role IDs
   * @param {string} params.timeFrame - Time frame filter (WEEKLY, MONTHLY, YEARLY)
   * @param {string} params.startDate - Custom start date (YYYY-MM-DD)
   * @param {string} params.endDate - Custom end date (YYYY-MM-DD)
   * @param {boolean} params.customDateRange - Whether custom date range is used
   * @returns {Promise} API response with country data
   */
  async getCountryApplicationData(params = {}) {
    try {
      // Prepare parameters for the API call
      const cleanParams = {
        roles: params.roles && params.roles.length > 0 ? params.roles : undefined,
        timeFrame: params.timeFrame && params.timeFrame !== 'ALL' ? params.timeFrame : undefined,
        startDate: params.startDate ? params.startDate : undefined,
        endDate: params.endDate ? params.endDate : undefined,
        customDateRange: params.customDateRange ? true : undefined,
      };

      // Remove undefined parameters
      Object.keys(cleanParams).forEach(
        key => cleanParams[key] === undefined && delete cleanParams[key],
      );

      const response = await axios.get(ENDPOINTS.COUNTRY_APPLICATION_DATA(cleanParams), {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching country application data:', error);
      throw error;
    }
  },

  /**
   * Get mock data for development/testing
   * @returns {Object} Mock country data
   */
  getMockData() {
    return {
      countries: [
        {
          countryCode: 'US',
          applicationCount: 417,
          previousCount: 380,
          countryName: 'United States',
        },
        { countryCode: 'IN', applicationCount: 410, previousCount: 390, countryName: 'India' },
        { countryCode: 'AU', applicationCount: 28, previousCount: 25, countryName: 'Australia' },
        { countryCode: 'BR', applicationCount: 19, previousCount: 18, countryName: 'Brazil' },
        { countryCode: 'CA', applicationCount: 11, previousCount: 10, countryName: 'Canada' },
        {
          countryCode: 'GB',
          applicationCount: 19,
          previousCount: 17,
          countryName: 'United Kingdom',
        },
        { countryCode: 'DE', applicationCount: 5, previousCount: 4, countryName: 'Germany' },
        { countryCode: 'FR', applicationCount: 5, previousCount: 4, countryName: 'France' },
        { countryCode: 'CN', applicationCount: 20, previousCount: 18, countryName: 'China' },
        { countryCode: 'JP', applicationCount: 2, previousCount: 1, countryName: 'Japan' },
        { countryCode: 'SG', applicationCount: 5, previousCount: 4, countryName: 'Singapore' },
        { countryCode: 'ZA', applicationCount: 2, previousCount: 1, countryName: 'South Africa' },
        { countryCode: 'NG', applicationCount: 11, previousCount: 10, countryName: 'Nigeria' },
        { countryCode: 'KE', applicationCount: 19, previousCount: 17, countryName: 'Kenya' },
        { countryCode: 'MX', applicationCount: 8, previousCount: 7, countryName: 'Mexico' },
        { countryCode: 'AR', applicationCount: 6, previousCount: 5, countryName: 'Argentina' },
        { countryCode: 'IT', applicationCount: 4, previousCount: 3, countryName: 'Italy' },
        { countryCode: 'ES', applicationCount: 3, previousCount: 2, countryName: 'Spain' },
        { countryCode: 'NL', applicationCount: 7, previousCount: 6, countryName: 'Netherlands' },
        { countryCode: 'SE', applicationCount: 3, previousCount: 2, countryName: 'Sweden' },
      ],
    };
  },
};

export default countryApplicationService;
