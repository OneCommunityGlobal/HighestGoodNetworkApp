import DonutChart from '../DonutChart/DonutChart';

// Components
import Loading from '../../common/Loading';

const COLORS = ['#00AFF4', '#FFA500', '#00B030', '#EC52CB', '#F8FF00', '#7C4DFF'];

// --- Helper Functions ---

function parseRangeStart(rangeStr) {
  if (!rangeStr) return 0;
  const [first] = String(rangeStr).split(/[-+]/);
  const parsed = Number(first);
  return Number.isFinite(parsed) ? parsed : 0;
}

// '50' (50-59) sorts before '50+' even though both start at 50.
const compareBuckets = (a, b) =>
  parseRangeStart(a._id) - parseRangeStart(b._id) ||
  Number(String(a._id).includes('+')) - Number(String(b._id).includes('+'));

function normalizeBucketId(rangeStr) {
  if (!rangeStr) return '';
  const trimmed = String(rangeStr).trim();

  if (trimmed.includes('+')) {
    const start = parseRangeStart(trimmed);
    return `${start}+`;
  }

  return String(parseRangeStart(trimmed));
}

function mergeHoursBuckets(hoursData) {
  const safeHoursData = Array.isArray(hoursData) ? hoursData : [];
  const merged = new Map();

  safeHoursData.forEach(item => {
    const normalizedId = normalizeBucketId(item?._id);
    if (!normalizedId) return;
    const existing = merged.get(normalizedId) || 0;
    merged.set(normalizedId, existing + (Number(item?.count) || 0));
  });

  return [...merged.entries()].map(([id, count]) => ({ _id: id, count })).sort(compareBuckets);
}

export function formatRangeLabel(rangeStr) {
  if (!rangeStr) return '';
  const normalizedRange = normalizeBucketId(rangeStr);

  if (normalizedRange.includes('+')) {
    // FIX: Prefer Number() over parseFloat() for safer numeric string conversions
    const num = Number(normalizedRange.replace('+', ''));
    return `${num}+ hrs`;
  } else {
    const num = Number(normalizedRange);
    return `${num}-${num + 9} hrs`;
  }
}

export function formatCommittedRangeLabel(rangeStr) {
  const normalizedRange = normalizeBucketId(rangeStr);
  if (normalizedRange === '40') return '40 hrs';
  if (normalizedRange === '40+') return 'Over 40 hrs';
  return formatRangeLabel(normalizedRange);
}

// Slices are always volunteer counts per bucket. The old version split the total
// hours across buckets in proportion to those counts, so the legend showed
// estimated hours that read like counts (e.g. "10-19 hrs: 41").
function buildChartData(hoursData, totalHoursData, useBucketCounts = false) {
  const normalizedHoursData = mergeHoursBuckets(hoursData);
  const totalVolunteers = normalizedHoursData.reduce((total, cur) => total + (cur.count || 0), 0);
  const totalHoursWorked = useBucketCounts
    ? totalVolunteers
    : Math.round(Number(totalHoursData?.current ?? totalHoursData?.count ?? 0));

  const userData = normalizedHoursData.map(range => {
    const value = range.count || 0;
    return {
      name: useBucketCounts ? formatCommittedRangeLabel(range._id) : formatRangeLabel(range._id),
      value,
      percentage: totalVolunteers ? Math.round((value / totalVolunteers) * 100) : 0,
      valueType: 'volunteers',
    };
  });

  return { normalizedHoursData, userData, totalVolunteers, totalHoursWorked };
}

// --- Main Exported Component ---

export default function VolunteerHoursDistribution({
  isLoading,
  darkMode,
  hoursData,
  totalHoursData,
  title = 'Actual Hours Worked',
  centerLabelLines = ['TOTAL HOURS', 'WORKED'],
  useBucketCounts = false,
}) {
  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '200px' }}
      >
        <Loading />
      </div>
    );
  }

  const { userData, totalVolunteers, totalHoursWorked } = buildChartData(
    hoursData,
    totalHoursData,
    useBucketCounts,
  );

  return (
    <div
      className="d-flex flex-column align-items-center"
      style={{ flex: '1 1 24rem', minWidth: 0 }}
    >
      <h5 style={{ color: darkMode ? 'white' : 'inherit' }}>{title}</h5>
      <DonutChart
        title={centerLabelLines.join(' ')}
        // slices and percentages are volunteers; the centre shows the headline total
        totalCount={totalVolunteers}
        centerCount={totalHoursWorked}
        unitLabel="volunteers"
        percentageChange={0}
        data={userData.map(({ name, value }) => ({ label: name, value }))}
        colors={COLORS}
        comparisonType="No Comparison"
        darkMode={darkMode}
        emptyMessage={
          useBucketCounts ? 'Weekly committed hours are not available yet' : 'No data available yet'
        }
      />
    </div>
  );
}

// Extra named exports for automated testing
export { mergeHoursBuckets };

export function computeDistribution(hoursData, totalHoursData, useBucketCounts = false) {
  const { userData, totalVolunteers, totalHoursWorked } = buildChartData(
    hoursData,
    totalHoursData,
    useBucketCounts,
  );
  return { userData, totalVolunteers, totalHoursWorked };
}
