import { formatMaterialAvailable, getMaterialDataIssues } from '../materialDataQuality';

const valid = {
  project: { name: 'Building 1' },
  itemType: { name: 'Sand', unit: 'kg' },
  stockBought: 100,
  stockUsed: 20,
  stockWasted: 10,
  stockAvailable: 70,
};

describe('material data quality display', () => {
  it.each([
    [35.700000000000045, '35.70'],
    [-6.2000000000000455, '-6.20'],
    [-335.2, '-335.20'],
    [0, '0.00'],
    [-0.001, '0.00'],
    [undefined, 'Missing'],
    [NaN, 'Missing'],
  ])('formats Available %p as %s', (value, expected) => {
    expect(formatMaterialAvailable(value)).toBe(expected);
  });

  it('flags the reported excess usage and inconsistent Available without mutating data', () => {
    const material = { ...valid, stockBought: 277.8, stockUsed: 536, stockWasted: 0, stockAvailable: -335.2 };
    const before = structuredClone(material);
    expect(getMaterialDataIssues(material)).toEqual([
      'Negative stock quantity',
      'Used + Wasted exceeds Bought',
      'Available does not match Bought - Used - Wasted',
    ]);
    expect(material).toEqual(before);
  });

  it('flags each missing reference field explicitly', () => {
    expect(getMaterialDataIssues({ ...valid, itemType: null, project: null })).toEqual([
      'Missing name', 'Missing unit', 'Missing project',
    ]);
  });

  it('treats whitespace as missing and never invents zero for a missing total', () => {
    expect(getMaterialDataIssues({ ...valid, itemType: { name: ' ', unit: '' }, stockBought: undefined })).toEqual([
      'Missing name', 'Missing unit', 'Missing or invalid stock quantity',
    ]);
  });

  it('does not flag floating point noise as a stock mismatch', () => {
    expect(getMaterialDataIssues({ ...valid, stockAvailable: 70.00000000000004 })).toEqual([]);
  });

  it('flags a stored mismatch even when the fetch action recalculated a consistent balance', () => {
    expect(getMaterialDataIssues({ ...valid, storedStockAvailable: 0 })).toEqual([
      'Stored Available does not match the calculated balance',
    ]);
  });
});
