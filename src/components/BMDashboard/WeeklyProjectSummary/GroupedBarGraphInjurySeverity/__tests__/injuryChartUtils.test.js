import {
  INJURY_SERIES_COLORS,
  UNKNOWN_PROJECT_KEY,
  buildChartData,
  buildIdToKeys,
  buildProjectOptions,
  buildSeriesMeta,
  resolveRowKey,
} from '../injuryChartUtils';

// Mirrors the real data: legacy ID 688d… is shared by three names, and Building 2 also has a real ID.
const LEGACY_ID = '688d0890f53efb004d5192a6';
const projects = [
  { _id: LEGACY_ID, name: 'akv_test', projectIds: [LEGACY_ID] },
  {
    _id: '65419e61105441587e2dec99',
    name: 'Building 1',
    projectIds: ['65419e61105441587e2dec99', LEGACY_ID],
  },
  { _id: LEGACY_ID, name: 'Building 2', projectIds: [LEGACY_ID, '654946b2bc5772e8caf7e962'] },
  {
    _id: '67f0b07487814ffa08fcfab9',
    name: 'Commercial Test - Project',
    projectIds: ['67f0b07487814ffa08fcfab9'],
  },
];

const rows = [
  {
    projectId: '654946b2bc5772e8caf7e962',
    projectName: 'Building 2',
    workerCategory: 'Carpenter',
    totalInjuries: 3,
  },
  {
    projectId: LEGACY_ID,
    projectName: 'Building 2 ',
    workerCategory: 'Carpenter',
    totalInjuries: 2,
  },
  { projectId: LEGACY_ID, projectName: 'akv_test', workerCategory: 'Carpenter', totalInjuries: 1 },
  {
    projectId: '65419e61105441587e2dec99',
    projectName: '',
    workerCategory: 'Carpenter',
    totalInjuries: 4,
  },
  { projectId: LEGACY_ID, projectName: '', workerCategory: 'Plumber', totalInjuries: 5 },
];

describe('injuryChartUtils', () => {
  const idToKeys = buildIdToKeys(projects);
  const resolveKey = row => resolveRowKey(row, idToKeys);

  it('gives each project name exactly one dropdown option, even when IDs are shared', () => {
    const options = buildProjectOptions(projects);
    expect(options.map(o => o.label)).toEqual([
      'akv_test',
      'Building 1',
      'Building 2',
      'Commercial Test - Project',
    ]);
    expect(new Set(options.map(o => o.value)).size).toBe(options.length);
  });

  it('merges rows for one project name across real and legacy IDs', () => {
    expect(resolveKey(rows[0])).toBe('building 2');
    expect(resolveKey(rows[1])).toBe('building 2');
    expect(resolveKey(rows[2])).toBe('akv_test');
  });

  it('maps unnamed rows by ID only when the ID belongs to a single project', () => {
    expect(resolveKey(rows[3])).toBe('building 1');
    expect(resolveKey(rows[4])).toBe(UNKNOWN_PROJECT_KEY);
  });

  it('sums each project into one series per worker category', () => {
    const keys = rows.map(resolveKey);
    const meta = buildSeriesMeta(keys, INJURY_SERIES_COLORS.light);
    const data = buildChartData(rows, resolveKey, meta);
    const carpenter = data.find(d => d.workerCategory === 'Carpenter');
    expect(carpenter[meta.get('building 2').dataKey]).toBe(5);
    expect(carpenter[meta.get('building 1').dataKey]).toBe(4);
  });

  it('assigns distinct colors in stable order, with unknown last', () => {
    const meta = buildSeriesMeta(
      [UNKNOWN_PROJECT_KEY, 'building 2', '5439-test', 'akv_test', 'building 1'],
      INJURY_SERIES_COLORS.light,
    );
    const keys = Array.from(meta.keys());
    expect(keys[keys.length - 1]).toBe(UNKNOWN_PROJECT_KEY);
    const colors = Array.from(meta.values()).map(m => m.color);
    expect(new Set(colors).size).toBe(colors.length);
    // Order of input must not change assignment
    const reordered = buildSeriesMeta(
      ['building 1', 'akv_test', '5439-test', 'building 2'],
      INJURY_SERIES_COLORS.light,
    );
    expect(reordered.get('building 2').color).toBe(meta.get('building 2').color);
  });
});
