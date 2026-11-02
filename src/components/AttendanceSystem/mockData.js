// Helper to generate dates
const getDateString = daysOffset => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

// EVENTS DATA
export const events = [
  {
    id: '1',
    name: 'Conference A',
    registrations: 100,
    attendees: 78,
    completed: 75,
    walkouts: 3,
    date: getDateString(-10),
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
    walkouts: 6,
    date: getDateString(-2),
    time: '10:00 AM - 03:00 PM',
    link: 'https://workshopb.com',
    organizer: 'Learning Hub',
    capacity: 80,
    overallRating: 4.2,
    status: 'Completed',
  },
  {
    id: '3',
    name: 'Seminar C',
    registrations: 60,
    attendees: 0,
    completed: 0,
    walkouts: 0,
    date: getDateString(2),
    time: '11:00 AM - 02:00 PM',
    link: 'https://seminarc.com',
    organizer: 'Edu Corp',
    capacity: 100,
    overallRating: 0,
    status: 'Upcoming',
  },
];

// ATTENDANCE LOG (Participant level)
export const attendanceLogs = [
  {
    attendanceId: 'A1',
    eventId: '1',
    participantId: 'P1',
    name: 'John Doe',
    email: 'john@example.com',
    checkInTime: '2025-12-10T09:15:00',
    status: 'Attended',
  },
  {
    attendanceId: 'A2',
    eventId: '1',
    participantId: 'P2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    checkInTime: '2025-12-10T09:30:00',
    status: 'Attended',
  },
  {
    attendanceId: 'A3',
    eventId: '1',
    participantId: 'P3',
    name: 'Mike Ross',
    email: 'mike@example.com',
    checkInTime: null,
    status: 'No-Show',
  },
  {
    attendanceId: 'A4',
    eventId: '2',
    participantId: 'P4',
    name: 'Rachel Zane',
    email: 'rachel@example.com',
    checkInTime: '2025-12-11T10:05:00',
    status: 'Attended',
  },
];

// FILTER attendance by event
export const getAttendanceByEvent = eventId => {
  return attendanceLogs.filter(item => item.eventId === eventId);
};

// CALCULATE INSIGHTS (No-show stats)
export const getAttendanceInsights = eventId => {
  const logs = getAttendanceByEvent(eventId);

  const totalRegistered = logs.length;
  const totalAttended = logs.filter(l => l.status === 'Attended').length;
  const totalNoShow = logs.filter(l => l.status === 'No-Show').length;

  const noShowRate = totalRegistered === 0 ? 0 : ((totalNoShow / totalRegistered) * 100).toFixed(2);

  return {
    totalRegistered,
    totalAttended,
    totalNoShow,
    noShowRate,
  };
};
