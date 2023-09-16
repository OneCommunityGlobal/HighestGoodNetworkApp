import moment from "moment";

// converts date to desired format such as Aug-30-2023
export const formatDate = (date) => moment(date).format('MMM-DD-YY');