import moment from 'moment-timezone';

export const COMPANY_TZ = 'America/Los_Angeles';
/**
 *
 * @param {*} date
 * @returns converted date without timezone
 */
export const convertDateFormatToMMMDDYY = date => moment(date).format('MMM-DD-YY');
// converts date to desired format such as Aug-30-2023
export const formatDateAndTime = date => moment(date).format('MMM-DD-YY, h:mm:ss a');
/**
 *
 * @param {*} date UTC timestamp string
 * @returns formatted date in 'MMM-DD-YY' format. Aug-30-2023
 */
export const formatDate = date =>
  moment(date)
    .tz(COMPANY_TZ)
    .startOf('day')
    .format('MMM-DD-YY');
export const formatDateLocal = val => {
  if (!val) return '';
  // Strict ISO parse to avoid fallback warnings
  return moment(val, moment.ISO_8601, true)
    .local()
    .format('MMM DD, YYYY');
};
export const formatDateUtcYYYYMMDD = val => {
  if (!val) return '';
  // Always return YYYY-MM-DD for <input type="date">
  return moment(val, moment.ISO_8601, true)
    .utc()
    .format('YYYY-MM-DD');
};

export const formatDateCompany = (val) => {
  if (!val) return '';
  return moment.tz(val, COMPANY_TZ).format('MMM DD, YYYY');
};

export const formatDateTimeLocal = (val) => {
  if (!val) return '';

  return moment(val, moment.ISO_8601, true)
    .local()
    .format('MMM DD, YYYY, HH:mm');
};

/**
 *
 * @param {*} date UTC timestamp string
 * @returns formatted date in 'YYYY-MM-DD' format. 2023-09-21
 */
export const formatDateYYYYMMDD = date =>
  moment(date)
    .tz(COMPANY_TZ)
    .format('YYYY-MM-DD');
/**
 *
 * @param {*} date UTC timestamp string
 * @returns formatted date in 'MM/DD/YYYY' format. 09/21/2023
 */
export const formatDateMMDDYYYY = date =>
  moment(date)
    .tz(COMPANY_TZ)
    .format('MM/DD/YYYY');
// converts time to AM/PM format. E.g., '2023-09-21T07:08:09-07:00' becomes '7:08:09 AM'.
export const formattedAmPmTime = date => moment(date).format('h:mm:ss A');
export const formatCreatedDate = date => moment(date).format('MM/DD');

/**
 *
 * @param {String} utcTs A UTC timestamp String
 * @returns {String} day of the week.
 */
export const getDayOfWeekStringFromUTC = utcTs =>
  moment(utcTs)
    .tz('America/Los_Angeles')
    .day();

export const CREATED_DATE_CRITERIA = '2022-01-01';

/**
 * Converts a UTC timestamp to a formatted string in the user's
 * specific profile timezone.
 *
 * @param {string} utcDate - The UTC date string (e.g., "2025-08-28T03:04:50.054Z")
 * @param {string} timeZone - The user's timezone from their profile (e.g., "America/Los_Angeles")
 * @returns {string} Formatted date and time (e.g., "Aug 27, 2025, 8:04 PM")
 */
export const formatByTimeZone = (utcDate, timeZone) => {
  if (!utcDate || !timeZone) {
    return 'Invalid Date';
  }

  return moment(utcDate)
    .tz(timeZone)
    .format('MMM DD, YYYY, h:mm A');
};
