import { useEffect, useState } from 'react';
import HoursWorkedPieChart from '../HoursWorkedPieChart/HoursWorkedPieChart';

// Components
import Loading from '../../common/Loading';

const COLORS = ['#00AFF4', '#FFA500', '#00B030', '#EC52CB', '#F8FF00'];

// --- Helper Functions ---

function parseRangeStart(rangeStr) {
  if (!rangeStr) return 0;
  const [first] = String(rangeStr).split(/[-+]/);
  const parsed = Number(first);
  return Number.isFinite(parsed) ? parsed : 0;
}

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

  return [...merged.entries()]
    .map(([id, count]) => ({ _id: id, count }))
    .sort((a, b) => parseRangeStart(a._id) - parseRangeStart(b._id));
}

function allocateRoundedHoursByCount(normalizedHoursData, totalHoursWorked) {
  const roundedTotalHours = Math.max(0, Math.round(Number(totalHoursWorked) || 0));
  const totalCount = normalizedHoursData.reduce(
    (sum, bucket) => sum + (Number(bucket.count) || 0),
    0,
  );

  if (!totalCount || !roundedTotalHours) {
    return normalizedHoursData.map(bucket => ({ ...bucket, allocatedHours: 0 }));
  }

  const provisional = normalizedHoursData.map(bucket => {
    const count = Number(bucket.count) || 0;
    const exact = (count / totalCount) * roundedTotalHours;
    const base = Math.floor(exact);
    return { ...bucket, allocatedHours: base, remainder: exact - base };
  });

  let assigned = provisional.reduce((sum, bucket) => sum + bucket.allocatedHours, 0);
  let remaining = roundedTotalHours - assigned;

  const byRemainderDesc = [...provisional].sort((a, b) => b.remainder - a.remainder);
  let i = 0;
  while (remaining > 0 && byRemainderDesc.length > 0) {
    byRemainderDesc[i % byRemainderDesc.length].allocatedHours += 1;
    remaining -= 1;
    i += 1;
  }

  return byRemainderDesc
    .map(({ remainder, ...bucket }) => bucket)
    .sort((a, b) => parseRangeStart(a._id) - parseRangeStart(b._id));
}

export function formatRangeLabel(rangeStr) {
  if (!rangeStr) return '';
  const normalizedRange = normalizeBucketId(rangeStr);

  if (normalizedRange.includes('+')) {
    const num = parseFloat(normalizedRange.replace('+', ''));
    return `${num}+ hrs`;
  } else {
    const num = parseFloat(normalizedRange);
    return `${num}-${num + 9} hrs`;
  }
}

function buildChartData(hoursData, totalHoursData) {
  const normalizedHoursData = mergeHoursBuckets(hoursData);
  const totalVolunteers = normalizedHoursData.reduce((total, cur) => total + (cur.count || 0), 0);
  const totalHoursWorked = Number(totalHoursData?.current ?? totalHoursData?.count ?? 0);

  const hoursByBucket = allocateRoundedHoursByCount(normalizedHoursData, totalHoursWorked);
  const totalAllocatedHours = hoursByBucket.reduce(
    (sum, bucket) => sum + (bucket.allocatedHours || 0),
    0,
  );

  const userData = hoursByBucket.map(range => {
    const value = totalHoursWorked > 0 ? range.allocatedHours || 0 : range.count || 0;
    const denominator = totalHoursWorked > 0 ? totalAllocatedHours : totalVolunteers;

    return {
      name: formatRangeLabel(range._id),
      value,
      percentage: denominator ? Math.round((value / denominator) * 100) : 0,
    };
  });

  return { normalizedHoursData, userData, totalVolunteers, totalHoursWorked };
}

// --- Sub-Components ---

function HoursWorkList({ data, darkMode }) {
  if (!data) return <div />;

  const ranges = data.map((elem, index) => {
    return {
      name: elem._id,
      count: elem.count,
      displayName: formatRangeLabel(elem._id),
      color: COLORS[index % COLORS.length],
    };
  });

  return (
    <div>
      <h6 style={{ color: darkMode ? 'white' : 'grey' }}>Hours Worked</h6>
      <div>
        <ul className="list-unstyled">
          {ranges.map(item => (
            <li key={item.name} className="text-secondary d-flex align-items-center mb-1">
              <div
                className="me-2"
                style={{
                  width: '15px',
                  height: '15px',
                  backgroundColor: item.color,
                }}
              />
              <span className="ms-2">{item.displayName}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// --- Main Exported Component ---

export default function VolunteerHoursDistribution({
  isLoading,
  darkMode,
  hoursData,
  totalHoursData,
}) {
  // FIXED: Using standard globalThis setup
  const [windowSize, setWindowSize] = useState({
    width: typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1200,
    height: typeof globalThis.window !== 'undefined' ? globalThis.window.innerHeight : 800,
  });

  useEffect(() => {
    // FIXED: Cleaned up negated conditions and wrapped with explicit globalThis tracking
    if (typeof globalThis.window !== 'undefined') {
      const updateWindowSize = () => {
        setWindowSize({
          width: globalThis.window.innerWidth,
          height: globalThis.window.innerHeight,
        });
      };

      globalThis.window.addEventListener('resize', updateWindowSize);
      return () => globalThis.window.removeEventListener('resize', updateWindowSize);
    }
  }, []);

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

  const { normalizedHoursData, userData, totalHoursWorked } = buildChartData(
    hoursData,
    totalHoursData,
  );

  return (
    <div
      className="d-flex flex-row flex-wrap align-items-center justify-content-center"
      style={{ gap: '20px' }}
    >
      <HoursWorkedPieChart
        darkMode={darkMode}
        windowSize={windowSize}
        userData={userData}
        totalHours={totalHoursWorked}
        colors={COLORS}
      />
      <HoursWorkList data={normalizedHoursData} darkMode={darkMode} />
    </div>
  );
}

// Extra named exports for automated testing
export { HoursWorkList, mergeHoursBuckets };

export function computeDistribution(hoursData, totalHoursData) {
  const { userData, totalVolunteers, totalHoursWorked } = buildChartData(hoursData, totalHoursData);
  return { userData, totalVolunteers, totalHoursWorked };
}
