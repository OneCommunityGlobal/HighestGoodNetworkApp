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

export const CAPTION_MAX = 2200;
export const ALT_TEXT_MAX = 300;
export const HASHTAG_MAX_COUNT = 30;

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

export const buttonStyle = makeButtonStyle({
  primary: () => ({
    backgroundImage: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    color: '#fff',
  }),
  outline: darkMode => ({
    backgroundColor: 'transparent',
    color: darkMode ? '#e07bb0' : '#bc1888',
    border: `1px solid ${darkMode ? '#5c2a49' : '#dc2743'}`,
  }),
  ghost: darkMode => ({
    backgroundColor: darkMode ? '#3a2436' : '#fce9f3',
    color: darkMode ? '#f0a8cf' : '#9c1361',
  }),
});
