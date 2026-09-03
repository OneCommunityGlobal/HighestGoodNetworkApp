import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { postRescheduleNotify } from '../RescheduleEvent';

const BASE = 'http://localhost:4500/api';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('postRescheduleNotify', () => {
  it('throws a safe message for non-JSON (HTML) error responses', async () => {
    const fetchStub = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        headers: {
          get: () => 'text/html; charset=utf-8',
        },
        text: () => Promise.resolve('<!doctype html><html>Not Found</html>'),
      }),
    );
    vi.stubGlobal('fetch', fetchStub);

    await expect(
      postRescheduleNotify(BASE, '18', {
        options: [{ dateISO: '2025-01-01', start: '08:00', end: '10:00' }],
      }),
    ).rejects.toThrow('Unable to send the reschedule notification. Please try again.');

    expect(fetchStub).toHaveBeenCalledWith(
      'http://localhost:4500/api/communityportal/activities/18/reschedule/notify',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws server message for JSON error responses', async () => {
    const fetchStub = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ message: 'options[] is required and must be non-empty' }),
      }),
    );
    vi.stubGlobal('fetch', fetchStub);

    await expect(postRescheduleNotify(BASE, '1', { options: [] })).rejects.toThrow(
      'options[] is required and must be non-empty',
    );
  });

  it('returns parsed json on success', async () => {
    const fetchStub = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ notified: 3 }),
      }),
    );
    vi.stubGlobal('fetch', fetchStub);

    const result = await postRescheduleNotify(BASE, '1', {
      options: [{ dateISO: '2025-01-01', start: '08:00', end: '10:00' }],
    });
    expect(result).toEqual({ notified: 3 });
  });
});
