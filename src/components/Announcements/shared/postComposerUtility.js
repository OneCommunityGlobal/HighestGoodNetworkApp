// ─── Shared post-composer utilities ─────────────────────────────────────────
//
// Used by every platform's post composer (Instagram, Reddit, Slashdot, ...).
// Platform-specific logic (caption limits, hashtag/tag extraction, flair
// rules, preview text, button colors, etc.) stays in each platform's own
// helper file — only the genuinely identical logic lives here.

// ─── Shared stop words (used for keyword/tag/flair extraction fallbacks) ────

export const STOP_WORDS = new Set([
  'about',
  'after',
  'also',
  'another',
  'because',
  'been',
  'being',
  'between',
  'can',
  'could',
  'during',
  'each',
  'from',
  'have',
  'into',
  'more',
  'other',
  'over',
  'since',
  'some',
  'than',
  'that',
  'their',
  'there',
  'these',
  'they',
  'this',
  'through',
  'under',
  'until',
  'where',
  'which',
  'while',
  'with',
  'within',
]);

// ─── Date / time utilities ───────────────────────────────────────────────────

const padTimeUnit = value => String(value).padStart(2, '0');

export const formatLocalDate = date =>
  `${date.getFullYear()}-${padTimeUnit(date.getMonth() + 1)}-${padTimeUnit(date.getDate())}`;

export const formatLocalTime = date =>
  `${padTimeUnit(date.getHours())}:${padTimeUnit(date.getMinutes())}`;

const fallbackDateTime = (dateString, timeString) => {
  const formattedTime = timeString ? `, ${timeString}` : '';
  return `${dateString}${formattedTime}`;
};

const formatParsedDateTime = (parsed, timeString) => {
  const formattedDate = parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = timeString
    ? parsed.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : '';
  return formattedTime ? `${formattedDate} • ${formattedTime}` : formattedDate;
};

export const formatDisplayDateTime = (dateString, timeString) => {
  if (!dateString) return '—';
  try {
    const parsed = new Date(`${dateString}T${timeString || '00:00'}`);
    if (Number.isNaN(parsed.getTime())) return fallbackDateTime(dateString, timeString);
    return formatParsedDateTime(parsed, timeString);
  } catch {
    return fallbackDateTime(dateString, timeString);
  }
};

/**
 * Clamps a (date, time) pair so neither is in the past relative to right now.
 * Used when loading a saved schedule for editing and when picker values change.
 */
export const clampScheduleDateTime = (targetDate, targetTime) => {
  const today = formatLocalDate(new Date());
  const date = !targetDate || targetDate < today ? today : targetDate;
  let time = targetTime || '00:00';
  if (date === today) {
    const nowTime = formatLocalTime(new Date());
    if (time < nowTime) time = nowTime;
  }
  return { date, time };
};

// ─── Schedule ID ──────────────────────────────────────────────────────────────

const getSecureBase36 = length => {
  const chars = [];
  const max = 36 * 7;
  while (chars.length < length) {
    const bytes = new Uint8Array(length);
    globalThis.crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte >= max) continue;
      chars.push((byte % 36).toString(36));
      if (chars.length === length) break;
    }
  }
  return chars.join('');
};

export const createScheduleId = () => `schedule-${Date.now().toString(36)}-${getSecureBase36(6)}`;

// ─── Shared layout styles ─────────────────────────────────────────────────────

export const topCardActions = () => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  marginTop: '16px',
});

export const fieldActionRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: '12px',
};

// ─── Button style factory ─────────────────────────────────────────────────────
//
// Every platform's buttonStyle() has the same shape and base styles but a
// different accent palette. Each platform defines its own palette and gets
// back a buttonStyle(variant, darkMode) function with the same signature
// the old, duplicated implementations had.

const BASE_BUTTON_STYLE = {
  borderRadius: '999px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  padding: '10px 18px',
  transition: 'filter 0.2s ease',
};

/**
 * @param {{
 *   primary: (darkMode: boolean) => object,
 *   outline: (darkMode: boolean) => object,
 *   ghost: (darkMode: boolean) => object,
 * }} palette
 * @returns {(variant: 'primary' | 'outline' | 'ghost', darkMode: boolean) => object}
 */
export const makeButtonStyle = palette => (variant, darkMode) => {
  if (variant === 'primary') return { ...BASE_BUTTON_STYLE, ...palette.primary(darkMode) };
  if (variant === 'outline') return { ...BASE_BUTTON_STYLE, ...palette.outline(darkMode) };
  return { ...BASE_BUTTON_STYLE, ...palette.ghost(darkMode) };
};
