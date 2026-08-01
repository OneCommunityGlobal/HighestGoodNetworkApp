export const dashboardStats = [
  { id: 1, label: 'Seed Varieties', value: 34, icon: '🌱', color: 'green' },
  { id: 2, label: 'Active Plantings', value: 18, icon: '🪴', color: 'amber' },
  { id: 3, label: 'Upcoming Harvests', value: 7, icon: '🌾', color: 'brown' },
  { id: 4, label: 'Seed Orders', value: 3, icon: '📦', color: 'red' },
];

export const sectionTabs = ['Calendars', 'Seed Inventory', 'Seed Orders', 'Online Tools'];

export const calendarSections = [
  {
    id: 'seeding',
    title: 'Seeding',
    addLabel: 'Add Seeding',
    events: [
      {
        id: 1,
        crop: 'Tomatoes',
        dateRange: 'Jun 1 – Jun 15',
        location: 'Greenhouse A',
        yield: 'Est. 40 kg',
        status: 'upcoming',
      },
      {
        id: 2,
        crop: 'Basil',
        dateRange: 'Jun 5 – Jun 20',
        location: 'Greenhouse B',
        yield: 'Est. 12 kg',
        status: 'upcoming',
      },
    ],
  },
  {
    id: 'transplanting',
    title: 'Transplanting',
    addLabel: 'Schedule Transplanting',
    events: [
      {
        id: 1,
        crop: 'Peppers',
        dateRange: 'Jun 10 – Jun 12',
        location: 'Field 2',
        yield: 'Est. 28 kg',
        status: 'growing',
      },
      {
        id: 2,
        crop: 'Zucchini',
        dateRange: 'Jun 14 – Jun 16',
        location: 'Field 3',
        yield: 'Est. 35 kg',
        status: 'upcoming',
      },
    ],
  },
  {
    id: 'succession',
    title: 'Succession',
    addLabel: 'Add Succession Plan',
    events: [
      {
        id: 1,
        crop: 'Lettuce',
        dateRange: 'Jun 7 – Jun 28',
        location: 'Raised Beds',
        yield: 'Est. 20 kg',
        status: 'growing',
      },
      {
        id: 2,
        crop: 'Spinach',
        dateRange: 'Jun 14 – Jul 5',
        location: 'Row B',
        yield: 'Est. 15 kg',
        status: 'upcoming',
      },
    ],
  },
  {
    id: 'harvesting',
    title: 'Harvesting',
    addLabel: 'Add Harvest',
    events: [
      {
        id: 1,
        crop: 'Strawberries',
        dateRange: 'Jun 3 – Jun 17',
        location: 'Patch A',
        yield: 'Est. 22 kg',
        status: 'growing',
      },
      {
        id: 2,
        crop: 'Peas',
        dateRange: 'Jun 18 – Jun 25',
        location: 'Field 1',
        yield: 'Est. 18 kg',
        status: 'upcoming',
      },
      {
        id: 3,
        crop: 'Radishes',
        dateRange: 'Jun 22 – Jun 28',
        location: 'Row C',
        yield: 'Est. 9 kg',
        status: 'upcoming',
      },
    ],
  },
];
