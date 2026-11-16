export const MAX_REVIEW_LINKS = 10;

// Only a lookahead, so splitting stays linear (no backtracking on long input)
const PROTOCOL_AHEAD = /(?=https?:\/\/)/i;
const SEPARATORS = new Set([';', ',', ' ', '\t', '\n', '\r']);

const isSeparator = char => SEPARATORS.has(char);

const trimSeparators = value => {
  let start = 0;
  let end = value.length;
  while (start < end && isSeparator(value[start])) start += 1;
  while (end > start && isSeparator(value[end - 1])) end -= 1;
  return value.slice(start, end);
};

export const ACCEPTED_LINKS_HINT =
  'GitHub pull request, Google Doc, Dropbox shared link, Figma design or One Community page.';

/**
 * Checks the overall shape of a link: length, protocol, domain and path characters.
 * The path pattern allows ";" and ",", so a joined list of links also passes this check;
 * getLinkError rejects that case.
 */
export const validURL = url => {
  if (typeof url !== 'string' || url.trim() === '') return false;
  if (url.length < 20) return false;

  // Split validation into parts to avoid nested quantifiers
  const protocolPattern = /^https?:\/\//;
  const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  const pathPattern = /^[/\w\-.~:?#[\]@!$&'()*+,;=%]*$/;

  const urlToTest = url.startsWith('http') ? url : `https://${url}`;
  if (!protocolPattern.test(urlToTest)) return false;

  const urlWithoutProtocol = urlToTest.replace(protocolPattern, '');
  const slashIndex = urlWithoutProtocol.indexOf('/');
  const domain =
    slashIndex === -1 ? urlWithoutProtocol : urlWithoutProtocol.substring(0, slashIndex);
  const path = slashIndex === -1 ? '' : urlWithoutProtocol.substring(slashIndex);

  if (!domainPattern.test(domain)) return false;
  if (path && !pathPattern.test(path)) return false;

  try {
    // eslint-disable-next-line no-new
    new URL(urlToTest);
    return true;
  } catch {
    // The URL constructor throws for anything it cannot parse, which simply means "not valid"
    return false;
  }
};

/**
 * Validates that the link is one of the accepted domain types.
 * @returns {{ isValid: boolean, errorType: string|null }}
 */
export const validateAllowedDomainTypes = url => {
  if (!url) {
    return { isValid: false, errorType: 'missing_url' };
  }

  const normalizedUrl = url.toLowerCase();

  if (normalizedUrl.includes('docs.google.com')) {
    if (
      normalizedUrl.includes('/document/d/') ||
      normalizedUrl.includes('/spreadsheets/d/') ||
      normalizedUrl.includes('/presentation/d/') ||
      normalizedUrl.includes('/forms/d/')
    ) {
      return { isValid: true, errorType: null };
    }
    return { isValid: false, errorType: 'general_invalid' };
  }

  if (normalizedUrl.includes('dropbox.com')) {
    if (normalizedUrl.includes('dropbox.com/s/') || normalizedUrl.includes('dropbox.com/scl/')) {
      return { isValid: true, errorType: null };
    }
    return { isValid: false, errorType: 'invalid_dropbox_link' };
  }

  if (normalizedUrl.includes('github.com')) {
    if (normalizedUrl.includes('/pull/')) {
      return { isValid: true, errorType: null };
    }
    return { isValid: false, errorType: 'general_invalid' };
  }

  if (
    normalizedUrl.includes('onecommunityglobal.org') ||
    normalizedUrl.includes('onecommunityglobal.com') ||
    normalizedUrl.includes('onecommunity.org') ||
    normalizedUrl.includes('onecommunity.com')
  ) {
    return { isValid: true, errorType: null };
  }

  if (normalizedUrl.includes('figma.com')) {
    if (normalizedUrl.includes('/design/')) {
      return { isValid: true, errorType: null };
    }
    return { isValid: false, errorType: 'general_invalid' };
  }

  return { isValid: false, errorType: 'general_invalid' };
};

/**
 * Error text for one link row, or an empty string when the link is acceptable.
 */
export const getLinkError = value => {
  const url = (value || '').trim();
  if (!url) return 'Enter a link.';
  if (splitJoinedLinks(url).length > 1) {
    return 'Put one link in each row. Use "Add another link" for more.';
  }
  if (!/^https?:\/\//i.test(url) || !validURL(url)) {
    return 'Enter a full link that starts with https:// (at least 20 characters).';
  }
  const { isValid, errorType } = validateAllowedDomainTypes(url);
  if (isValid) return '';
  if (errorType === 'invalid_dropbox_link') {
    return 'Use the Share option in Dropbox so other people can open this link.';
  }
  return 'Use a GitHub pull request, Google Doc, Dropbox shared link, Figma design or One Community page.';
};

/**
 * Splits text that holds several links joined with ";", "," or whitespace into one link each.
 */
export const splitJoinedLinks = value => {
  if (!value) return [];
  // Cut before every "http(s)://", then glue back pieces that did not follow a separator,
  // so a link that carries another URL inside its query string stays whole
  const pieces = String(value)
    .split(PROTOCOL_AHEAD)
    .reduce((parts, piece) => {
      const previous = parts[parts.length - 1];
      if (previous !== undefined && !isSeparator(previous[previous.length - 1])) {
        parts[parts.length - 1] = previous + piece;
      } else {
        parts.push(piece);
      }
      return parts;
    }, []);
  return pieces.map(trimSeparators).filter(Boolean);
};

/**
 * Flattens stored links so old entries that were typed as "link;link" show as separate links.
 */
export const expandLinks = links => {
  if (!Array.isArray(links)) return [];
  return links.flatMap(item => splitJoinedLinks(item));
};

/**
 * Short name for a link, used to label the reviewer's "View" items (repo and number for a PR).
 */
export const linkLabel = url => {
  const value = (url || '').toLowerCase();
  const pullRequest = /github\.com\/[^/]+\/([^/]+)\/pull\/(\d+)/i.exec(url || '');
  if (pullRequest) return `${pullRequest[1]} PR #${pullRequest[2]}`;
  if (value.includes('github.com')) return 'GitHub PR';
  if (value.includes('docs.google.com')) return 'Google Doc';
  if (value.includes('dropbox.com')) return 'Dropbox link';
  if (value.includes('figma.com')) return 'Figma design';
  if (value.includes('onecommunity')) return 'One Community page';
  return 'link';
};
