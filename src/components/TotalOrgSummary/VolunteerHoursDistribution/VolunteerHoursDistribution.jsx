import { useEffect, useState } from 'react';
import HoursWorkedPieChart from '../HoursWorkedPieChart/HoursWorkedPieChart';

// components
import Loading from '../../common/Loading';

const COLORS = ['#00AFF4', '#FFA500', '#00B030', '#EC52CB', '#F8FF00'];

// convert backend range string (e.g. "10", "40+", "20-29")
// into a user-facing label with units.
export function formatRangeLabel(rangeStr) {
  if (!rangeStr) return '';
  let displayName = '';
  if (rangeStr.includes('+')) {
    const num = parseFloat(rangeStr.replace('+', ''));
    if (num === 40) {
      // bucket following 40 should display as 50+
      displayName = '50+ hrs';
    } else {
      displayName = `${num}+ hrs`;
    }
  } else {
    const num = parseFloat(rangeStr);
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
              <span className="ms-2">
                {item.displayName || item.name}
                {item.count !== undefined && ` (${item.count})`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// export HoursWorkList separately for testing
export { HoursWorkList };

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

  // total volunteers is just the sum of all bucket counts
  const safeHoursData = Array.isArray(hoursData) ? hoursData : [];
  const totalVolunteers = safeHoursData.reduce((total, cur) => total + (cur.count || 0), 0);

  // the pie chart center should show total hours worked (comes from totalHoursData.current)
  const totalHoursWorked = totalHoursData?.current || 0;

  const userData = safeHoursData.map(range => {
    const value = range.count || 0;
    return {
      name: range._id,
      value,
      // percentage of volunteers in this bucket (rounded)
      percentage: totalVolunteers ? Math.round((value / totalVolunteers) * 100) : 0,
    };
  });

  return (
    <div
      className="d-flex flex-row flex-wrap align-items-center justify-content-center"
      style={{ gap: '20px' }}
    >
      <HoursWorkedPieChart
        darkmode={darkMode}
        windowSize={windowSize}
        userData={userData}
        totalHours={totalHoursWorked}
        colors={COLORS}
      />
      <HoursWorkList data={hoursData} darkMode={darkMode} />
    </div>
  );
}
