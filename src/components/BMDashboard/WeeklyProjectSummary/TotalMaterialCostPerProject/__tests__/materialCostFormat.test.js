import { describe, it, expect } from 'vitest';
import {
  kToDollars,
  formatCurrency,
  formatCompactCurrency,
  shortenLabels,
  getDefaultSelection,
} from '../materialCostFormat';

describe('materialCostFormat', () => {
  it('converts thousands to whole dollars', () => {
    expect(kToDollars(133.044)).toBe(133044);
    expect(kToDollars('70.058')).toBe(70058);
    expect(kToDollars('invalid')).toBe(0);
    expect(kToDollars(undefined)).toBe(0);
  });

  it('formats exact and compact currency', () => {
    expect(formatCurrency(133044)).toBe('$133,044');
    expect(formatCurrency(0)).toBe('$0');
    expect(formatCompactCurrency(133044)).toBe('$133K');
    expect(formatCompactCurrency(127536)).toBe('$127.5K');
    expect(formatCompactCurrency(950)).toBe('$950');
    expect(formatCompactCurrency(2500000)).toBe('$2.5M');
    expect(formatCompactCurrency(0)).toBe('$0');
  });

  it('keeps short labels and cuts long unique ones at the end', () => {
    const long = 'Commercial Test - Project';
    expect(shortenLabels(['Building 1', long])).toEqual(['Building 1', `${long.slice(0, 21)}…`]);
  });

  it('keeps labels unique when names share a long prefix', () => {
    const short = shortenLabels([
      '[Stock Risk QA 5709] Material Alpha',
      '[Stock Risk QA 5709] Material Beta',
      '[Stock Risk QA 5709] Material Gamma',
    ]);
    expect(new Set(short).size).toBe(3);
    expect(short[0]).toContain('Alpha');
    expect(short[1]).toContain('Beta');
    expect(short[2]).toContain('Gamma');
    short.forEach(label => expect(label.length).toBeLessThanOrEqual(22));
  });

  it('numbers labels that are still identical', () => {
    expect(shortenLabels(['Same', 'Same'])).toEqual(['Same (1)', 'Same (2)']);
  });

  it('selects projects with a cost above $0 by default', () => {
    const projects = [
      { value: '1', label: 'A' },
      { value: '2', label: 'B' },
      { value: '3', label: 'C' },
    ];
    expect(getDefaultSelection(projects, { 1: 100, 2: 0 })).toEqual([projects[0]]);
    expect(getDefaultSelection(projects, {})).toEqual(projects);
  });
});
