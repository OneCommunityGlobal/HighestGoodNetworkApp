// v1.1.0
import {
  assessRisk,
  buildRiskRows,
  comparisonText,
  formatMetric,
  normalizeMetrics,
  riskLevel,
} from '../projectRisk';

const snapshot = {
  projectName: 'Build A',
  predictedCostOverrun: -20,
  predictedTimeDelay: 100,
  totalOpenIssues: 0,
};

describe('project risk assessment', () => {
  it('keeps savings and converts planned-duration utilization into actual delay', () => {
    expect(normalizeMetrics(snapshot)).toEqual({ cost: -20, delay: 0, issues: 0 });
    expect(normalizeMetrics({ ...snapshot, predictedTimeDelay: 120 }).delay).toBe(20);
    expect(normalizeMetrics({ ...snapshot, predictedTimeDelay: 50 }).delay).toBe(0);
    expect(formatMetric('cost', -20)).toBe('20% under budget');
    expect(formatMetric('cost', 20)).toBe('20% over budget');
    expect(assessRisk(normalizeMetrics(snapshot))).toMatchObject({ score: 0, level: 'Low' });
  });

  it.each([
    [4.99, 'Low'],
    [5, 'Medium'],
    [14.99, 'Medium'],
    [15, 'High'],
  ])('classifies a %s percent metric as %s', (value, expected) => {
    expect(riskLevel(value, 5, 15)).toBe(expected);
  });

  it.each([
    [29, 'Low'],
    [30, 'Medium'],
    [59, 'Medium'],
    [60, 'High'],
  ])('classifies score %s as %s', (value, expected) => {
    expect(riskLevel(value)).toBe(expected);
  });

  it('weights normalized inputs, caps extremes, and never offsets delay with savings', () => {
    expect(assessRisk({ cost: 15, delay: 7.5, issues: 5 })).toMatchObject({
      score: 70,
      level: 'High',
    });
    expect(assessRisk({ cost: 1000, delay: 1000, issues: 1000 }).score).toBe(100);
    expect(assessRisk({ cost: -90, delay: 15, issues: 0 })).toMatchObject({
      score: 40,
      level: 'Medium',
      action: expect.stringContaining('Escalate'),
    });
  });

  it.each([null, undefined, NaN, Infinity, '10', ''])(
    'does not turn missing or invalid data (%s) into low risk',
    value => {
      const metrics = normalizeMetrics({ ...snapshot, predictedCostOverrun: value });
      expect(assessRisk(metrics)).toMatchObject({
        score: null,
        level: 'Unknown',
        action: expect.stringContaining('Verify'),
      });
    },
  );

  it('rejects negative elapsed time and invalid issue counts', () => {
    expect(normalizeMetrics({ predictedTimeDelay: -1, totalOpenIssues: -1 })).toEqual({
      cost: null,
      delay: null,
      issues: null,
    });
    expect(normalizeMetrics({ totalOpenIssues: 1.5 }).issues).toBeNull();
  });

  it('retains known severe warnings with incomplete data and explains small nonzero risks', () => {
    expect(assessRisk({ cost: null, delay: 20, issues: 0 })).toMatchObject({
      level: 'Unknown',
      action: expect.stringContaining('Escalate'),
    });
    expect(assessRisk({ cost: 0.01, delay: 0, issues: 0 }).explanation).toContain(
      'Cost variance contributes most',
    );
  });

  it('uses the actual snapshot without generating history or changes', () => {
    const [row] = buildRiskRows([snapshot], '2026-10-01', '2026-10-30');
    expect(row).toMatchObject({ cost: -20, delay: 0, score: 0, snapshotOnly: true, history: [] });
    expect(row.comparison).toContain('unavailable (no recorded history)');
  });

  it('sorts observations, includes timestamped end dates and compares equal-length previous periods', () => {
    const [row] = buildRiskRows(
      [
        {
          ...snapshot,
          history: [
            {
              ...snapshot,
              date: '2026-10-14T23:59:59Z',
              predictedCostOverrun: 15,
              predictedTimeDelay: 120,
            },
            { ...snapshot, date: '2026-10-06', predictedCostOverrun: 5, predictedTimeDelay: 110 },
            { ...snapshot, date: '2026-09-30', predictedCostOverrun: 99 },
            { ...snapshot, date: '2026-10-08', predictedCostOverrun: 10 },
            { ...snapshot, date: 'bad-date' },
          ],
        },
      ],
      '2026-10-08',
      '2026-10-14',
    );
    expect(row).toMatchObject({ cost: 15, delay: 20, snapshotOnly: false });
    expect(row.history.map(h => h.date)).toEqual(['2026-10-08', '2026-10-14']);
    expect(row.comparison).toContain('Cost variance: +10 pp; Time delay: +10 pp; Open issues: 0');
  });

  it('does not substitute current values for an empty historical period or a missing comparison', () => {
    expect(
      buildRiskRows(
        [{ ...snapshot, history: [{ ...snapshot, date: '2026-09-01' }] }],
        '2026-10-01',
        '2026-10-30',
      ),
    ).toEqual([]);
    expect(
      comparisonText({ cost: 5, delay: null, issues: 0 }, { cost: null, delay: 0, issues: 1 }),
    ).toContain('Cost variance: unavailable; Time delay: unavailable; Open issues: -1');
  });
});

it('uses the latest timestamp when observations arrive out of order on the same day', () => {
  const [row] = buildRiskRows(
    [
      {
        ...snapshot,
        history: [
          { ...snapshot, date: '2026-10-14T20:00:00Z', predictedCostOverrun: 15 },
          { ...snapshot, date: '2026-10-14T08:00:00Z', predictedCostOverrun: 2 },
        ],
      },
    ],
    '2026-10-01',
    '2026-10-14',
  );
  expect(row.cost).toBe(15);
});

it('returns no results for invalid or reversed history ranges instead of throwing', () => {
  expect(buildRiskRows([snapshot], 'bad-date', '2026-10-14')).toEqual([]);
  expect(buildRiskRows([snapshot], '2026-10-14', '2026-10-01')).toEqual([]);
});
