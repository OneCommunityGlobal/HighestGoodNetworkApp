export const dashboardStats = [
  { id: 1, label: 'Seed Varieties', value: 34, icon: '🌱', color: 'green' },
  { id: 2, label: 'Active Plantings', value: 18, icon: '🪴', color: 'amber' },
  { id: 3, label: 'Upcoming Harvests', value: 7, icon: '🌾', color: 'brown' },
  { id: 4, label: 'Seed Orders', value: 3, icon: '📦', color: 'red' },
];

export const sectionTabs = ['Calendars', 'Seed Inventory', 'Seed Orders', 'Online Tools'];

const mkEvent = (id, crop, dateRange, location, yieldEst, status) => ({
  id,
  crop,
  dateRange,
  location,
  yield: yieldEst,
  status,
});

export const calendarSections = [
  {
    id: 'seeding',
    title: 'Seeding',
    addLabel: 'Add Seeding',
    events: [
      mkEvent(1, 'Tomatoes', 'Jun 1 – Jun 15', 'Greenhouse A', 'Est. 40 kg', 'upcoming'),
      mkEvent(2, 'Basil', 'Jun 5 – Jun 20', 'Greenhouse B', 'Est. 12 kg', 'upcoming'),
    ],
  },
  {
    id: 'transplanting',
    title: 'Transplanting',
    addLabel: 'Schedule Transplanting',
    events: [
      mkEvent(1, 'Peppers', 'Jun 10 – Jun 12', 'Field 2', 'Est. 28 kg', 'growing'),
      mkEvent(2, 'Zucchini', 'Jun 14 – Jun 16', 'Field 3', 'Est. 35 kg', 'upcoming'),
    ],
  },
  {
    id: 'succession',
    title: 'Succession',
    addLabel: 'Add Succession Plan',
    events: [
      mkEvent(1, 'Lettuce', 'Jun 7 – Jun 28', 'Raised Beds', 'Est. 20 kg', 'growing'),
      mkEvent(2, 'Spinach', 'Jun 14 – Jul 5', 'Row B', 'Est. 15 kg', 'upcoming'),
    ],
  },
  {
    id: 'harvesting',
    title: 'Harvesting',
    addLabel: 'Add Harvest',
    events: [
      mkEvent(1, 'Strawberries', 'Jun 3 – Jun 17', 'Patch A', 'Est. 22 kg', 'growing'),
      mkEvent(2, 'Peas', 'Jun 18 – Jun 25', 'Field 1', 'Est. 18 kg', 'upcoming'),
      mkEvent(3, 'Radishes', 'Jun 22 – Jun 28', 'Row C', 'Est. 9 kg', 'upcoming'),
    ],
  },
];
