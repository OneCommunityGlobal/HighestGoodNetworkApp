/**
 * Utility functions for caching time entries data
 */

/**
 * Get cached data from localStorage
 * @param {string} cacheKey - The cache key
 * @param {string} reportName - Name of the report (for logging)
 * @returns {Object} { data: Array|null, length: number }
 */
export const getCachedData = (cacheKey, reportName) => {
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      const parsedData = JSON.parse(cachedData);
      if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`${reportName}: Using cached data`, {
          cacheKey,
          dataLength: parsedData.length,
        });
        return { data: parsedData, length: parsedData.length };
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`${reportName}: Failed to parse cached data`, e);
    }
  }
  return { data: null, length: 0 };
};

/**
 * Get cached data length for comparison (without using the data)
 * @param {string} cacheKey - The cache key
 * @param {string} reportName - Name of the report (for logging)
 * @returns {number} Length of cached data
 */
export const getCachedDataLength = (cacheKey, reportName) => {
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      const parsedData = JSON.parse(cachedData);
      if (parsedData && Array.isArray(parsedData)) {
        // eslint-disable-next-line no-console
        console.log(`${reportName}: Found cached data (will compare with fresh data)`, {
          cacheKey,
          cachedDataLength: parsedData.length,
        });
        return parsedData.length;
      }
    } catch (e) {
      // Ignore parse errors when just checking length
    }
  }
  return 0;
};

/**
 * Set cached data in localStorage
 * @param {string} cacheKey - The cache key
 * @param {Array} data - Data to cache
 * @param {string} reportName - Name of the report (for logging)
 * @param {number} previousCacheLength - Previous cache length for comparison
 */
export const setCachedData = (cacheKey, data, reportName, previousCacheLength = 0) => {
  if (data && data.length > 0) {
    localStorage.setItem(cacheKey, JSON.stringify(data));
    // eslint-disable-next-line no-console
    console.log(`${reportName}: Data cached`, {
      cacheKey,
      dataLength: data.length,
      previousCacheLength: previousCacheLength || 0,
    });
  } else {
    // eslint-disable-next-line no-console
    console.warn(`${reportName}: Empty response - clearing cache`, { cacheKey });
    localStorage.removeItem(cacheKey);
  }
};

/**
 * Clear cached data
 * @param {string} cacheKey - The cache key
 * @param {string} reportName - Name of the report (for logging)
 */
export const clearCachedData = (cacheKey, reportName) => {
  localStorage.removeItem(cacheKey);
  // eslint-disable-next-line no-console
  console.log(`${reportName}: Cache cleared`, { cacheKey });
};

/**
 * Validate userList before making API call
 * @param {Array} userList - Array of user IDs
 * @param {Array} userProfiles - Array of user profile objects
 * @param {string} reportName - Name of the report (for logging)
 * @returns {boolean} True if userList is valid, false otherwise
 */
export const validateUserList = (userList, userProfiles, reportName) => {
  if (!userList || userList.length === 0) {
    // eslint-disable-next-line no-console
    console.warn(`${reportName}: Skipping API call - userList is empty`, {
      userProfilesLength: userProfiles?.length,
      userListLength: userList?.length,
    });
    return false;
  }
  return true;
};

/**
 * Log API request
 * @param {string} reportName - Name of the report
 * @param {string} url - API URL
 * @param {Object} payload - Request payload
 * @param {Object} additionalInfo - Additional info to log
 */
export const logApiRequest = (reportName, url, payload, additionalInfo = {}) => {
  // eslint-disable-next-line no-console
  console.log(`${reportName} API Request:`, {
    url,
    payload,
    ...additionalInfo,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log API response
 * @param {string} reportName - Name of the report
 * @param {number} dataLength - Length of response data
 * @param {Array} sampleData - Sample data for logging (optional)
 */
export const logApiResponse = (reportName, dataLength, sampleData = null) => {
  const logData = {
    dataLength,
    timestamp: new Date().toISOString(),
  };
  if (sampleData) {
    logData.sampleData = sampleData;
  }
  // eslint-disable-next-line no-console
  console.log(`${reportName} API Response:`, logData);
};

/**
 * Check if response seems incomplete and log warning
 * @param {string} reportName - Name of the report
 * @param {number} timeEntriesCount - Number of time entries
 * @param {number} usersCount - Number of users
 */
export const checkIncompleteResponse = (reportName, timeEntriesCount, usersCount) => {
  if (timeEntriesCount > 0 && usersCount > 100 && timeEntriesCount < 10) {
    // eslint-disable-next-line no-console
    console.warn(`${reportName}: Response may be incomplete`, {
      timeEntriesCount,
      usersCount,
      ratio: ((timeEntriesCount / usersCount) * 100).toFixed(2) + '%',
      message: 'If data seems incomplete, backend may still be processing. Try refreshing in a few minutes.',
    });
  }
};

/**
 * Compare fresh data with cached data and log differences
 * @param {string} reportName - Name of the report
 * @param {number} freshDataLength - Length of fresh data
 * @param {number} cachedDataLength - Length of cached data
 */
export const compareWithCache = (reportName, freshDataLength, cachedDataLength) => {
  if (cachedDataLength > 0 && cachedDataLength > freshDataLength) {
    // eslint-disable-next-line no-console
    console.warn(`${reportName}: Fresh data has fewer entries than cache`, {
      freshDataLength,
      cachedDataLength,
      message: 'Using fresh data anyway to ensure accuracy',
    });
  } else if (freshDataLength > cachedDataLength) {
    // eslint-disable-next-line no-console
    console.log(`${reportName}: Fresh data has more entries than cache`, {
      freshDataLength,
      cachedDataLength,
      difference: freshDataLength - cachedDataLength,
    });
  }
};

