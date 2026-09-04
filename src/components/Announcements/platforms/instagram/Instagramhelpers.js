// ─── Constants ───────────────────────────────────────────────────────────────

export const CAPTION_MAX = 2200;
export const ALT_TEXT_MAX = 300;
export const HASHTAG_MAX_COUNT = 30;

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

// Keyword → curated hashtag set, checked before falling back to generic
// word extraction. Keep this list small and obviously non-exhaustive —
// it's a starting point for the user, not a growth-hack tool.
export const KEYWORD_HASHTAG_MAP = {
  travel: ['#travel', '#wanderlust', '#explore'],
  food: ['#food', '#foodie', '#instafood'],
  fitness: ['#fitness', '#workout', '#gym'],
  art: ['#art', '#artist', '#creative'],
  photography: ['#photography', '#photooftheday', '#instaphoto'],
  fashion: ['#fashion', '#style', '#ootd'],
  business: ['#business', '#entrepreneur', '#smallbusiness'],
  music: ['#music', '#musician', '#newmusic'],
};

// ─── String / field utilities ─────────────────────────────────────────────────

/** Strips whitespace and normalizes a hashtag to start with exactly one #. */
export const sanitizeHashtag = raw => {
  const trimmed = raw.trim().replace(/^#+/, '');
  if (!trimmed) return '';
  return `#${trimmed.replace(/[^\w]/g, '')}`;
};

/** Parses a free-text hashtag field into a deduped, capped array of tags. */
export const parseHashtags = raw =>
  raw
    .split(/[\s,]+/)
    .map(sanitizeHashtag)
    .filter(Boolean)
    .filter((tag, index, arr) => arr.indexOf(tag) === index)
    .slice(0, HASHTAG_MAX_COUNT);

export const buildPreview = ({ caption, hashtags, altText, location }) => {
  const tagList = parseHashtags(hashtags || '');
  const tagLine = tagList.length > 0 ? tagList.join(' ') : '(none)';
  return `Caption\n${caption?.trim() ||
    '—'}\n\nHashtags\n${tagLine}\n\nLocation\n${location?.trim() ||
    '(none)'}\n\nAlt text\n${altText?.trim() || '(none)'}\n`;
};

/** The text you'd actually paste into Instagram: caption + hashtags combined. */
export const buildCaptionForClipboard = ({ caption, hashtags }) => {
  const tagList = parseHashtags(hashtags || '');
  const tagBlock = tagList.length > 0 ? `\n\n${tagList.join(' ')}` : '';
  return `${caption?.trim() || ''}${tagBlock}`;
};

// ─── Date / time utilities ────────────────────────────────────────────────────

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

// ─── Hashtag suggestion ────────────────────────────────────────────────────────

export const extractHashtagSuggestions = (caption, altText) => {
  const text = `${caption} ${altText}`.toLowerCase();

  const matched = [];
  for (const [keyword, tags] of Object.entries(KEYWORD_HASHTAG_MAP)) {
    if (text.includes(keyword)) {
      for (const tag of tags) {
        if (!matched.includes(tag)) matched.push(tag);
      }
    }
  }
  if (matched.length > 0) return matched;

  // Fallback: turn distinctive words from the caption into hashtags
  const words = text.match(/[a-z0-9']+/g) || [];
  return words
    .map(word => word.replaceAll("'", ''))
    .filter(word => word.length >= 4 && !STOP_WORDS.has(word))
    .filter((word, index, arr) => arr.indexOf(word) === index)
    .slice(0, 5)
    .map(word => `#${word}`);
};

// ─── Style utilities ──────────────────────────────────────────────────────────

export const topCardActions = () => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  marginTop: '16px',
});

export const buttonStyle = (variant, darkMode) => {
  const base = {
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    padding: '10px 18px',
    transition: 'filter 0.2s ease',
  };
  if (variant === 'primary')
    return {
      ...base,
      backgroundImage: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
      color: '#fff',
    };
  if (variant === 'outline')
    return {
      ...base,
      backgroundColor: 'transparent',
      color: darkMode ? '#e07bb0' : '#bc1888',
      border: `1px solid ${darkMode ? '#5c2a49' : '#dc2743'}`,
    };
  return {
    ...base,
    backgroundColor: darkMode ? '#3a2436' : '#fce9f3',
    color: darkMode ? '#f0a8cf' : '#9c1361',
  };
};

export const fieldActionRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: '12px',
};
