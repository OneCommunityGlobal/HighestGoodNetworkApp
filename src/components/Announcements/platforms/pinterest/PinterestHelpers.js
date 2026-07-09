// ─── Pinterest field constants ─────────────────────────────────────────────────
export const PIN_TITLE_MIN = 2;
export const PIN_TITLE_MAX = 100;
export const PIN_DESC_MAX = 500;
export const PIN_NOTE_MAX = 500; // alt text cap

// ─── String sanitizers ─────────────────────────────────────────────────────────

/**
 * Strips characters disallowed in Pinterest board names.
 * Allows letters, digits, spaces, hyphens, and ampersands.
 */
export function sanitizeBoardName(raw) {
  return raw.replace(/[^a-zA-Z0-9 \-&]/g, '').slice(0, 50);
}

// ─── Preview builder ───────────────────────────────────────────────────────────

/**
 * Builds a plain-text preview block for a Pinterest pin.
 */
export function buildPinPreview({ title, link, board, tag, description, alt }) {
  const lines = [];
  if (title?.trim()) lines.push(`📌 Title: ${title.trim()}`);
  if (board?.trim()) lines.push(`📋 Board: ${board.trim()}`);
  if (link?.trim()) lines.push(`🔗 Link: ${link.trim()}`);
  if (tag?.trim()) lines.push(`🏷️ Tag: ${tag.trim()}`);
  if (description?.trim()) lines.push(`\n📝 Description:\n${description.trim()}`);
  if (alt?.trim()) lines.push(`\n♿ Alt text: ${alt.trim()}`);
  return lines.join('\n');
}

// ─── Date / time formatters ────────────────────────────────────────────────────

