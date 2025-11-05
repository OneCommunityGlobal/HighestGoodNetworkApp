// eventMockApi.js
// Mock API for Event Management Page (Organizer View)
// - Persists data into localStorage using activityId
// - Supports: Event Info, Status, Rating, Date Selector, Calendar/Schedule,
//   Description + Media Upload, Tabs: Description / Analysis / Resource / Engagement

// ---------- helpers ----------
const wait = (ms = 300) => new Promise(r => setTimeout(r, ms));
const NS = 'hgn_event_mock_v1:'; // storage namespace version

const todayISO = () => new Date().toISOString();
const clone = x => JSON.parse(JSON.stringify(x));

function keyFor(id) {
  return `${NS}${id}`;
}

function readStore(activityId) {
  const raw = localStorage.getItem(keyFor(activityId));
  return raw ? JSON.parse(raw) : null;
}

function writeStore(activityId, data) {
  localStorage.setItem(keyFor(activityId), JSON.stringify(data));
  return data;
}

export function resetMock(activityId) {
  localStorage.removeItem(keyFor(activityId));
}

// ---------- seed ----------
function defaultSeed(activityId) {
  // Default mock data sufficient to fully render the UI
  const attendees = [
    { name: 'Alex', avatar: 'https://i.pravatar.cc/36?img=12' },
    { name: 'Jamie', avatar: 'https://i.pravatar.cc/36?img=5' },
    { name: 'Ruan', avatar: 'https://i.pravatar.cc/36?img=24' },
    { name: 'Jeff', avatar: 'https://i.pravatar.cc/36?img=30' },
    { name: 'Prince', avatar: 'https://i.pravatar.cc/36?img=9' },
  ];

  const dates = ['2025-11-05', '2025-11-06', '2025-11-12'];

  // Schedule per date
  const scheduleByDate = {
    '2025-11-05': [
      { id: 's1', start: '09:00', end: '10:00', status: 'open' },
      { id: 's2', start: '10:15', end: '11:00', status: 'closed' },
    ],
    '2025-11-06': [{ id: 's3', start: '09:30', end: '11:00', status: 'open' }],
    '2025-11-12': [],
  };

  const seed = {
    id: activityId,
    name: 'Community Onboarding – Organizer Briefing',
    eventType: 'In-person', // 'In-person' | 'Online'
    coverImage: 'https://picsum.photos/640/400?blur=2',
    location: 'San Francisco, CA 94108',
    organizer: { name: 'Alex Brain', email: 'organizer@example.org' },
    zoomLink: 'https://zoom.example.org/meet/123456', // used when Online
    status: 'Active', // 'Active' | 'Finished'
    rating: 4, // 0..5
    ratingStats: { count: 57, histogram: { 5: 32, 4: 18, 3: 5, 2: 1, 1: 1 } },
    time: { start: '09:00', end: '11:00', timezone: 'EDT' },
    capacity: { used: 7, total: 20 },
    attendees,
    availableDates: dates,
    selectedDate: dates[0],
    scheduleByDate,

    description:
      'Welcome to the organizer view. Use the Description tab to post updates and attach media.',

    // Resource tab
    resources: [
      { id: 'r1', type: 'link', title: 'Project Brief', url: 'https://example.org/brief' },
      { id: 'r2', type: 'file', title: 'Agenda.pdf', url: '#', size: 1024 * 200 },
    ],

    // Analysis tab mock data
    analysis: {
      noShowRate: 0.12,
      attendanceByDate: [
        { date: '2025-11-05', attended: 12, registered: 18 },
        { date: '2025-11-06', attended: 9, registered: 14 },
        { date: '2025-11-12', attended: 0, registered: 0 },
      ],
      topReferrers: [
        { source: 'Email', count: 21 },
        { source: 'Slack', count: 8 },
        { source: 'Website', count: 6 },
      ],
    },

    // Engagement tab mock data
    engagement: {
      totalViews: 32,
      uniqueAttendees: 18,
      lastUpdated: todayISO(),
      timeline: [
        { ts: '2025-11-01T10:00:00.000Z', views: 6 },
        { ts: '2025-11-02T10:00:00.000Z', views: 11 },
        { ts: '2025-11-03T10:00:00.000Z', views: 15 },
      ],
    },
  };

  return seed;
}

