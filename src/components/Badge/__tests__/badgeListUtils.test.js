import {
  compareBadgeRecords,
  inspectBadgeCollection,
  isValidBadgeCount,
  sortBadgeRecords,
} from '../badgeListUtils';

const record = (name, ranking) => ({
  _id: name,
  count: 1,
  badge: { _id: name, badgeName: name, ranking },
});

describe('shared badge collection rules', () => {
  test('orders positive ranks first and unranked records alphabetically without mutating input', () => {
    const records = [
      record('Zero', 0),
      record('Second', 2),
      record('Missing'),
      record('First B', 1),
      record('First A', 1),
      record('Invalid', -1),
      record('Fraction', 1.5),
    ];
    const before = structuredClone(records);
    expect(sortBadgeRecords(records).map(item => item._id)).toEqual([
      'First A',
      'First B',
      'Second',
      'Fraction',
      'Invalid',
      'Missing',
      'Zero',
    ]);
    expect(records).toEqual(before);
  });

  test('compares identical unranked keys equally and preserves their input order', () => {
    const first = record('Equal', 0);
    const second = { ...record('Equal'), _id: 'second' };
    expect(compareBadgeRecords(first, second)).toBe(0);
    expect(compareBadgeRecords(second, first)).toBe(0);
    expect(sortBadgeRecords([second, first])).toEqual([second, first]);
  });

  test.each(['', ' ', 'no', null, undefined, NaN, Infinity, -1, 0.5, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid count %s',
    value => {
      expect(isValidBadgeCount(value)).toBe(false);
    },
  );

  test.each([0, 1, '2', Number.MAX_SAFE_INTEGER])('accepts whole count %s', value => {
    expect(isValidBadgeCount(value)).toBe(true);
  });

  test('distinguishes empty collections from corrupt collections and duplicate record IDs', () => {
    expect(inspectBadgeCollection(undefined)).toEqual({ records: [], hasInvalidRecords: false });
    expect(inspectBadgeCollection({})).toEqual({ records: [], hasInvalidRecords: true });
    const good = record('Good', 1);
    expect(inspectBadgeCollection([good, null, { ...good, badge: 'id' }])).toEqual({
      records: [good],
      hasInvalidRecords: true,
    });
    expect(inspectBadgeCollection([good, good]).hasInvalidRecords).toBe(true);
    expect(inspectBadgeCollection([{ ...good, _id: undefined }]).hasInvalidRecords).toBe(true);
  });
});
