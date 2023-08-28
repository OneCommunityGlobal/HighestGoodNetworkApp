export const formatDateFromDescriptionString = input => input.replace(/(\d{4}-\d{2}-\d{2})/g, date => {
  const [year, month, day] = date.split('-');
  const months = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec"
  ];
  return `${months[parseInt(month) - 1]}-${day}-${year.slice(-2)}`;
});