function ensure(activityId) {
  let data = readStore(activityId);
  if (!data) {
    data = defaultSeed(activityId);
    writeStore(activityId, data);
  }
  return data;
}

// ---------- Event (GET) ----------
export async function getEvent(activityId) {
  await wait();
  return clone(ensure(activityId));
}

// ---------- Engagement ----------
export async function getEngagement(activityId) {
  await wait();
  const evt = ensure(activityId);
  return clone(evt.engagement);
}

export async function incrementView(activityId, unique = false) {
  await wait(80);
  const evt = ensure(activityId);
  const next = clone(evt);
  next.engagement.totalViews += 1;
  if (unique) next.engagement.uniqueAttendees += 1;
  next.engagement.lastUpdated = todayISO();
  next.engagement.timeline.push({ ts: todayISO(), views: next.engagement.totalViews });
  writeStore(activityId, next);
  return clone(next.engagement);
}

// ---------- Description ----------
export async function updateDescription(activityId, nextDescription) {
  await wait();
  const evt = ensure(activityId);
  const next = clone(evt);
  next.description = nextDescription ?? '';
  writeStore(activityId, next);
  return { description: next.description };
}

// ---------- Status / Rating ----------
export async function updateStatus(activityId, status /* 'Active'|'Finished' */) {
  await wait();
  const evt = ensure(activityId);
  const next = clone(evt);
  next.status = status;
  writeStore(activityId, next);
  return { status: next.status };
}

