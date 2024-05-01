import moment from "moment-timezone";

const LA_TIME_ZONE = 'America/Los_Angeles';
/**
 * 
 * @param {*} date 
 * @returns converted date without timezone
 */
export const convertDateFormatToMMMDDYY = (date) => moment(date).format('MMM-DD-YY');
// converts date to desired format such as Aug-30-2023
export const formatDateAndTime = (date) => moment(date).format('MMM-DD-YY, h:mm:ss a');
/**
 * 
 * @param {*} date UTC timestamp string
 * @returns formatted date in 'MMM-DD-YY' format. Aug-30-2023
 */
export const formatDate = (date) => moment(date).tz(LA_TIME_ZONE).format('MMM-DD-YY');
/**
 * 
 * @param {*} date UTC timestamp string
 * @returns formatted date in 'YYYY-MM-DD' format. 2023-09-21
 */
export const formatDateYYYYMMDD = (date) => moment(date).tz(LA_TIME_ZONE).format('YYYY-MM-DD');
/**
 * 
 * @param {*} date UTC timestamp string
 * @returns formatted date in 'MM/DD/YYYY' format. 09/21/2023
 */
export const formatDateMMDDYYYY = (date) => moment(date).tz(LA_TIME_ZONE).format('MM/DD/YYYY');
// converts time to AM/PM format. E.g., '2023-09-21T07:08:09-07:00' becomes '7:08:09 AM'.
export const formatted_AM_PM_Time = (date) => moment(date).format('h:mm:ss A');
export const formatCreatedDate = (date) => moment(date).format("MM/DD");

/**
 * Constants for day of week. Starting from Sunday.
 */
const DAY_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * 
 * @param {String} utcTs A UTC timestamp String
 * @returns {String} day of the week.
 */
export const getDayOfWeekStringFromUTC = (utcTs) => moment(utcTs).tz('America/Los_Angeles').day();

