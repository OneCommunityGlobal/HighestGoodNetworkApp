import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SETTINGS,
  STATUS_COLORS,
  toLocalDateString,
  getDateRange,
  normalizeSettings,
  classifySupplier,
  formatDifference,
  getDeliveries,
  prepareSupplierRows,
  summarizeSuppliers,
  toProjectOption,
} from '../supplierPerformanceUtils';

const settings = { target: 90, minimum: 75 };

describe('supplierPerformanceUtils', () => {
  it('classifies suppliers by target and minimum, including boundaries', () => {
    expect(classifySupplier(95, settings)).toBe('above');
    expect(classifySupplier(90, settings)).toBe('above');
    expect(classifySupplier(89.9, settings)).toBe('warning');
    expect(classifySupplier(75, settings)).toBe('warning');
    expect(classifySupplier(74.9, settings)).toBe('below');
  });

  it('normalizes target and minimum into valid ranges', () => {
    expect(normalizeSettings({ target: 150, minimum: -5 })).toEqual({ target: 100, minimum: 0 });
    expect(normalizeSettings({ target: 80, minimum: 90 })).toEqual({ target: 80, minimum: 80 });
    expect(normalizeSettings({ target: NaN, minimum: NaN })).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('formats the difference from target', () => {
    expect(formatDifference(2.1)).toBe('+2.1% above target');
    expect(formatDifference(-7.9)).toBe('-7.9% below target');
    expect(formatDifference(0)).toBe('On target');
  });

  it('reads the delivery count only when the API provides one', () => {
    expect(getDeliveries({ totalDeliveries: 48 })).toBe(48);
    expect(getDeliveries({ deliveries: '12' })).toBe(12);
    expect(getDeliveries({ supplierName: 'A' })).toBeNull();
  });

  it('prepares rows: sorted best first, invalid rows dropped, status and difference added', () => {
    const rows = prepareSupplierRows(
      [
        { supplierName: 'Low', onTimeDeliveryPercentage: 60 },
        { supplierName: 'Top', onTimeDeliveryPercentage: 97.26, totalDeliveries: 20 },
        { supplierName: 'Bad data', onTimeDeliveryPercentage: 'n/a' },
        { supplierName: 'Mid', onTimeDeliveryPercentage: 82.1 },
      ],
      settings,
    );
    expect(rows.map(r => r.supplierName)).toEqual(['Top', 'Mid', 'Low']);
    expect(rows[0]).toEqual(
      expect.objectContaining({
        percentage: 97.3,
        status: 'above',
        color: STATUS_COLORS.above,
        difference: 7.3,
        deliveries: 20,
      }),
    );
    expect(rows[1].status).toBe('warning');
    expect(rows[1].difference).toBe(-7.9);
    expect(rows[2].status).toBe('below');
    expect(rows[2].deliveries).toBeNull();
    expect(prepareSupplierRows(undefined, settings)).toEqual([]);
  });

  it('summarizes counts and best/worst suppliers', () => {
    const rows = prepareSupplierRows(
      [
        { supplierName: 'A', onTimeDeliveryPercentage: 95 },
        { supplierName: 'B', onTimeDeliveryPercentage: 90 },
        { supplierName: 'C', onTimeDeliveryPercentage: 70 },
      ],
      settings,
    );
    const summary = summarizeSuppliers(rows, settings);
    expect(summary.total).toBe(3);
    expect(summary.aboveTarget).toBe(2);
    expect(summary.belowTarget).toBe(1);
    expect(summary.best.supplierName).toBe('A');
    expect(summary.worst.supplierName).toBe('C');
    expect(summarizeSuppliers([], settings)).toEqual({
      total: 0,
      aboveTarget: 0,
      belowTarget: 0,
      best: null,
      worst: null,
    });
  });

  it('builds local date ranges', () => {
    const today = new Date(2026, 10, 24);
    expect(toLocalDateString(today)).toBe('2026-11-24');
    expect(getDateRange('all', today)).toEqual({ startDate: '1970-01-01', endDate: '2026-11-24' });
    expect(getDateRange('last30', today).startDate).toBe('2026-10-24');
    expect(getDateRange('last90', today).startDate).toBe('2026-08-24');
    expect(getDateRange('lastYear', today).startDate).toBe('2025-11-24');
  });

  it('turns project list entries into options', () => {
    expect(toProjectOption('Site A')).toEqual({ value: 'Site A', label: 'Site A' });
    expect(toProjectOption({ _id: 'p1', name: 'Building 1' })).toEqual({
      value: 'p1',
      label: 'Building 1',
    });
    expect(toProjectOption({ projectId: 7, projectName: 'Tower' })).toEqual({
      value: '7',
      label: 'Tower',
    });
    expect(toProjectOption({ name: 'No id' })).toBeNull();
  });
});
