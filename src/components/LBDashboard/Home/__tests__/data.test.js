import { vi, describe, it, expect, beforeEach } from 'vitest';
import { fetchBiddings, fetchListings, transformApiListing } from '../data';

vi.mock('../../../../services/httpService', () => ({
  default: {
    get: vi.fn(),
  },
}));

// eslint-disable-next-line import/first
import httpService from '../../../../services/httpService';

describe('transformApiListing', () => {
  it('reads the village name from a populated village object', () => {
    const result = transformApiListing({
      _id: 'listing1',
      title: 'Test Listing',
      village: { _id: 'village1', name: 'Earthbag' },
    });

    expect(result.village).toBe('Earthbag');
  });

  it('falls back to the raw village value when it is not populated', () => {
    const result = transformApiListing({
      _id: 'listing1',
      title: 'Test Listing',
      village: '67d341993930b4b0c1d81a9e',
    });

    expect(result.village).toBe('67d341993930b4b0c1d81a9e');
  });

  it('falls back to "Unknown Village" when there is no village at all', () => {
    const result = transformApiListing({ _id: 'listing1', title: 'Test Listing' });

    expect(result.village).toBe('Unknown Village');
  });
});

describe('fetchBiddings / fetchListings request shape', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    httpService.get.mockResolvedValue({ data: { data: { items: [], pagination: {} } } });
  });

  it('sends pagination and filters as query params, not headers', async () => {
    await fetchBiddings(2, 5, { village: '67d341993930b4b0c1d81a9e', availableFrom: '2026-01-01' });

    expect(httpService.get).toHaveBeenCalledWith(
      expect.stringContaining('/biddings'),
      expect.objectContaining({
        params: expect.objectContaining({
          page: '2',
          size: '5',
          village: '67d341993930b4b0c1d81a9e',
          availableFrom: '2026-01-01',
        }),
      }),
    );

    const [, config] = httpService.get.mock.calls[0];
    expect(config.headers).toBeUndefined();
  });

  it('ignores a non-ObjectId village display name as a filter', async () => {
    await fetchListings(1, 12, { village: 'Earthbag' });

    const [, config] = httpService.get.mock.calls[0];
    expect(config.params.village).toBeUndefined();
  });
});
