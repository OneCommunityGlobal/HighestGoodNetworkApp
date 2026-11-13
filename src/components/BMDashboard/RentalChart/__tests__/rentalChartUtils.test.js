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
  it.each([
    ['drops the project name in front', 'Project 1 - Tool 2', 'Project 1', 'Tool 2'],
    ['ignores case in the prefix', 'project 1 - tool 6', 'Project 1', 'tool 6'],
    ['leaves short names alone', 'Tool 4', 'Project 3', 'Tool 4'],
    ['only drops its own project', 'Project 1 - Tool 2', 'Project 2', 'Project 1 - Tool 2'],
    ['keeps the name if nothing is left', 'Project 1 - ', 'Project 1', 'Project 1 - '],
    ['handles a missing tool name', undefined, 'Project 1', ''],
    ['handles a missing project name', 'Tool 4', '', 'Tool 4'],
  ])('%s', (_case, toolName, projectName, expected) => {
    expect(stripProjectPrefix(toolName, projectName)).toBe(expected);
  });
});
