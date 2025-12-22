const eventTypes = ['Yoga Class', 'Cooking Workshop', 'Dance Class', 'Fitness Bootcamp'];
const locations = ['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Austin'];

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

for (let month = 0; month < 12; month++) {
  for (let week = 0; week < 4; week++) {
    for (let t = 0; t < eventTypes.length; t++) {
      const eventDate = new Date(2025, month, 1 + week * 7 + t);
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
      });
    }
  }
}

const today = new Date();
for (let t = 0; t < 3; t++) {
  const eventDate = new Date(today);
  eventDate.setHours(10 + t * 2, 0, 0, 0);
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
  });
}

export default mockEvents;
