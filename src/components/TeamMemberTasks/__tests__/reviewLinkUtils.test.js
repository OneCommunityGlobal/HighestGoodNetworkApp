import { describe, it, expect } from 'vitest';
import {
  expandLinks,
  getLinkError,
  linkLabel,
  splitJoinedLinks,
  validURL,
  validateAllowedDomainTypes,
} from '../reviewLinkUtils';

const PR_ONE = 'https://github.com/OneCommunityGlobal/HighestGoodNetworkApp/pull/5675';
const PR_TWO = 'https://github.com/OneCommunityGlobal/HGNRest/pull/2414';
const DOC = 'https://docs.google.com/document/d/1zifX1otZPl-VJLQk0sZqZbQFginRytlQ2vKHeQAh_Lo/edit';
const DROPBOX = 'https://www.dropbox.com/scl/fo/abc123/x?rlkey=1&dl=0';

describe('getLinkError', () => {
  it('accepts each allowed link type', () => {
    expect(getLinkError(PR_ONE)).toBe('');
    expect(getLinkError(DOC)).toBe('');
    expect(getLinkError(DROPBOX)).toBe('');
    expect(getLinkError('https://www.figma.com/design/abc123/My-file')).toBe('');
    expect(getLinkError('https://www.onecommunityglobal.org/collaboration/')).toBe('');
  });

  it('asks for a link when the row is empty', () => {
    expect(getLinkError('')).toBe('Enter a link.');
    expect(getLinkError('   ')).toBe('Enter a link.');
  });

  it('rejects several links joined with ";", "," or a space in one row', () => {
    const message = 'Put one link in each row. Use "Add another link" for more.';
    expect(getLinkError(`${PR_ONE};${PR_TWO}`)).toBe(message);
    expect(getLinkError(`${PR_ONE},${PR_TWO}`)).toBe(message);
    expect(getLinkError(`${PR_ONE} ${PR_TWO}`)).toBe(message);
    expect(getLinkError(`${PR_ONE};https://anything.example/x`)).toBe(message);
  });

  it('rejects a link without https:// even though the shape check would accept it', () => {
    expect(validURL('github.com/OneCommunityGlobal/HGNRest/pull/2414')).toBe(true);
    expect(getLinkError('github.com/OneCommunityGlobal/HGNRest/pull/2414')).toMatch(
      /starts with https:\/\//,
    );
  });

  it('explains a Dropbox link that is not a share link', () => {
    expect(getLinkError('https://www.dropbox.com/home/Week%204')).toMatch(/Share option/);
  });

  it('rejects other sites', () => {
    expect(getLinkError('https://example.com/some/long/path/here')).toMatch(
      /GitHub pull request, Google Doc/,
    );
  });
});

describe('validateAllowedDomainTypes', () => {
  it('keeps the existing domain rules', () => {
    expect(validateAllowedDomainTypes(PR_ONE).isValid).toBe(true);
    expect(
      validateAllowedDomainTypes('https://github.com/OneCommunityGlobal/HGNRest').isValid,
    ).toBe(false);
    expect(validateAllowedDomainTypes('')).toEqual({ isValid: false, errorType: 'missing_url' });
  });
});

describe('splitJoinedLinks and expandLinks', () => {
  it('splits links joined with ";", "," and whitespace', () => {
    expect(splitJoinedLinks(`${PR_ONE};${PR_TWO}`)).toEqual([PR_ONE, PR_TWO]);
    expect(splitJoinedLinks(`${PR_ONE}, ${PR_TWO}`)).toEqual([PR_ONE, PR_TWO]);
    expect(splitJoinedLinks(`${PR_ONE}\n${PR_TWO}`)).toEqual([PR_ONE, PR_TWO]);
  });

  it('keeps a single link, including ones with ";" or "," in the query, in one piece', () => {
    const withQuery = 'https://www.dropbox.com/scl/fo/abc/x?a=1;b=2,c=3';
    expect(splitJoinedLinks(withQuery)).toEqual([withQuery]);
    expect(splitJoinedLinks('')).toEqual([]);
  });

  it('flattens stored entries and tolerates a missing list', () => {
    expect(expandLinks([`${PR_ONE};${PR_TWO}`, DOC])).toEqual([PR_ONE, PR_TWO, DOC]);
    expect(expandLinks(undefined)).toEqual([]);
  });
});

describe('linkLabel', () => {
  it('names the site, with the repo and number for a pull request', () => {
    expect(linkLabel(PR_ONE)).toBe('HighestGoodNetworkApp PR #5675');
    expect(linkLabel('https://github.com/OneCommunityGlobal/HGNRest/pulls')).toBe('GitHub PR');
    expect(linkLabel(DOC)).toBe('Google Doc');
    expect(linkLabel(DROPBOX)).toBe('Dropbox link');
    expect(linkLabel('https://www.figma.com/design/x')).toBe('Figma design');
    expect(linkLabel('https://www.onecommunityglobal.org/')).toBe('One Community page');
    expect(linkLabel('https://example.com')).toBe('link');
  });
});
