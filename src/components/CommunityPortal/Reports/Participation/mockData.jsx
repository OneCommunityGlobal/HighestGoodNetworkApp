const eventTypes = ['Yoga Class', 'Cooking Workshop', 'Dance Class', 'Fitness Bootcamp'];
const locations = ['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Austin'];

// Helper to format display string
const formatDisplayTime = date =>
  date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

// Generate ~200 events (4 per week * 52 weeks)
const mockEvents = [];
let id = 1;

// Loop over each week of 2025
for (let month = 0; month < 12; month++) {
  for (let week = 0; week < 4; week++) {
    for (let t = 0; t < eventTypes.length; t++) {
      const eventDate = new Date(2025, month, 1 + week * 7 + t); // stagger days

      mockEvents.push({
        id: id++,
        eventType: eventTypes[t],
        eventDate: eventDate.toISOString(),
        eventTime: formatDisplayTime(eventDate),
        eventName: `Event ${id}`,
        attendees: Math.floor(Math.random() * 80) + 20,
        noShowRate: `${Math.floor(Math.random() * 90) + 5}%`,
        dropOffRate: `${Math.floor(Math.random() * 70) + 10}%`,
        location: locations[(id + t) % locations.length],
      });
    }
  }
}

// Ensure "today" always has 2–3 events
const today = new Date();
for (let t = 0; t < 3; t++) {
  const eventDate = new Date(today);
  eventDate.setHours(10 + t * 2, 0, 0, 0);

  mockEvents.push({
    id: id++,
    eventType: eventTypes[t % eventTypes.length],
    eventDate: eventDate.toISOString(),
    eventTime: formatDisplayTime(eventDate),
    eventName: `Today’s Event ${id}`,
    attendees: Math.floor(Math.random() * 80) + 20,
    noShowRate: `${Math.floor(Math.random() * 90) + 5}%`,
    dropOffRate: `${Math.floor(Math.random() * 70) + 10}%`,
    location: locations[id % locations.length],
  });
}

export default mockEvents;
