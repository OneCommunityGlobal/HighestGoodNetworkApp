import axios from 'axios';

// Mock data service - replace with actual API endpoints
const mockCountryApplicationData = [
  {
    country: 'United States of America',
    applications: 1250,
    previousPeriod: 1100,
    roles: {
      'Software Developer': 450,
      'Project Manager': 200,
      'Data Analyst': 180,
      'UX Designer': 150,
      'Marketing Specialist': 120,
      'Content Writer': 80,
      'DevOps Engineer': 70,
    },
  },
  {
    country: 'Canada',
    applications: 450,
    previousPeriod: 420,
    roles: {
      'Software Developer': 180,
      'Project Manager': 80,
      'Data Analyst': 70,
      'UX Designer': 60,
      'Marketing Specialist': 40,
      'Content Writer': 20,
    },
  },
  {
    country: 'United Kingdom',
    applications: 380,
    previousPeriod: 350,
    roles: {
      'Software Developer': 150,
      'Project Manager': 70,
      'Data Analyst': 60,
      'UX Designer': 50,
      'Marketing Specialist': 35,
      'Content Writer': 15,
    },
  },
  {
    country: 'Germany',
    applications: 320,
    previousPeriod: 300,
    roles: {
      'Software Developer': 130,
      'Project Manager': 60,
      'Data Analyst': 50,
      'UX Designer': 45,
      'Marketing Specialist': 25,
      'Content Writer': 10,
    },
  },
  {
    country: 'France',
    applications: 280,
    previousPeriod: 260,
    roles: {
      'Software Developer': 120,
      'Project Manager': 50,
      'Data Analyst': 40,
      'UX Designer': 35,
      'Marketing Specialist': 25,
      'Content Writer': 10,
    },
  },
  {
    country: 'Australia',
    applications: 250,
    previousPeriod: 230,
    roles: {
      'Software Developer': 100,
      'Project Manager': 45,
      'Data Analyst': 35,
      'UX Designer': 30,
      'Marketing Specialist': 25,
      'Content Writer': 15,
    },
  },
  {
    country: 'Japan',
    applications: 200,
    previousPeriod: 190,
    roles: {
      'Software Developer': 80,
      'Project Manager': 40,
      'Data Analyst': 30,
      'UX Designer': 25,
      'Marketing Specialist': 15,
      'Content Writer': 10,
    },
  },
  {
    country: 'Brazil',
    applications: 180,
    previousPeriod: 170,
    roles: {
      'Software Developer': 70,
      'Project Manager': 35,
      'Data Analyst': 25,
      'UX Designer': 20,
      'Marketing Specialist': 20,
      'Content Writer': 10,
    },
  },
  {
    country: 'India',
    applications: 160,
    previousPeriod: 150,
    roles: {
      'Software Developer': 60,
      'Project Manager': 30,
      'Data Analyst': 25,
      'UX Designer': 20,
      'Marketing Specialist': 15,
      'Content Writer': 10,
    },
  },
  {
    country: 'South Africa',
    applications: 140,
    previousPeriod: 130,
    roles: {
      'Software Developer': 50,
      'Project Manager': 25,
      'Data Analyst': 20,
      'UX Designer': 15,
      'Marketing Specialist': 20,
      'Content Writer': 10,
    },
  },
  {
    country: 'Mexico',
    applications: 120,
    previousPeriod: 110,
    roles: {
      'Software Developer': 45,
      'Project Manager': 20,
      'Data Analyst': 15,
      'UX Designer': 15,
      'Marketing Specialist': 15,
      'Content Writer': 10,
    },
  },
  {
    country: 'Italy',
    applications: 100,
    previousPeriod: 95,
    roles: {
      'Software Developer': 40,
      'Project Manager': 18,
      'Data Analyst': 12,
      'UX Designer': 12,
      'Marketing Specialist': 10,
      'Content Writer': 8,
    },
  },
  {
    country: 'Spain',
    applications: 90,
    previousPeriod: 85,
    roles: {
      'Software Developer': 35,
      'Project Manager': 16,
      'Data Analyst': 10,
      'UX Designer': 10,
      'Marketing Specialist': 10,
      'Content Writer': 9,
    },
  },
  {
    country: 'Netherlands',
    applications: 80,
    previousPeriod: 75,
    roles: {
      'Software Developer': 30,
      'Project Manager': 15,
      'Data Analyst': 10,
      'UX Designer': 10,
      'Marketing Specialist': 10,
      'Content Writer': 5,
    },
  },
  {
    country: 'Sweden',
    applications: 70,
    previousPeriod: 65,
    roles: {
      'Software Developer': 25,
      'Project Manager': 12,
      'Data Analyst': 8,
      'UX Designer': 8,
      'Marketing Specialist': 10,
      'Content Writer': 7,
    },
  },
];

