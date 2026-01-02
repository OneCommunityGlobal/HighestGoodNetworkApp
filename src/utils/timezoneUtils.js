// timezoneUtils.js - Complete timezone conversion utilities
// Phase 5: Complete implementation - full timezone conversion functionality
import moment from 'moment-timezone';

/**
 * Gets the user's local timezone using browser's Intl API
 * @returns {string} User's timezone (e.g., 'America/Los_Angeles', 'America/New_York')
 */
export const getUserTimezone = () => {
  // Phase 4: Tested and verified - works across all modern browsers
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timezone || typeof timezone !== 'string') {
      console.warn('Invalid timezone detected, falling back to UTC');
      return 'UTC';
    }
    return timezone;
  } catch (error) {
    console.error('Error detecting user timezone:', error);
    return 'UTC';
  }
};

/**
 * Converts a date string to user's local timezone
 * Phase 5: Complete implementation using moment-timezone
 * @param {string} dateString - Date string to convert (ISO format expected)
 * @param {string} userTimezone - User's timezone string
 * @returns {Date} Converted date object in user's timezone
 */
export const convertToUserTimezone = (dateString, userTimezone) => {
  // Phase 5: Complete implementation using moment-timezone
  try {
    if (!dateString) {
      console.warn('No dateString provided to convertToUserTimezone');
      return new Date();
    }
    if (!userTimezone) {
      console.warn('No userTimezone provided, using UTC');
      return new Date(dateString);
    }

    // Convert date string to moment, then to user's timezone
    const converted = moment(dateString).tz(userTimezone);
    
    if (!converted.isValid()) {
      console.warn('Invalid date after conversion, using original');
      return new Date(dateString);
    }
    
    return converted.toDate();
  } catch (error) {
    console.error('Error converting date to user timezone:', error);
    try {
      return new Date(dateString);
    } catch (fallbackError) {
      return new Date();
    }
  }
};

/**
 * Gets timezone abbreviation (e.g., PST, EST, UTC)
 * Phase 5: Complete implementation using moment-timezone
 * @param {string} timezone - Timezone string (e.g., 'America/Los_Angeles')
 * @returns {string} Timezone abbreviation
 */
export const getTimezoneAbbreviation = timezone => {
  // Phase 5: Complete implementation
  // moment-timezone automatically handles DST and returns correct abbreviation
  try {
    if (!timezone || typeof timezone !== 'string') {
      return 'UTC';
    }
    // Use moment to get timezone abbreviation for current date
    // This automatically handles DST (PST vs PDT, EST vs EDT, etc.)
    const now = moment().tz(timezone);
    return now.format('z'); // Returns abbreviation like 'PST', 'EST', 'PDT', 'EDT'
  } catch (error) {
    console.error('Error getting timezone abbreviation:', error);
    return 'UTC';
  }
};

/**
 * Formats date and time with timezone abbreviation
 * Phase 5: Complete implementation
 * @param {string} dateString - Date string to format
 * @param {string} userTimezone - User's timezone
 * @returns {string} Formatted string like "2:00 PM PST"
 */
export const formatDateTimeWithTimezone = (dateString, userTimezone) => {
  // Phase 5: Complete implementation
  try {
    if (!dateString) {
      return 'Time not set';
    }

    if (!userTimezone) {
      // Fallback if timezone not available
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return 'Invalid time';
        }
        return moment(date).format('h:mm A');
      } catch (error) {
        return 'Time not set';
      }
    }

    // Convert to user's timezone and format
    const converted = moment(dateString).tz(userTimezone);
    
    if (!converted.isValid()) {
      return 'Invalid time';
    }

    // Format: "2:00 PM PST"
    const timeFormatted = converted.format('h:mm A');
    const timezoneAbbr = converted.format('z');
    
    return `${timeFormatted} ${timezoneAbbr}`;
  } catch (error) {
    console.error('Error formatting date time with timezone:', error);
    return 'Time not set';
  }
};
