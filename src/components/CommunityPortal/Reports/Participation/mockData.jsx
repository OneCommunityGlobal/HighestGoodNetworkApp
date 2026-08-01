import { formateDate, formatEventDisplay } from './HelperFunctions';
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

function random1to5() {
  return secureRandInt(1, 5);
}

const mockEvents = [];
let id = 1;

const ageGroups = ['18-25', '26-35', '36-50', '50+'];
const genders = ['Male', 'Female', 'Other'];
const incomeLevels = ['Low', 'Medium', 'High'];
const occupations = ['Student', 'Engineer', 'Doctor', 'Business', 'Other'];
const educationLevels = ['High School', 'Bachelor', 'Master', 'PhD'];
const userSegments = ['New', 'Returning'];

for (let month = 0; month < 12; month++) {
  for (let week = 0; week < 4; week++) {
    for (let t = 0; t < eventTypes.length; t++) {
      const eventDate = new Date(2026, month, 1 + week * 7 + t);
      const hours = secureRandInt(0, 23);
      const minutes = secureRandInt(0, 59);
      const seconds = secureRandInt(0, 59);
      eventDate.setHours(hours, minutes, seconds);
      const duration = random1to5();
      const startTime = formateDate(eventDate);
      const endTime = formateDate(new Date(eventDate.getTime() + duration * 60 * 60 * 1000));
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
        ageGroup: ageGroups[secureRandInt(0, ageGroups.length - 1)],
        gender: genders[secureRandInt(0, genders.length - 1)],
        incomeLevel: incomeLevels[secureRandInt(0, incomeLevels.length - 1)],
        occupation: occupations[secureRandInt(0, occupations.length - 1)],
        educationLevel: educationLevels[secureRandInt(0, educationLevels.length - 1)],
        userSegment: userSegments[secureRandInt(0, userSegments.length - 1)],
      });
    }
  }
}

// Mock data generation for today
const today = new Date();
for (let t = 0; t < 6; t++) {
  const eventDate = new Date(today);
  eventDate.setHours(10 + t * 2, 0, 0, 0);
  const duration = random1to5();
  const startTime = formateDate(eventDate);
  const endTime = formateDate(new Date(eventDate.getTime() + duration * 60 * 60 * 1000));
  mockEvents.push({
    id: id++,
    eventType: eventTypes[t % eventTypes.length],
    eventTime: formatEventDisplay({ eventStartTime: startTime, eventEndTime: endTime }),
    eventStartTime: startTime,
    eventEndTime: endTime,
    eventName: `Event ${id}`,
    attendees: secureRandInt(20, 99),
    noShowRate: `${secureRandInt(5, 94)}%`,
    dropOffRate: `${secureRandInt(10, 79)}%`,
    location: locations[id % locations.length],
    ageGroup: ageGroups[secureRandInt(0, ageGroups.length - 1)],
    gender: genders[secureRandInt(0, genders.length - 1)],
    incomeLevel: incomeLevels[secureRandInt(0, incomeLevels.length - 1)],
    occupation: occupations[secureRandInt(0, occupations.length - 1)],
    educationLevel: educationLevels[secureRandInt(0, educationLevels.length - 1)],
    userSegment: userSegments[secureRandInt(0, userSegments.length - 1)],
  });
}

export default mockEvents;
