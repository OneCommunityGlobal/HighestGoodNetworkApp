import moment from "moment-timezone";

// converts date to desired format such as Aug-30-2023
export const formatDate = (date) => moment(date).tz('America/Los_Angeles').format('MMM-DD-YY');