// Available roles
const availableRoles = [
  'Software Developer',
  'Project Manager',
  'Data Analyst',
  'UX Designer',
  'Marketing Specialist',
  'Content Writer',
  'DevOps Engineer',
  'Product Manager',
  'QA Tester',
  'Business Analyst',
];

/**
 * Fetch country application data based on filters
 * @param {Object} filters - Filter options
 * @param {string} filters.dateFilter - 'weekly', 'monthly', 'yearly', or 'custom'
 * @param {string} filters.startDate - Start date for custom range
 * @param {string} filters.endDate - End date for custom range
 * @param {Array<string>} filters.selectedRoles - Array of selected roles
 * @returns {Promise<Array>} Country application data
 */
export const fetchCountryApplicationData = async (filters = {}) => {
  try {
    // In a real implementation, this would be an API call:
    // const response = await axios.get('/api/country-applications', { params: filters });
    // return response.data;

    // For now, return mock data with some filtering logic
    let filteredData = [...mockCountryApplicationData];

    // Apply role filtering
    if (filters.selectedRoles && filters.selectedRoles.length > 0) {
      filteredData = filteredData
        .map(country => {
          const filteredRoles = Object.keys(country.roles).filter(role =>
            filters.selectedRoles.includes(role),
          );

          const totalApplications = filteredRoles.reduce(
            (sum, role) => sum + (country.roles[role] || 0),
            0,
          );

          // Estimate previous period based on current data
          const previousPeriod = Math.round(totalApplications * 0.9);

          return {
            ...country,
            applications: totalApplications,
            previousPeriod,
            roles: Object.fromEntries(filteredRoles.map(role => [role, country.roles[role] || 0])),
          };
        })
        .filter(country => country.applications > 0);
    }

    // Apply date filtering (mock logic)
    if (filters.dateFilter && filters.dateFilter !== 'all') {
      const now = new Date();
      const daysAgo =
        filters.dateFilter === 'weekly'
          ? 7
          : filters.dateFilter === 'monthly'
          ? 30
          : filters.dateFilter === 'yearly'
          ? 365
          : null;

      if (daysAgo) {
        // Simulate date-based filtering by adjusting numbers
        filteredData = filteredData.map(country => ({
          ...country,
          applications: Math.round(country.applications * (0.8 + Math.random() * 0.4)),
          previousPeriod: Math.round(country.previousPeriod * (0.8 + Math.random() * 0.4)),
        }));
      }
    }

    // Custom date range filtering
    if (filters.dateFilter === 'custom' && filters.startDate && filters.endDate) {
      // Simulate custom date range filtering
      filteredData = filteredData.map(country => ({
        ...country,
        applications: Math.round(country.applications * (0.7 + Math.random() * 0.6)),
        previousPeriod: Math.round(country.previousPeriod * (0.7 + Math.random() * 0.6)),
      }));
    }

    return filteredData;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching country application data:', error);
    throw error;
  }
};

/**
 * Get available roles for filtering
 * @returns {Promise<Array<string>>} Available roles
 */
export const fetchAvailableRoles = async () => {
  try {
    // In a real implementation:
    // const response = await axios.get('/api/roles');
    // return response.data;

    return availableRoles;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching available roles:', error);
    throw error;
  }
};

/**
 * Get application statistics summary
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Summary statistics
 */
export const fetchApplicationSummary = async (filters = {}) => {
  try {
    const data = await fetchCountryApplicationData(filters);

    const totalApplications = data.reduce((sum, country) => sum + country.applications, 0);
    const totalCountries = data.length;
    const avgPerCountry = totalCountries > 0 ? Math.round(totalApplications / totalCountries) : 0;

    // Find top countries
    const topCountries = data
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5)
      .map(country => ({
        name: country.country,
        applications: country.applications,
      }));

    return {
      totalApplications,
      totalCountries,
      avgPerCountry,
      topCountries,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching application summary:', error);
    throw error;
  }
};

export default {
  fetchCountryApplicationData,
  fetchAvailableRoles,
  fetchApplicationSummary,
};
