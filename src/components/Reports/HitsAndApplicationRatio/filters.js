export const dateOptions = ['All', 'Weekly', 'Monthly', 'Yearly'];

export function getDateRange(option) {
  const now = new Date(); // today
  let startDate;

  switch (option) {
    case 'Weekly':
      // Last 7 days (including today)
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6); // includes today as 1 day
      break;

    case 'Monthly':
      // Last full calendar month
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;

    case 'Yearly':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;

    case 'All':
    default:
      startDate = new Date('2000-01-01');
      break;
  }

  const endDate = now;

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}
