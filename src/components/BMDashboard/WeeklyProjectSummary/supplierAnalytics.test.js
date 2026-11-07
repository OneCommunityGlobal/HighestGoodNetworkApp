import { describe, it, expect } from 'vitest';
import {
  analyzeSuppliers,
  rankSuppliers,
  comparisonRows,
  periodKey,
  reportRows,
  toCSV,
} from './supplierAnalytics';
const records = [80, 90, 100].map((value, i) => ({
  supplierName: 'A',
  endDate: `2026-0${i + 1}-28`,
  onTimeDeliveryPercentage: value,
  slaTarget: 90,
}));
describe('supplier analytics', () => {
  it('aggregates real observations by UTC month, quarter and year', () => {
    expect(periodKey('2026-12-31', 'quarterly')).toBe('2026-Q4');
    const monthly = analyzeSuppliers(records, [], 'monthly', 90)[0];
    expect(monthly.average).toBe(90);
    expect(monthly.trend).toBe('Improving');
    expect(monthly.risk).toBe(17.25);
    expect(monthly.benchmarkRecords).toBe(0);
    const quarterly = analyzeSuppliers(records, [], 'quarterly', 90)[0];
    expect(quarterly.history).toEqual([{ label: '2026-Q1', value: 90, count: 3 }]);
    expect(quarterly.risk).toBeNull();
    expect(analyzeSuppliers(records, [], 'yearly', 90)[0].history[0].label).toBe('2026');
  });
  it('uses only explicit fallback benchmarks for missing SLAs', () => {
    const rows = records.map(r => ({ ...r, slaTarget: undefined }));
    expect(analyzeSuppliers(rows, [], 'monthly', 100)[0].risk).toBeGreaterThan(
      analyzeSuppliers(rows, [], 'monthly', 80)[0].risk,
    );
    expect(analyzeSuppliers(rows, [], 'monthly', 90)[0].benchmarkRecords).toBe(3);
  });
  it('aligns comparison periods and preserves missing values', () => {
    const suppliers = analyzeSuppliers(
      [...records, { ...records[0], supplierName: 'B' }],
      [],
      'monthly',
      90,
    );
    const rows = comparisonRows(suppliers);
    expect(rows[1]['name:B']).toBeNull();
    expect(rows[0]['name:A']).toBe(80);
    expect(rankSuppliers(suppliers, 'top')).toHaveLength(2);
    expect(rankSuppliers(suppliers, 'bottom')[0].supplierName).toBe('B');
  });
  it('shows fully missing calendar periods as gaps', () => {
    const suppliers = analyzeSuppliers([records[0], records[2]], [], 'monthly', 90);
    expect(comparisonRows(suppliers)[1]).toEqual({ label: '2026-02', 'name:A': null });
  });
  it('caps rankings at five and identifies declining high-risk suppliers', () => {
    const many = Array.from({ length: 7 }, (_, i) => ({
      ...records[0],
      supplierName: `S${i}`,
      onTimeDeliveryPercentage: i * 10,
    }));
    const ranked = analyzeSuppliers(many, [], 'monthly', 90);
    expect(rankSuppliers(ranked, 'top').map(s => s.average)).toEqual([60, 50, 40, 30, 20]);
    expect(rankSuppliers(ranked, 'bottom').map(s => s.average)).toEqual([0, 10, 20, 30, 40]);
    const declining = analyzeSuppliers(
      records.map((r, i) => ({ ...r, onTimeDeliveryPercentage: 100 - i * 50, slaTarget: 100 })),
      [],
      'monthly',
      90,
    )[0];
    expect(declining.trend).toBe('Declining');
    expect(declining.riskLevel).toBe('High');
  });
  it('exports selected suppliers, actual history, filters and causes with CSV escaping', () => {
    const suppliers = analyzeSuppliers(
      records,
      [{ supplierKey: 'name:A', tags: ['Quality, rejection'] }],
      'monthly',
      90,
    );
    const rows = reportRows(suppliers, 'monthly; project=all');
    expect(rows).toHaveLength(3);
    expect(rows[0][12]).toBe('Quality, rejection');
    expect(toCSV([['=CMD()', 'a"b', 'a,b']])).toBe('"\'=CMD()","a""b","a,b"');
  });
});
