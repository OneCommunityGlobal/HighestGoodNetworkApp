import { useEffect, useState } from 'react';
import HoursWorkedPieChart from '../HoursWorkedPieChart/HoursWorkedPieChart';

// components
import Loading from '../../common/Loading';

const COLORS = ['#00AFF4', '#FFA500', '#00B030', '#EC52CB', '#F8FF00'];

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
    return start === 40 ? '50+' : `${start}+`;
  }
  if (trimmed.includes('-')) {
    const start = parseRangeStart(trimmed);
    if (start === 40) return '40';
    return String(start);
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

// convert backend range string (e.g. "10", "40+", "20-29")
// into a user-facing label with units.
export function formatRangeLabel(rangeStr) {
  if (!rangeStr) return '';
  const normalizedRange = normalizeBucketId(rangeStr);
  let displayName = '';
  if (normalizedRange.includes('+')) {
    const num = parseFloat(normalizedRange.replace('+', ''));
    if (num === 40) {
      displayName = '50+ hrs';
    } else {
      displayName = `${num}+ hrs`;
    }
  } else {
    const num = parseFloat(normalizedRange);
    const next = (num + 9.99).toFixed(2);
    displayName = `${num}-${next} hrs`;
  }
  return displayName;
}

function HoursWorkList({ data, darkMode }) {
  if (!data) return <div />;

  const ranges = data.map((elem, index) => {
    const rangeStr = elem._id;
    const entry = {
      name: rangeStr,
      count: elem.count,
    };

    // derive human-readable label for the bucket
    const displayName = formatRangeLabel(rangeStr);

    entry.displayName = displayName;
    entry.color = COLORS[index];

    const rangeArr = rangeStr.split('-');
    if (rangeArr.length > 1) {
      const [min, max] = rangeArr;
      entry.min = Number(min);
      entry.max = Number(max);
    } else {
      const min = rangeStr.split('+');
      entry.min = Number(min);
      entry.max = Infinity;
    }
    return entry;
  });

  return (
    <div>
      <h6 style={{ color: darkMode ? 'white' : 'grey' }}>Hours Worked</h6>
      <div>
        <ul className="list-unstyled">
          {ranges.map(item => (
            <li key={item.name} className="text-secondary d-flex align-items-center">
              <div
                className="me-2"
                style={{
                  width: '15px',
                  height: '15px',
                  marginRight: '5px',
                  backgroundColor: item.color,
                }}
              />
              <span className="ms-2">{item.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// export HoursWorkList separately for testing
export { HoursWorkList };

// shared helper: derives normalizedHoursData, userData, and totals from raw API data
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
    const value = range.allocatedHours || 0;
    return {
      name: range._id,
      value,
      percentage: totalAllocatedHours ? Math.round((value / totalAllocatedHours) * 100) : 0,
    };
  });
  return { normalizedHoursData, userData, totalVolunteers, totalHoursWorked };
}

export default function VolunteerHoursDistribution({
  isLoading,
  darkMode,
  hoursData,
  totalHoursData,
}) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const updateWindowSize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener('resize', updateWindowSize);
    return () => {
      window.removeEventListener('resize', updateWindowSize);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="w-100vh">
          <Loading />
        </div>
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

// computeDistribution: pure helper to derive the chart payload from API data
export function computeDistribution(hoursData, totalHoursData) {
  const { userData, totalVolunteers, totalHoursWorked } = buildChartData(hoursData, totalHoursData);
  return { userData, totalVolunteers, totalHoursWorked };
}

export { mergeHoursBuckets };
