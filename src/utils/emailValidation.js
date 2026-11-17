import { IANA_TLDS } from './ianaTlds';

const MAX_EMAIL_LENGTH = 254;
const WHITESPACE = /\s/;
// Zero-width and word-joiner characters ride along with copy-paste and are invisible on screen
const HIDDEN_CHARACTERS = /[\u200B-\u200D\u2060\uFEFF]/;
const INVALID_EMAIL = 'Please enter a valid email address.';
const HIDDEN_CHARACTER_ERROR = 'This email has a hidden character in it. Please retype it.';

// Popular mailbox providers. A near miss of one of these is almost always a typo.
// Regional domains are listed so their own typos get caught (hotmial.ca -> hotmail.ca).
const POPULAR_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.co.in',
  'yahoo.ca',
  'ymail.com',
  'rocketmail.com',
  'outlook.com',
  'hotmail.com',
  'hotmail.co.uk',
  'hotmail.ca',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'mail.com',
  'email.com',
  'gmx.com',
  'gmx.net',
  'zoho.com',
  'yandex.com',
  'comcast.net',
  'verizon.net',
  'att.net',
  'sbcglobal.net',
];

// Endings offered when the typed one doesn't exist (".con" -> ".com").
const COMMON_TLDS = ['com', 'net', 'org', 'edu', 'gov', 'io', 'us', 'uk', 'ca', 'in', 'de', 'info'];

// Split "hotmail.co.uk" into the provider name and the rest.
function splitDomain(domain) {
  const dot = domain.indexOf('.');
  return { name: domain.slice(0, dot), suffix: domain.slice(dot + 1) };
}

// Optimal string alignment distance: insertions, deletions, substitutions and adjacent swaps
// each count as one edit, so "gmial" is one edit from "gmail".
function editDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j += 1) d[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

function closest(value, candidates, maxEdits) {
  let best = null;
  let bestDistance = maxEdits + 1;
  candidates.forEach(candidate => {
    const distance = editDistance(value, candidate);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  });
  return best;
}

function toAsciiTld(domain) {
  try {
    // The URL parser converts internationalized domains to punycode, which is how IANA lists them
    return new URL(`http://${domain}`).hostname.split('.').pop();
  } catch {
    return domain.split('.').pop();
  }
}

function hasRealTld(domain) {
  return IANA_TLDS.has(toAsciiTld(domain));
}

// Provider names close enough to count as a typo. Short names allow one edit, long ones two,
// and the first letter must match so different words ("cloud" vs "icloud") aren't "corrected".
function isProviderTypo(name, providerName) {
  if (name === providerName) return true;
  if (name.length < 4 || name[0] !== providerName[0]) return false;
  return editDistance(name, providerName) <= (name.length < 9 ? 1 : 2);
}

// Only the provider name is fuzzy-matched. The ending is kept unless it doesn't exist
// (gmail.con) or is a one-letter slip of ".com" (gmail.co, gmail.cm), so real regional
// domains like hotmail.ca, hotmail.cl or yahoo.co.jp are left alone.
function suggestProvider(domain) {
  const { name, suffix } = splitDomain(domain);
  const providers = POPULAR_DOMAINS.filter(d => isProviderTypo(name, splitDomain(d).name));
  const sameSuffix = providers.find(d => splitDomain(d).suffix === suffix);
  if (sameSuffix) return sameSuffix;
  if (!hasRealTld(domain)) {
    const nearest = closest(suffix, providers.map(d => splitDomain(d).suffix), Infinity);
    return providers.find(d => splitDomain(d).suffix === nearest) || null;
  }
  const dotCom = providers.find(d => splitDomain(d).suffix === 'com');
  return dotCom && editDistance(suffix, 'com') === 1 ? dotCom : null;
}

function suggestDomain(domain) {
  if (POPULAR_DOMAINS.includes(domain)) return null;
  const provider = suggestProvider(domain);
  if (provider) return provider;
  if (hasRealTld(domain)) return null;
  // Not a provider: fix only the ending ("school.ogr" -> "school.org")
  const dot = domain.lastIndexOf('.');
  const fixedTld = closest(domain.slice(dot + 1), COMMON_TLDS, 1);
  return fixedTld ? `${domain.slice(0, dot + 1)}${fixedTld}` : null;
}

// Same rule as /^[^\s@]+@[^\s@]+\.[^\s@]+$/ (exactly one @, a non-empty local part, and a
// dot inside the domain with characters on both sides), checked without a backtracking regex.
function hasEmailFormat(value) {
  if (WHITESPACE.test(value)) return false;
  const parts = value.split('@');
  if (parts.length !== 2 || !parts[0]) return false;
  const domain = parts[1];
  const dot = domain.indexOf('.', 1);
  return dot > 0 && dot < domain.length - 1;
}

function stripTrailingDots(value) {
  let end = value.length;
  while (end > 0 && value[end - 1] === '.') end -= 1;
  return value.slice(0, end);
}

// A suggestion is only offered if it would pass the check itself.
function validSuggestion(local, domain) {
  const suggestion = `${local}@${domain}`;
  return hasEmailFormat(suggestion) && hasRealTld(domain) ? suggestion : null;
}

// A malformed address can still have an obvious intended form worth offering
function suggestForMalformed(local, lowerDomain, at) {
  if (at <= 0) return null;
  // "name@gmail.com." only has stray trailing dots
  const undotted = stripTrailingDots(lowerDomain);
  if (undotted !== lowerDomain && hasEmailFormat(`${local}@${undotted}`)) {
    const fixed = hasRealTld(undotted) ? undotted : suggestDomain(undotted);
    return fixed ? validSuggestion(local, fixed) : null;
  }
  // "name@gmail" is missing its ending; offer the provider's full domain
  if (!lowerDomain || lowerDomain.includes('.')) return null;
  const provider = POPULAR_DOMAINS.find(d => d.split('.')[0] === lowerDomain);
  return provider ? `${local}@${provider}` : null;
}

/**
 * Validate an applicant's email address.
 * `error` blocks submission: the address is malformed or its ending isn't a real top-level
 * domain (name@gmail.con). `suggestion` is a likely intended address for common typos
 * (name@gmial.com -> name@gmail.com); it never blocks, since the typed address may be real.
 * @param {string} rawEmail
 * @returns {{ error: string, suggestion: string | null }}
 */
export function checkEmail(rawEmail) {
  const email = String(rawEmail ?? '').trim();
  if (!email) return { error: 'Email is required.', suggestion: null };
  if (email.length > MAX_EMAIL_LENGTH) return { error: INVALID_EMAIL, suggestion: null };
  if (HIDDEN_CHARACTERS.test(email)) return { error: HIDDEN_CHARACTER_ERROR, suggestion: null };

  const at = email.lastIndexOf('@');
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const lowerDomain = domain.toLowerCase();

  if (!hasEmailFormat(email) || lowerDomain.endsWith('.')) {
    return { error: INVALID_EMAIL, suggestion: suggestForMalformed(local, lowerDomain, at) };
  }

  const suggestedDomain = suggestDomain(lowerDomain);
  const suggestion = suggestedDomain ? validSuggestion(local, suggestedDomain) : null;

  if (!hasRealTld(lowerDomain)) {
    const tld = domain.split('.').pop();
    // With a suggestion on screen, the hint already says how to fix it
    const advice = suggestion ? '' : ' Check for a typo.';
    return { error: `".${tld}" isn't a valid email domain ending.${advice}`, suggestion };
  }

  return { error: '', suggestion };
}