/** Returns a local date string in YYYY-MM-DD format. */
export function formatPinDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Returns a local time string in HH:MM format. */
export function formatPinTime(dateObj) {
  const h = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

/** Returns a human-readable "Month D, YYYY at HH:MM" string. */
export function formatPinDisplayDateTime(dateStr, timeStr) {
  if (!dateStr) return 'No date set';
  const [year, month, day] = dateStr.split('-').map(Number);
  const months = [
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
  const base = `${months[month - 1]} ${day}, ${year}`;
  return timeStr ? `${base} at ${timeStr}` : base;
}

// ─── Schedule clamping ─────────────────────────────────────────────────────────

/**
 * Ensures the given date+time combo is not in the past.
 * Returns a { date, time } object clamped to now if necessary.
 */
export function clampPinScheduleDateTime(dateStr, timeStr) {
  const now = new Date();
  const todayStr = formatPinDate(now);
  const currentTimeStr = formatPinTime(now);

  let clampedDate = dateStr;
  let clampedTime = timeStr;

  if (dateStr < todayStr) {
    clampedDate = todayStr;
    clampedTime = currentTimeStr;
  } else if (dateStr === todayStr && timeStr < currentTimeStr) {
    clampedTime = currentTimeStr;
  }

  return { date: clampedDate, time: clampedTime };
}

// ─── ID generator ─────────────────────────────────────────────────────────────

/** Generates a unique pin queue entry ID. */
export function generatePinId() {
  return `pin_${Date.now()}_${crypto
    .randomUUID()
    .toString(36)
    .slice(2, 8)}`;
}

// ─── Tag suggestions ───────────────────────────────────────────────────────────

const PIN_KEYWORD_MAPS = {
  diy: ['DIY', 'Handmade', 'Craft'],
  recipe: ['Recipe', 'Food', 'Cooking'],
  travel: ['Travel', 'Wanderlust', 'Adventure'],
  fashion: ['Fashion', 'Style', 'Outfit'],
  decor: ['Home Decor', 'Interior Design', 'Aesthetic'],
  fitness: ['Fitness', 'Workout', 'Health'],
  garden: ['Garden', 'Plants', 'Nature'],
  beauty: ['Beauty', 'Skincare', 'Makeup'],
  tech: ['Technology', 'Gadgets', 'Innovation'],
  art: ['Art', 'Creative', 'Design'],
  business: ['Business', 'Entrepreneurship', 'Marketing'],
  kids: ['Parenting', 'Kids', 'Family'],
};

/**
 * Returns up to 5 tag suggestions derived from pin title, description, and board.
 */
export function extractTagSuggestions(title = '', description = '', board = '') {
  const combined = `${title} ${description} ${board}`.toLowerCase();
  const found = [];
  for (const [keyword, tags] of Object.entries(PIN_KEYWORD_MAPS)) {
    if (combined.includes(keyword)) found.push(...tags);
    if (found.length >= 5) break;
  }
  return [...new Set(found)].slice(0, 5);
}

// ─── Style helpers ─────────────────────────────────────────────────────────────

/** Returns inline style for top-card action row. */
export function pinTopCardActions() {
  return { display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' };
}

/** Returns inline styles for a button variant. */
export function pinButtonStyle(variant, isDark) {
  const base = {
    padding: '7px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.15s',
  };

  if (variant === 'primary') {
    return { ...base, background: '#e60023', color: '#fff' };
  }
  if (variant === 'outline') {
    return {
      ...base,
      background: 'transparent',
      border: isDark ? '1px solid #555' : '1px solid #ccc',
      color: isDark ? '#e5e7eb' : '#374151',
    };
  }
  // ghost
  return {
    ...base,
    background: isDark ? '#1f2937' : '#f3f4f6',
    color: isDark ? '#d1d5db' : '#374151',
  };
}

/** Inline style for the field action button row. */
export const pinFieldRow = {
  display: 'flex',
  gap: '6px',
  marginTop: '10px',
  flexWrap: 'wrap',
};

// ─── Backend API helpers ───────────────────────────────────────────────────────
// Matches existing routes in src/routes/socialMediaRouter.js:
//   POST   /api/pinterest/createPin
//   POST   /api/pinterest/schedule
//   GET    /api/pinterest/schedule
//   DELETE /api/pinterest/schedule/:id

const PIN_BASE = '/api/social/pinterest';
// helper to get token
function getAuthHeader() {
  return { Authorization: localStorage.getItem('token') };
}
/**
 * Publishes a pin immediately to Pinterest via the backend.
 * Calls POST /api/pinterest/createPin
 * Backend saves nothing to DB — pin goes straight to Pinterest.
 *
 * @param {Object} pinRecord - { pinTitle, pinDescription, destinationLink, boardName, pinTag, altCaption, imageUrl, imgType, mediaItems }
 * @returns {Promise<Object>} Pinterest API response from backend
 */
export async function publishPinNow(pinRecord) {
  const response = await fetch(`${PIN_BASE}/createPin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      title: pinRecord.pinTitle,
      description: pinRecord.pinDescription || '',
      imgType: pinRecord.imgType || 'URL',
      mediaItems: pinRecord.imageUrl ? { url: pinRecord.imageUrl } : pinRecord.mediaItems,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Publish failed (${response.status})`);
  }

  return response.json();
}

/**
 * Saves a pin to the schedule in MongoDB.
 * Calls POST /api/pinterest/schedule
 * The cron job (pinterestScheduleJob.js) picks it up and posts when scheduledTime arrives,
 * then deletes the record from DB automatically.
 *
 * @param {Object} pinRecord - { pinTitle, pinDescription, imageUrl, imgType, mediaItems, scheduledDate, scheduledTime }
 * @returns {Promise<void>}
 */
export async function savePinToBackend(pinRecord) {
  //const scheduledAt = `${pinRecord.scheduledDate}T${pinRecord.scheduledTime}:00.000Z`

  const response = await fetch(`${PIN_BASE}/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      title: pinRecord.pinTitle,
      description: pinRecord.pinDescription || '',
      imgType: pinRecord.imgType || 'URL',
      mediaItems: pinRecord.imageUrl ? { url: pinRecord.imageUrl } : pinRecord.mediaItems,
      scheduledTime: `${pinRecord.scheduledDate}T${pinRecord.scheduledTime}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Schedule failed (${response.status})`);
  }
}

/**
 * Fetches all scheduled pins from MongoDB.
 * Calls GET /api/pinterest/schedule
 * Note: published pins are deleted from DB by the cron job after posting,
 * so this list only ever contains pending/future pins.
 *
 * @returns {Promise<Array>} Array of scheduled pin records
 */
export async function fetchSavedPins() {
  const response = await fetch(`${PIN_BASE}/schedule`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed (${response.status})`);
  }

  const data = await response.json();
  return data.map(entry => ({
    id: entry._id,
    pinTitle: JSON.parse(entry.postData)?.title || 'Untitled',
    draftText: entry.postData,
    scheduledDate: entry.scheduledTime
      ? new Date(entry.scheduledTime).toLocaleDateString('en-CA') // YYYY-MM-DD in local time
      : '',
    scheduledTime: entry.scheduledTime
      ? `${String(new Date(entry.scheduledTime).getHours()).padStart(2, '0')}:${String(
          new Date(entry.scheduledTime).getMinutes(),
        ).padStart(2, '0')}`
      : '',
  }));
}

/**
 * Deletes a scheduled pin from MongoDB.
 * Calls DELETE /api/pinterest/schedule/:id
 *
 * @param {string} pinEntryId - MongoDB _id of the scheduled pin
 * @returns {Promise<void>}
 */
export async function deletePinFromBackend(pinEntryId) {
  const response = await fetch(`${PIN_BASE}/schedule/${pinEntryId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`Delete failed (${response.status})`);
  }
}
