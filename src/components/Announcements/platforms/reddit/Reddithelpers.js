// ─── Constants ───────────────────────────────────────────────────────────────

export const TITLE_MIN = 5;
export const TITLE_MAX = 300;
export const BODY_MAX = 40000;

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

export const FLAIR_RULES = [
  {
    flair: 'Question',
    patterns: [/\?/, /\bhow\b/, /\bwhat\b/, /\bwhy\b/, /\bhelp\b/, /\bissue\b/, /\bproblem\b/],
  },
  {
    flair: 'Discussion',
    patterns: [/\bdiscussion\b/, /\bthoughts\b/, /\bopinion\b/, /\bdebate\b/, /\bshould\b/],
  },
  {
    flair: 'News',
    patterns: [
      /\bnews\b/,
      /\breleased\b/,
      /\blaunch\b/,
      /\bannouncement\b/,
      /\bupdate\b/,
      /\bbreaking\b/,
    ],
  },
  {
    flair: 'Tutorial',
    patterns: [/\btutorial\b/, /\bguide\b/, /\bstep[- ]by[- ]step\b/, /\blearn\b/],
  },
  {
    flair: 'Showcase',
    patterns: [/\bshowcase\b/, /\bproject\b/, /\bbuilt\b/, /\bmade\b/, /\bcreated\b/],
  },
  {
    flair: 'Bug',
    patterns: [/\bbug\b/, /\berror\b/, /\bfix\b/, /\bcrash\b/, /\bissue\b/],
  },
];

// ─── String / field utilities ─────────────────────────────────────────────────

/** Strips r/ prefix and non-alphanumeric-underscore chars; caps at 21 chars. */
export const sanitizeSubreddit = raw =>
  raw
    .trim()
    .replace(/^r\//, '')
    .replace(/\W/g, '')
    .slice(0, 21);

export const buildPreview = ({ title, url, subreddit, flair, body }) =>
  `Subreddit\nr/${subreddit?.trim() || '—'}\n\nTitle\n${title?.trim() ||
    '—'}\n\nURL\n${url?.trim() || '—'}\n\nBody\n${body?.trim() || '—'}\n\nFlair\n${flair?.trim() ||
    '(none)'}\n`;

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

// ─── Flair extraction ─────────────────────────────────────────────────────────

const SUBREDDIT_FLAIR_MAP = {
  reactjs: ['Help', 'Discussion', 'Showcase'],
  javascript: ['Question', 'Discussion', 'News'],
  programming: ['Discussion', 'News', 'Tutorial'],
  webdev: ['Showcase', 'Tutorial', 'Question'],
};

export const extractFlairSuggestions = (title, body, subreddit = '') => {
  const text = `${title} ${body}`.toLowerCase();
  const normalizedSubreddit = subreddit.toLowerCase();

  if (SUBREDDIT_FLAIR_MAP[normalizedSubreddit]) {
    return SUBREDDIT_FLAIR_MAP[normalizedSubreddit];
  }

  const matchedFlairs = [];
  for (const rule of FLAIR_RULES) {
    if (rule.patterns.some(p => p.test(text)) && !matchedFlairs.includes(rule.flair)) {
      matchedFlairs.push(rule.flair);
    }
  }

  if (matchedFlairs.length > 0) return matchedFlairs;

  // Fallback: keyword extraction
  const words = text.match(/[a-z0-9']+/g) || [];
  return words
    .map(word => word.replaceAll("'", ''))
    .filter(word => word.length >= 4 && !STOP_WORDS.has(word))
    .filter((word, index, arr) => arr.indexOf(word) === index)
    .slice(0, 3);
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
  if (variant === 'primary') return { ...base, backgroundColor: '#ff4500', color: '#fff' };
  if (variant === 'outline')
    return {
      ...base,
      backgroundColor: 'transparent',
      color: darkMode ? '#ff8060' : '#ff4500',
      border: `1px solid ${darkMode ? '#6b3020' : '#ff4500'}`,
    };
  return {
    ...base,
    backgroundColor: darkMode ? '#1c2b44' : '#fff0eb',
    color: darkMode ? '#ffb8a0' : '#a33000',
  };
};

export const fieldActionRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: '12px',
};
