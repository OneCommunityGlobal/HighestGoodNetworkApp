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

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function random1to5() {
  return Math.floor(Math.random() * 5) + 1;
}

const mockEvents = [];
let id = 1;

export function formatEventDisplay(event) {
  const start = new Date(event.eventStartTime);
  const end = new Date(event.eventEndTime);

  function formatTime(date) {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 → 12

    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  }

  function getOrdinal(n) {
    if (n > 3 && n < 21) return 'th';
    return ['st', 'nd', 'rd'][(n % 10) - 1] || 'th';
  }

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const day = start.getDate();
  const month = monthNames[start.getMonth()];
  const year = start.getFullYear();

  return `${formatTime(start)} - ${formatTime(end)}. ${month} ${day}${getOrdinal(day)}, ${year}`;
}

for (let month = 0; month < 12; month++) {
  for (let week = 0; week < 4; week++) {
    for (let t = 0; t < eventTypes.length; t++) {
      const eventDate = new Date(2025, month, 1 + week * 7 + t);
      const hours = Math.floor(Math.random() * 24);
      const minutes = Math.floor(Math.random() * 60);
      const seconds = Math.floor(Math.random() * 60);
      eventDate.setHours(hours, minutes, seconds);
      const duration = random1to5();
      const startTime = formatDate(eventDate);
      const endTime = formatDate(new Date(eventDate.getTime() + duration * 60 * 60 * 1000));
      mockEvents.push({
        id: id++,
        eventType: eventTypes[t],
        eventTime: formatEventDisplay({ eventStartTime: startTime, eventEndTime: endTime }),
        eventStartTime: startTime,
        eventEndTime: endTime,
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
  const duration = random1to5();
  const startTime = formatDate(eventDate);
  const endTime = formatDate(new Date(eventDate.getTime() + duration * 60 * 60 * 1000));
  mockEvents.push({
    id: id++,
    eventType: eventTypes[t % eventTypes.length],
    eventTime: formatEventDisplay({ eventStartTime: startTime, eventEndTime: endTime }),
    eventStartTime: startTime,
    eventEndTime: endTime,
    eventName: `Today’s Event ${id}`,
    attendees: secureRandInt(20, 99),
    noShowRate: `${secureRandInt(5, 94)}%`,
    dropOffRate: `${secureRandInt(10, 79)}%`,
    location: locations[id % locations.length],
  });
}

export default mockEvents;