export async function updateRating(activityId, rating /* number 0..5 */) {
  await wait();
  const evt = ensure(activityId);
  const next = clone(evt);
  next.rating = Math.max(0, Math.min(5, Number(rating) || 0));

  // update ratingStats (optional example)
  const star = Math.round(next.rating);
  if (!next.ratingStats)
    next.ratingStats = { count: 0, histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  next.ratingStats.count += 1;
  next.ratingStats.histogram[star] = (next.ratingStats.histogram[star] || 0) + 1;

  writeStore(activityId, next);
  return { rating: next.rating, ratingStats: next.ratingStats };
}

// ---------- Dates / Schedule ----------
export async function updateSelectedDate(activityId, date /* YYYY-MM-DD */) {
  await wait();
  const evt = ensure(activityId);
  if (!evt.availableDates.includes(date)) throw new Error('Invalid date');
  const next = clone(evt);
  next.selectedDate = date;
  writeStore(activityId, next);
  return { selectedDate: next.selectedDate };
}

export async function getSchedule(activityId, date) {
  await wait();
  const evt = ensure(activityId);
  return clone(evt.scheduleByDate[date] ?? []);
}

export async function upsertScheduleSlot(activityId, date, slot /* {id?,start,end,status} */) {
  await wait();
  const evt = ensure(activityId);
  const next = clone(evt);
  const list = next.scheduleByDate[date] ?? [];
  if (!slot.id) {
    slot.id = crypto?.randomUUID
      ? crypto.randomUUID()
      : (() => {
          const a = new Uint32Array(4);
          crypto?.getRandomValues?.(a);
          return `slot_${[...a].map(x => x.toString(16).padStart(8, '0')).join('')}`;
        })();
    list.push(slot);
  } else {
    const idx = list.findIndex(s => s.id === slot.id);
    if (idx >= 0) list[idx] = { ...list[idx], ...slot };
    else list.push(slot);
  }
  next.scheduleByDate[date] = list;
  writeStore(activityId, next);
  return clone(slot);
}

export async function deleteScheduleSlot(activityId, date, slotId) {
  await wait();
  const evt = ensure(activityId);
  const next = clone(evt);
  const list = next.scheduleByDate[date] ?? [];
  next.scheduleByDate[date] = list.filter(s => s.id !== slotId);
  writeStore(activityId, next);
  return { ok: true };
}

// ---------- Attendees / Capacity ----------
export async function getAttendees(activityId) {
  await wait();
  const evt = ensure(activityId);
  const moreCount = Math.max(0, evt.capacity.used - evt.attendees.length);
  return { attendees: clone(evt.attendees), capacity: clone(evt.capacity), moreCount };
}

export async function addAttendee(activityId, attendee /* {name, avatar?} */) {
  await wait();
  const evt = ensure(activityId);
  const next = clone(evt);
  next.attendees.push(attendee);
  next.capacity.used = Math.min(next.capacity.total, next.capacity.used + 1);
  writeStore(activityId, next);
  return clone(next.attendees);
}

export async function removeAttendee(activityId, name) {
  await wait();
  const evt = ensure(activityId);
  const next = clone(evt);
  next.attendees = next.attendees.filter(a => a.name !== name);
  next.capacity.used = Math.max(0, next.capacity.used - 1);
  writeStore(activityId, next);
  return clone(next.attendees);
}

export async function updateCapacity(activityId, nextCap /* {used?, total?} */) {
  await wait();
  const evt = ensure(activityId);
  const next = clone(evt);
  next.capacity = { ...next.capacity, ...nextCap };
  if (next.capacity.used > next.capacity.total) next.capacity.used = next.capacity.total;
  writeStore(activityId, next);
  return clone(next.capacity);
}

// ---------- Resources (Resource tab) ----------
export async function getResources(activityId) {
  await wait();
  const evt = ensure(activityId);
  return clone(evt.resources ?? []);
}

export async function upsertResource(activityId, res /* {id?,type,title,url,size?} */) {
  await wait();
  const evt = ensure(activityId);
  const next = clone(evt);
  const list = next.resources ?? [];
  if (!res.id) {
    res.id = crypto?.randomUUID
      ? crypto.randomUUID()
      : (() => {
          const a = new Uint32Array(4);
          crypto?.getRandomValues?.(a);
          return `res_${[...a].map(x => x.toString(16).padStart(8, '0')).join('')}`;
        })();
    list.push(res);
  } else {
    const idx = list.findIndex(r => r.id === res.id);
    if (idx >= 0) list[idx] = { ...list[idx], ...res };
    else list.push(res);
  }
  next.resources = list;
  writeStore(activityId, next);
  return clone(res);
}

export async function deleteResource(activityId, id) {
  await wait();
  const evt = ensure(activityId);
  const next = clone(evt);
  next.resources = (next.resources ?? []).filter(r => r.id !== id);
  writeStore(activityId, next);
  return { ok: true };
}

// ---------- Analysis (Analysis tab) ----------
export async function getAnalysis(activityId) {
  await wait();
  const evt = ensure(activityId);
  return clone(evt.analysis ?? {});
}

// ---------- Upload (for Description or Resource) ----------
export async function uploadMedia(activityId, file) {
  await wait(500);
  ensure(activityId);
  // Returns a blob preview URL for immediate display
  return {
    url: URL.createObjectURL(file),
    name: file.name,
    size: file.size,
    mime: file.type,
    uploadedAt: todayISO(),
  };
}

// ---------- Generic meta update ----------
export async function updateEventMeta(activityId, meta /* object */) {
  await wait();
  const evt = ensure(activityId);
  const next = clone(evt);

  // Preserve sections that should not be overwritten by default
  const preserved = {
    engagement: next.engagement,
    analysis: next.analysis,
    scheduleByDate: next.scheduleByDate,
    resources: next.resources,
    attendees: next.attendees,
    capacity: next.capacity,
  };

  Object.assign(next, meta);

  // Restore preserved sections unless explicitly modified
  next.engagement = meta.engagement ?? preserved.engagement;
  next.analysis = meta.analysis ?? preserved.analysis;
  next.scheduleByDate = meta.scheduleByDate ?? preserved.scheduleByDate;
  next.resources = meta.resources ?? preserved.resources;
  next.attendees = meta.attendees ?? preserved.attendees;
  next.capacity = meta.capacity ?? preserved.capacity;

  writeStore(activityId, next);
  return clone(meta);
}

// ---------- default export ----------
export default {
  // base
  getEvent,
  updateEventMeta,
  resetMock,

  // description
  updateDescription,
  uploadMedia,

  // status / rating
  updateStatus,
  updateRating,

  // dates / schedule
  updateSelectedDate,
  getSchedule,
  upsertScheduleSlot,
  deleteScheduleSlot,

  // attendees / capacity
  getAttendees,
  addAttendee,
  removeAttendee,
  updateCapacity,

  // resources
  getResources,
  upsertResource,
  deleteResource,

  // analysis & engagement
  getAnalysis,
  getEngagement,
  incrementView,
};
