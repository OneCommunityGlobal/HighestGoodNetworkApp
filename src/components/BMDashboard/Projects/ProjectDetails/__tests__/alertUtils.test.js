import {
  DAY_MS,
  buildLowStockItems,
  buildRentalItems,
  formatDueIn,
  getRentalRisk,
  getStockRisk,
  readSessionPrefs,
  sortAndFilterItems,
  writeSessionPrefs,
} from '../alertUtils';

const NOW = new Date('2026-11-11T12:00:00Z').getTime();
const inDays = days => new Date(NOW + days * DAY_MS).toISOString();
const PROJECT = 'p1';

describe('getRentalRisk', () => {
  it('marks overdue and due-within-a-day rentals critical', () => {
    expect(getRentalRisk(inDays(-2), NOW)).toEqual({ daysLeft: -2, level: 'critical' });
    expect(getRentalRisk(inDays(1), NOW)).toEqual({ daysLeft: 1, level: 'critical' });
  });

  it('marks rentals due in 2-3 days as warning and later ones normal', () => {
    expect(getRentalRisk(inDays(3), NOW).level).toBe('warning');
    expect(getRentalRisk(inDays(10), NOW).level).toBe('normal');
  });

  it('handles a missing due date', () => {
    expect(getRentalRisk(undefined, NOW)).toEqual({ daysLeft: null, level: 'normal' });
  });
});

describe('formatDueIn', () => {
  it('describes overdue, today and future due dates', () => {
    expect(formatDueIn(-1)).toBe('Overdue by 1 day');
    expect(formatDueIn(0)).toBe('Due today');
    expect(formatDueIn(5)).toBe('Due in 5 days');
  });
});

describe('getStockRisk', () => {
  it('uses <10% for critical and <20% for warning', () => {
    expect(getStockRisk(5, 100).level).toBe('critical');
    expect(getStockRisk(15, 100).level).toBe('warning');
    expect(getStockRisk(50, 100).level).toBe('normal');
  });

  it('returns no percentage when nothing was bought', () => {
    expect(getStockRisk(0, 0)).toEqual({ percentLeft: null, level: 'normal' });
  });
});

describe('buildRentalItems', () => {
  const tools = [
    {
      _id: 't1',
      project: { _id: PROJECT },
      purchaseStatus: 'Rental',
      rentalDueDate: inDays(1),
      itemType: { name: 'Drill', category: 'Power Tool' },
      logRecord: [{ responsibleUser: { firstName: 'Ana', lastName: 'Lee' } }],
    },
    { _id: 't2', project: { _id: PROJECT }, purchaseStatus: 'Purchased', rentalDueDate: inDays(1) },
    { _id: 't3', project: { _id: 'other' }, purchaseStatus: 'Rental', rentalDueDate: inDays(1) },
  ];
  const equipments = [
    {
      _id: 'e1',
      project: PROJECT,
      purchaseStatus: 'Rented',
      rentalDueDate: inDays(6),
      itemType: { name: 'Excavator' },
    },
  ];

  it("keeps only this project's active rentals and links each to its detail page", () => {
    const items = buildRentalItems({ tools, equipments, projectId: PROJECT, now: NOW });
    expect(items.map(i => i.id)).toEqual(['t1', 'e1']);
    expect(items[0]).toMatchObject({
      name: 'Drill',
      category: 'Power Tool',
      level: 'critical',
      responsible: 'Ana Lee',
      detailPath: '/bmdashboard/tools/t1',
    });
    expect(items[1]).toMatchObject({ kind: 'equipment', detailPath: '/bmdashboard/equipment/e1' });
  });
});

describe('buildLowStockItems', () => {
  it("keeps only this project's materials below 20%", () => {
    const materials = [
      {
        _id: 'm1',
        project: { _id: PROJECT },
        stockBought: 100,
        stockAvailable: 5,
        itemType: { _id: 'it1', name: 'Sand', unit: 'kg' },
      },
      {
        _id: 'm2',
        project: { _id: PROJECT },
        stockBought: 100,
        stockAvailable: 50,
        itemType: { name: 'Brick' },
      },
      {
        _id: 'm3',
        project: { _id: PROJECT },
        stockBought: 0,
        stockAvailable: 0,
        itemType: { name: 'Lime' },
      },
      {
        _id: 'm4',
        project: { _id: 'other' },
        stockBought: 100,
        stockAvailable: 1,
        itemType: { name: 'Clay' },
      },
    ];
    const items = buildLowStockItems({ materials, projectId: PROJECT });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: 'm1',
      name: 'Sand',
      unit: 'kg',
      percentLeft: 5,
      level: 'critical',
    });
  });
});

describe('sortAndFilterItems', () => {
  const items = [
    { id: 'a', name: 'Zeta', level: 'normal', daysLeft: 9, category: 'B' },
    { id: 'b', name: 'Alpha', level: 'critical', daysLeft: 0, category: 'C' },
    { id: 'c', name: 'Mid', level: 'warning', daysLeft: 2, category: 'A' },
    { id: 'd', name: 'Beta', level: 'critical', daysLeft: -3, category: 'A' },
  ];

  it('sorts by urgency: level first, then soonest due', () => {
    expect(sortAndFilterItems(items).map(i => i.id)).toEqual(['d', 'b', 'c', 'a']);
  });

  it('sorts by text fields with urgency as the tie-breaker', () => {
    expect(sortAndFilterItems(items, { sortBy: 'category' }).map(i => i.id)).toEqual([
      'd',
      'c',
      'a',
      'b',
    ]);
  });

  it('filters by risk level', () => {
    expect(sortAndFilterItems(items, { level: 'critical' }).map(i => i.id)).toEqual(['d', 'b']);
  });

  it('does not mutate the input', () => {
    const copy = [...items];
    sortAndFilterItems(items);
    expect(items).toEqual(copy);
  });
});

describe('session prefs', () => {
  beforeEach(() => window.sessionStorage.clear());

  it('round-trips through sessionStorage and falls back on bad data', () => {
    const fallback = { sortBy: 'urgency', level: 'all' };
    expect(readSessionPrefs('k', fallback)).toEqual(fallback);
    writeSessionPrefs('k', { sortBy: 'name', level: 'critical' });
    expect(readSessionPrefs('k', fallback)).toEqual({ sortBy: 'name', level: 'critical' });
    window.sessionStorage.setItem('k', '{not json');
    expect(readSessionPrefs('k', fallback)).toEqual(fallback);
  });
});
