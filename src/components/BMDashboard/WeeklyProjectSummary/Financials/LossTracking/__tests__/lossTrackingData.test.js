import { describe, it, expect } from 'vitest';
import {
  SAMPLE_LOSS_RECORDS,
  filterLossRecords,
  totalLoss,
  lossByCategory,
  lossByProject,
  lossByMonth,
  formatMonthLabel,
  formatCurrency,
} from '../lossTrackingData';

const records = [
  { date: '2024-01', project: 'A', category: 'Materials', cost: 100 },
  { date: '2024-01', project: 'B', category: 'Labor', cost: 50 },
  { date: '2024-02', project: 'A', category: 'Waste', cost: 30 },
  { date: '2024-03', project: 'B', category: 'Materials', cost: 20 },
];

describe('lossTrackingData', () => {
  it('builds deterministic sample records for 5 projects x 4 categories x 12 months', () => {
    expect(SAMPLE_LOSS_RECORDS).toHaveLength(240);
    expect(SAMPLE_LOSS_RECORDS[0]).toEqual(
      expect.objectContaining({ date: '2024-01', project: 'Building 1', category: 'Materials' }),
    );
  });

  it('filters by project and month range', () => {
    expect(filterLossRecords(records, { project: 'A' })).toHaveLength(2);
    expect(filterLossRecords(records, { startMonth: '2024-02' })).toHaveLength(2);
    expect(filterLossRecords(records, { endMonth: '2024-01' })).toHaveLength(2);
    expect(
      filterLossRecords(records, { project: 'B', startMonth: '2024-02', endMonth: '2024-03' }),
    ).toEqual([records[3]]);
    expect(filterLossRecords(records)).toHaveLength(4);
  });

  it('totals the cost', () => {
    expect(totalLoss(records)).toBe(200);
    expect(totalLoss([])).toBe(0);
  });

  it('groups by category in a fixed order with shares', () => {
    expect(lossByCategory(records)).toEqual([
      { name: 'Materials', value: 120, share: 60 },
      { name: 'Labor', value: 50, share: 25 },
      { name: 'Waste', value: 30, share: 15 },
    ]);
  });

  it('groups by project, largest first', () => {
    expect(lossByProject(records)).toEqual([
      { name: 'A', value: 130, share: 65 },
      { name: 'B', value: 70, share: 35 },
    ]);
  });

  it('groups by month in date order with readable labels', () => {
    expect(lossByMonth(records)).toEqual([
      { month: '2024-01', label: 'Jan 24', value: 150 },
      { month: '2024-02', label: 'Feb 24', value: 30 },
      { month: '2024-03', label: 'Mar 24', value: 20 },
    ]);
  });

  it('returns empty groups and zero shares for no records', () => {
    expect(lossByCategory([])).toEqual([]);
    expect(lossByProject([])).toEqual([]);
    expect(lossByMonth([])).toEqual([]);
  });

  it('formats month labels and currency', () => {
    expect(formatMonthLabel('2024-12')).toBe('Dec 24');
    expect(formatCurrency(1234.6)).toBe('$1,235');
  });
});
