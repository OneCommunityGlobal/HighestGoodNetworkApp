function getWeekRange(weeksAgo) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset - weeksAgo * 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = date => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${format(monday)} - ${format(sunday)}`;
}

export const MOCK_WEEK_OPTIONS = [
  'Current Week',
  '1 Week Ago',
  '2 Weeks Ago',
  '3 Weeks Ago',
  '4 Weeks Ago',
];

export const MOCK_WEEK_METADATA = Object.fromEntries(
  MOCK_WEEK_OPTIONS.map((label, i) => [label, { range: getWeekRange(i) }]),
);
