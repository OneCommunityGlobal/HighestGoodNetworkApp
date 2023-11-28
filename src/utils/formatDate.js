import moment from "moment";

// converts date to desired format such as Aug-30-2023
export const formatDate = (date) => moment(date).format('MMM-DD-YY');
export const formatDateAndTime = (date) => moment(date, 'MM-DD-YY HH:mm:ss').format('MMM-DD-YY HH:mm:ss');