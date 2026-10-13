import { IANA_TLDS } from './ianaTlds';

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Popular mailbox providers. A near miss of one of these is almost always a typo.
const POPULAR_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.co.in',
  'ymail.com',
  'rocketmail.com',
  'outlook.com',
  'hotmail.com',
  'hotmail.co.uk',
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

// Short domains are too easy to confuse with real ones (gm.com vs gmx.com), so only
// longer domains get fuzzy matching, and only the longest allow two edits.
function maxEditsFor(domain) {
  if (domain.length < 7) return 0;
  return domain.length < 10 ? 1 : 2;
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

function suggestDomain(domain) {
  if (POPULAR_DOMAINS.includes(domain)) return null;
  const provider = closest(domain, POPULAR_DOMAINS, maxEditsFor(domain));
  if (provider) return provider;

  const dot = domain.lastIndexOf('.');
  const tld = domain.slice(dot + 1);
  if (IANA_TLDS.has(toAsciiTld(domain))) return null;
  const fixedTld = closest(tld, COMMON_TLDS, 1);
  return fixedTld ? `${domain.slice(0, dot + 1)}${fixedTld}` : null;
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

  const at = email.lastIndexOf('@');
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const lowerDomain = domain.toLowerCase();

  if (!EMAIL_FORMAT.test(email)) {
    // "name@gmail" is missing its ending; offer the provider's full domain
    const provider =
      at > 0 && lowerDomain && !lowerDomain.includes('.')
        ? POPULAR_DOMAINS.find(d => d.split('.')[0] === lowerDomain)
        : null;
    return {
      error: 'Please enter a valid email address.',
      suggestion: provider ? `${local}@${provider}` : null,
    };
  }

  const suggestedDomain = suggestDomain(lowerDomain);
  const suggestion = suggestedDomain ? `${local}@${suggestedDomain}` : null;

  if (!IANA_TLDS.has(toAsciiTld(lowerDomain))) {
    const tld = domain.split('.').pop();
    return { error: `".${tld}" isn't a valid email domain ending. Check for a typo.`, suggestion };
  }

  return { error: '', suggestion };
}
