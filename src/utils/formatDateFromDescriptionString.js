/*
converts date from description string that is present on the blue square modal using regex and js

example:
System auto-assigned infringement for not meeting weekly volunteer time commitment.
You logged 0 hours against committed effort of 10 hours in the week starting Sunday 2023-06-18
and ending Saturday 2023-06-24.

targets only the 2023-06-18 & 2023-06-24
replaces every occurence present in a string no matter how large it is. 

formatDate.js on Steroids ~ Kurtis
*/

export const formatDateFromDescriptionString = input => input.replace(/(\d{4}-\d{2}-\d{2})/g, date => {
  const [year, month, day] = date.split('-');
  const months = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec"
  ];
  return `${months[parseInt(month) - 1]}-${day}-${year.slice(-2)}`;
});


export const formatTimeOffRequests = inputString => {
  const searchTerm = 'Notice:'
  if (inputString.includes(searchTerm)) {
    const parts = inputString.split(searchTerm);
    return parts
  }
  return [];
}