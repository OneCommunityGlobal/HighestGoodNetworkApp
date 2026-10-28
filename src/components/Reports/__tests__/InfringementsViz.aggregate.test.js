import { describe, expect, it } from 'vitest';
import { aggregateInfringements } from '../InfringementsViz';

describe('aggregateInfringements', () => {
  it('returns empty values when there are no infringements', () => {
    const result = aggregateInfringements([], '', '');

    expect(result.values).toEqual([]);
    expect(result.maxSquareCount).toBe(0);
  });

  it('groups multiple infringements that share the same date', () => {
    const infringements = [
      { _id: '1', date: '2022-01-01', description: 'first' },
      { _id: '2', date: '2022-01-01', description: 'second' },
      { _id: '3', date: '2022-01-01', description: 'first' },
    ];

    const { values, maxSquareCount } = aggregateInfringements(infringements, '', '');

    expect(values).toHaveLength(1);
    expect(values[0].ids).toEqual(['1', '2', '3']);
    expect(values[0].des).toEqual(['first', 'second', 'first']);
    expect(values[0].count).toBe(3);
    expect(maxSquareCount).toBe(3);
  });

  it('orders grouped dates chronologically', () => {
    const infringements = [
      { _id: '1', date: '2022-01-15', description: 'middle' },
      { _id: '2', date: '2022-01-01', description: 'first' },
      { _id: '3', date: '2022-01-30', description: 'last' },
    ];

    const { values } = aggregateInfringements(infringements, '', '');

    expect(values.map(v => v.date.toISOString().slice(0, 10))).toEqual([
      '2022-01-01',
      '2022-01-15',
      '2022-01-30',
    ]);
  });

  it('skips entries with no date', () => {
    const infringements = [
      { _id: '1', date: '2022-01-01', description: 'kept' },
      { _id: '2', date: '', description: 'dropped' },
      { _id: '3', date: null, description: 'dropped' },
    ];

    const { values } = aggregateInfringements(infringements, '', '');

    expect(values).toHaveLength(1);
    expect(values[0].des).toEqual(['kept']);
  });

  it('filters values whose date falls outside the supplied range', () => {
    const infringements = [
      { _id: '1', date: '2022-01-01', description: 'before' },
      { _id: '2', date: '2022-03-01', description: 'after' },
      { _id: '3', date: '2022-02-10', description: 'inside' },
    ];

    const { values } = aggregateInfringements(
      infringements,
      '2022-01-15',
      '2022-02-28',
    );

    expect(values.map(v => v.des[0])).toEqual(['inside']);
  });

  it('keeps every value when no range is provided', () => {
    const infringements = [
      { _id: '1', date: '2022-01-01', description: 'a' },
      { _id: '2', date: '2022-06-01', description: 'b' },
    ];

    const { values } = aggregateInfringements(infringements, '', '');

    expect(values).toHaveLength(2);
  });

  it('parses dates using the local-time fallback when Date cannot interpret the string', () => {
    const infringements = [
      { _id: '1', date: 'not-a-real-date', description: 'still kept' },
    ];

    const { values } = aggregateInfringements(infringements, '', '');

    expect(values).toHaveLength(0);
  });

  it('reports zero as the max when nothing is left after filtering', () => {
    const infringements = [
      { _id: '1', date: '2022-01-01', description: 'outside' },
    ];

    const { maxSquareCount } = aggregateInfringements(
      infringements,
      '2022-06-01',
      '2022-06-30',
    );

    expect(maxSquareCount).toBe(0);
  });

  it('stamps each entry with the Infringement type and a numeric timestamp', () => {
    const infringements = [{ _id: '1', date: '2022-01-01', description: 'one' }];

    const { values } = aggregateInfringements(infringements, '', '');

    expect(values[0].type).toBe('Infringement');
    expect(typeof values[0].ts).toBe('number');
    expect(values[0].ts).toBe(new Date('2022-01-01').getTime());
  });
});
