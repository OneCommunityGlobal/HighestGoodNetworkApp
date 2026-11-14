import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getEvents } from '../eventActions';
import { ENDPOINTS } from '../../utils/URL';

vi.mock('axios');

describe('getEvents', () => {
  beforeEach(() => {
    axios.get.mockReset();
    axios.get.mockResolvedValue({ status: 200, data: { events: [] } });
  });

  it('omits pagination parameters when all events are requested', async () => {
    await getEvents({ limit: null, sortBy: 'date', sortOrder: 'desc' });

    const requestUrl = new URL(axios.get.mock.calls[0][0], 'http://localhost');
    expect(requestUrl.pathname).toBe(new URL(ENDPOINTS.EVENTS).pathname);
    expect(requestUrl.searchParams.has('page')).toBe(false);
    expect(requestUrl.searchParams.has('limit')).toBe(false);
    expect(requestUrl.searchParams.get('sortBy')).toBe('date');
    expect(requestUrl.searchParams.get('sortOrder')).toBe('desc');
  });

  it('keeps the existing paginated defaults for other callers', async () => {
    await getEvents();

    const requestUrl = new URL(axios.get.mock.calls[0][0], 'http://localhost');
    expect(requestUrl.searchParams.get('page')).toBe('1');
    expect(requestUrl.searchParams.get('limit')).toBe('9');
  });
});
