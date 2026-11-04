import { describe, it, expect, vi, afterEach } from 'vitest';
import { getCurrentYearRange, stripProjectPrefix } from '../rentalChartUtils';

describe('getCurrentYearRange (default From / To dates)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('covers January 1 to December 31 of the given year', () => {
    const { startDate, endDate } = getCurrentYearRange(new Date(2026, 10, 3));
    expect(startDate).toEqual(new Date(2026, 0, 1));
    expect(endDate).toEqual(new Date(2026, 11, 31));
  });

  it('defaults to the current year', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2027, 1, 15));
    const { startDate, endDate } = getCurrentYearRange();
    expect(startDate).toEqual(new Date(2027, 0, 1));
    expect(endDate).toEqual(new Date(2027, 11, 31));
  });
});

describe('stripProjectPrefix (one naming style for tools)', () => {
  it('drops the project name in front of the tool name', () => {
    expect(stripProjectPrefix('Project 1 - Tool 2', 'Project 1')).toBe('Tool 2');
  });

  it('ignores case in the prefix', () => {
    expect(stripProjectPrefix('project 1 - tool 6', 'Project 1')).toBe('tool 6');
  });

  it('leaves names that are already short alone', () => {
    expect(stripProjectPrefix('Tool 4', 'Project 3')).toBe('Tool 4');
  });

  it('only drops the name of the project the tool belongs to', () => {
    expect(stripProjectPrefix('Project 1 - Tool 2', 'Project 2')).toBe('Project 1 - Tool 2');
  });

  it('keeps the full name if nothing would be left', () => {
    expect(stripProjectPrefix('Project 1 - ', 'Project 1')).toBe('Project 1 - ');
  });

  it('handles a missing tool or project name', () => {
    expect(stripProjectPrefix(undefined, 'Project 1')).toBe('');
    expect(stripProjectPrefix('Tool 4', '')).toBe('Tool 4');
  });
});
