// timezoneUtils.js - Skeleton structure for timezone conversion utilities
// Phase 3: Partial implementation - exploring timezone conversion options

/**
 * Gets the user's local timezone using browser's Intl API
 * @returns {string} User's timezone (e.g., 'America/Los_Angeles', 'America/New_York')
 */
export const getUserTimezone = () => {
  try {
    // Use browser's Intl API to detect user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone || 'UTC'; // Fallback to UTC if detection fails
  } catch (error) {
    console.error('Error detecting user timezone:', error);
    return 'UTC'; // Fallback to UTC on error
  }
};

/**
 * Converts a date string to user's local timezone
 * Exploring both date-fns-tz and moment-timezone approaches
 * @param {string} dateString - Date string to convert (ISO format expected)
 * @param {string} userTimezone - User's timezone string
 * @returns {Date} Converted date object in user's timezone
 */
export const convertToUserTimezone = (dateString, userTimezone) => {
  // Phase 3: Exploring conversion options
  // Option 1: Using moment-timezone (already used in codebase - TimestampsTab.jsx)
  // Option 2: Using date-fns-tz (available but not yet used)
  
  // TODO: Decide on final approach after testing both
  // For now, return basic date parsing
  try {
    return new Date(dateString);
  } catch (error) {
    console.error('Error converting date:', error);
    return new Date();
  }
};

// Exploration functions for testing conversion approaches
// These will be removed in Phase 5 when final approach is chosen

/**
 * Test conversion using moment-timezone (exploration)
 * @param {string} dateString - Date string to convert
 * @param {string} userTimezone - User's timezone
 * @returns {Date} Converted date
 */
export const convertWithMomentTimezone = (dateString, userTimezone) => {
  // TODO: Test this approach - moment-timezone is already in use in codebase
  // Example from TimestampsTab.jsx: moment.utc(timestamp).tz(userTimezone)
  return new Date(); // Placeholder
};

/**
 * Test conversion using date-fns-tz (exploration)
 * @param {string} dateString - Date string to convert
 * @param {string} userTimezone - User's timezone
 * @returns {Date} Converted date
 */
export const convertWithDateFnsTz = (dateString, userTimezone) => {
  // TODO: Test this approach - date-fns-tz is available but not yet used
  // Would use: zonedTimeToUtc and utcToZonedTime from date-fns-tz
  return new Date(); // Placeholder
};

/**
 * Gets timezone abbreviation (e.g., PST, EST, UTC)
 * @param {string} timezone - Timezone string (e.g., 'America/Los_Angeles')
 * @returns {string} Timezone abbreviation
 */
export const getTimezoneAbbreviation = timezone => {
  // TODO: Implement abbreviation lookup
  // Will return short timezone code like 'PST', 'EST', 'PDT', 'EDT' etc.
  return '';
};

/**
 * Formats date and time with timezone abbreviation
 * @param {string} dateString - Date string to format
 * @param {string} userTimezone - User's timezone
 * @returns {string} Formatted string like "2:00 PM PST"
 */
export const formatDateTimeWithTimezone = (dateString, userTimezone) => {
  // TODO: Implement complete formatting with timezone conversion and abbreviation
  // This will be the main function used in EventCard
  return '';
};


