import { IANA_TLDS } from '../ianaTlds';

describe('IANA_TLDS', () => {
  it('holds every entry from the IANA file, each one whole', () => {
    expect(IANA_TLDS.size).toBe(1437);
    IANA_TLDS.forEach(tld => {
      expect(tld).toMatch(/^([a-z]{2,}|xn--[a-z0-9-]+)$/);
    });
  });

  it('includes internationalized endings such as .한국 and .中国', () => {
    expect(IANA_TLDS.has('xn--3e0b707e')).toBe(true);
    expect(IANA_TLDS.has('xn--fiqs8s')).toBe(true);
  });
});
