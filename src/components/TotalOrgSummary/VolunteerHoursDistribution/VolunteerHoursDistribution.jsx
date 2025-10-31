import { useEffect, useState } from 'react';
import HoursWorkedPieChart from '../HoursWorkedPieChart/HoursWorkedPieChart';

// components
import Loading from '../../common/Loading';

const COLORS = ['#00AFF4', '#FFA500', '#00B030', '#EC52CB', '#F8FF00'];

function HoursWorkList({ data, darkMode }) {
  if (!data) return <div />;

  const ranges = data.map((elem, index) => {
    const rangeStr = elem._id;
    const entry = {
      name: rangeStr,
    };

    const rangeArr = rangeStr.split('-');
    entry.color = COLORS[index];

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

export default function VolunteerHoursDistribution({
  isLoading,
  darkMode,
  hoursData,
  totalHoursData,
  comparisonType,
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

  const totalHours = hoursData.reduce((total, cur) => total + cur.count, 0);

  const userData = hoursData.map(range => {
    return {
      name: range._id,
      value: range.count,
      totalHours,
      title: 'HOURS WORKED',
      comparisonPercentage: totalHoursData.comparison,
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
        comparisonType={comparisonType}
        colors={COLORS}
      />
      <HoursWorkList data={hoursData} darkMode={darkMode} />
    </div>
  );
}
