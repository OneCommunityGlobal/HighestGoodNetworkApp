import {
  STOP_WORDS,
  formatLocalDate,
  formatLocalTime,
  formatDisplayDateTime,
  clampScheduleDateTime,
  createScheduleId,
  topCardActions,
  fieldActionRow,
  makeButtonStyle,
} from '../../shared/postComposerUtility';

// Re-exported for backward compatibility with existing imports of this file.
export {
  STOP_WORDS,
  formatLocalDate,
  formatLocalTime,
  formatDisplayDateTime,
  clampScheduleDateTime,
  createScheduleId,
  topCardActions,
  fieldActionRow,
};

// ─── Constants ───────────────────────────────────────────────────────────────

export const TITLE_MIN = 5;
export const TITLE_MAX = 300;
export const BODY_MAX = 40000;

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

export const buttonStyle = makeButtonStyle({
  primary: () => ({ backgroundColor: '#ff4500', color: '#fff' }),
  outline: darkMode => ({
    backgroundColor: 'transparent',
    color: darkMode ? '#ff8060' : '#ff4500',
    border: `1px solid ${darkMode ? '#6b3020' : '#ff4500'}`,
  }),
  ghost: darkMode => ({
    backgroundColor: darkMode ? '#1c2b44' : '#fff0eb',
    color: darkMode ? '#ffb8a0' : '#a33000',
  }),
});
