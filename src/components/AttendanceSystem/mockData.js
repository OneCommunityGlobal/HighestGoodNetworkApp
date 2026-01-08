// Helper to get dates relative to today for demo purposes
const getDateString = daysOffset => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

export const events = [
  {
    id: '1',
    name: 'Conference A',
    registrations: 100,
    attendees: 78,
    completed: 75,
    walkouts: 5,
    date: getDateString(-30), // Past date - will show as Completed
    time: '09:00 AM - 05:00 PM',
    link: 'https://conferencea.com',
    organizer: 'Tech Events Inc.',
    capacity: 150,
    overallRating: 4.5,
    status: 'Completed',
  },
  {
    id: '2',
    name: 'Workshop B',
    registrations: 50,
    attendees: 44,
    completed: 38,
    walkouts: 2,
    date: getDateString(7), // Future date - will show as Upcoming
    time: '10:00 AM - 02:00 PM',
    link: 'https://workshopb.com',
    organizer: 'Skill Builders LLC',
    capacity: 50,
    overallRating: 4.8,
    status: 'Upcoming',
  },
  {
    id: '3',
    name: 'Seminar C',
    registrations: 75,
    attendees: 63,
    completed: 55,
    walkouts: 5,
    date: getDateString(0), // Today - will show as In Progress if current time is within range
    time: '08:00 AM - 06:00 PM',
    link: 'https://seminarc.com',
    organizer: 'Knowledge Share Co.',
    capacity: 100,
    overallRating: 4.2,
    status: 'In Progress',
  },
];
