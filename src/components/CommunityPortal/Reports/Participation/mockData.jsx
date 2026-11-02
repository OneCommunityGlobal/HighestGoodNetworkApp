const eventTypes = ['Yoga Class', 'Cooking Workshop', 'Dance Class', 'Fitness Bootcamp'];
const locations = ['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Austin'];

// Demonstration-only aggregate values. The event API does not currently provide
// participant demographic attributes or attendance outcomes by demographic group.
export const demoDemographicInsights = {
  Age: [
    { label: '18–25', percentage: 24 },
    { label: '26–35', percentage: 18 },
    { label: '36–50', percentage: 14 },
    { label: '51+', percentage: 11 },
  ],
  Gender: [
    { label: 'Women', percentage: 17 },
    { label: 'Men', percentage: 16 },
    { label: 'Non-binary / self-described', percentage: 13 },
    { label: 'Prefer not to say', percentage: 12 },
  ],
  Education: [
    { label: 'High school or equivalent', percentage: 19 },
    { label: 'Undergraduate', percentage: 16 },
    { label: 'Graduate or professional', percentage: 12 },
  ],
  Segment: [
    { label: 'New participants', percentage: 23 },
    { label: 'Returning participants', percentage: 13 },
  ],
};

let __lcgSeed =
  (Date.now() ^ (typeof performance !== 'undefined' ? Math.floor(performance.now()) : 0)) >>> 0;
const secureRandInt = (min, max) => {
  const cryptoObj = globalThis.crypto;
  const range = max - min + 1;

  if (cryptoObj?.getRandomValues) {
    const maxUint32 = 0xffffffff;
    const bucket = Math.floor(maxUint32 / range) * range;
    const buf = new Uint32Array(1);
    let r;
    do {
      cryptoObj.getRandomValues(buf);
      r = buf[0];
    } while (r >= bucket);
    return min + (r % range);
  }

  __lcgSeed = (1664525 * __lcgSeed + 1013904223) >>> 0;
  return min + (__lcgSeed % range);
};

const formatDisplayTime = date =>
  date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const mockEvents = [];
let id = 1;

// Mock data generation for 12 months and 4 event types per week
for (let month = 0; month < 12; month++) {
  for (let week = 0; week < 4; week++) {
    for (let t = 0; t < eventTypes.length; t++) {
      const eventDate = new Date(2026, month, 1 + week * 7 + t);
      mockEvents.push({
        id: id++,
        eventType: eventTypes[t],
        eventDate: eventDate.toISOString(),
        eventTime: formatDisplayTime(eventDate),
        eventName: `Event ${id}`,
        attendees: secureRandInt(20, 99),
        noShowRate: `${secureRandInt(5, 94)}%`,
        dropOffRate: `${secureRandInt(10, 79)}%`,
        location: locations[(id + t) % locations.length],
        capacity: secureRandInt(1, 40),
      });
    }
  }
}

// Mock data generation for today
const today = new Date();
const endOfToday = new Date(today);
endOfToday.setHours(23, 59, 0, 0);
const remainingMinutesToday = Math.max(14, Math.floor((endOfToday - today) / (1000 * 60)));
const todayEventSpacingMinutes = Math.max(1, Math.floor(remainingMinutesToday / 14));

for (let t = 0; t < 13; t++) {
  const eventDate = new Date(today.getTime() + todayEventSpacingMinutes * (t + 1) * 60 * 1000);
  eventDate.setSeconds(0, 0);

  mockEvents.push({
    id: id++,
    eventType: eventTypes[t % eventTypes.length],
    eventDate: eventDate.toISOString(),
    eventTime: formatDisplayTime(eventDate),
    eventName: `Event ${id}`,
    attendees: secureRandInt(20, 99),
    noShowRate: `${secureRandInt(5, 94)}%`,
    dropOffRate: `${secureRandInt(10, 79)}%`,
    location: locations[id % locations.length],
    capacity: secureRandInt(1, 40),
  });
}

mockEvents.push({
  id: id++,
  eventType: 'Fitness Bootcamp',
  eventDate: new Date(2026, 0, 21, 8, 0, 0, 0).toISOString(),
  eventTime: formatDisplayTime(new Date(2026, 0, 21, 8, 0, 0, 0)),
  eventName: 'Sold Out Event',
  attendees: 50,
  noShowRate: '18%',
  dropOffRate: '40%',
  location: 'Chicago',
  capacity: 0,
});

export default mockEvents;
