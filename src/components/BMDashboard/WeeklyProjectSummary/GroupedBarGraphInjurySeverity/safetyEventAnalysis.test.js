import { describe, it, expect } from 'vitest';
import { validEventDate, timelineMarkers, bucketTime } from './safetyEventAnalysis';

describe('temporary safety event placement', () => {
  it('groups same-date events and respects exact dates and project selections', () => {
    const events = [
      { id: 'a', date: '2025-01-10', name: 'Training', project: '' },
      { id: 'b', date: '2025-01-10', name: 'Policy', project: 'one' },
      { id: 'c', date: '2025-01-31', name: 'Audit', project: 'two' },
      { id: 'd', date: '2025-02-01', name: 'Outside', project: '' },
    ];
    const markers = timelineMarkers(events, { start: '2025-01-01', end: '2025-01-31' }, [
      { value: 'one' },
    ]);
    expect(markers).toHaveLength(1);
    expect(markers[0].events.map(event => event.name)).toEqual(['Training', 'Policy']);
    expect(markers[0].time).toBe(Date.parse('2025-01-10T00:00:00Z'));
    expect(timelineMarkers(events, { start: '2025-01-01', end: '2025-01-31' }, [])).toHaveLength(2);
  });
  it('validates leap days and keeps markers independent of monthly or quarterly aggregation', () => {
    expect(validEventDate('2024-02-29')).toBe(true);
    expect(validEventDate('2025-02-29')).toBe(false);
    const start = '2025-01-01';
    const end = '2025-03-31';
    const bucket = { key: '2025-01' };
    expect(bucketTime(bucket, start, end, 'monthly')).not.toBe(
      bucketTime(bucket, start, end, 'quarterly'),
    );
    const events = [{ date: '2025-02-15', project: '' }];
    expect(timelineMarkers(events, { start, end }, [])[0].time).toBe(
      Date.parse('2025-02-15T00:00:00Z'),
    );
  });
});
