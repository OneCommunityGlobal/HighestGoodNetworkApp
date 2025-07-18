import { useEffect, useState } from 'react';
import HoursWorkedPieChart from '../HoursWorkedPieChart/HoursWorkedPieChart';

// components
import Loading from '../../common/Loading';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#800080'];

function HoursWorkList({ data }) {
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
      <h6 style={{ color: 'grey' }}>Hours Worked</h6>
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
  usersTimeEntries = [],
  usersOverTimeEntries = [],
  comparisonType,
}) {
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    if (
      !Array.isArray(usersTimeEntries) ||
      usersTimeEntries.length === 0 ||
      !Array.isArray(usersOverTimeEntries) ||
      usersOverTimeEntries.length === 0
    ) {
      return;
    }

    const hoursWorked = usersTimeEntries.reduce((acc, curr) => {
      const hours = Number(curr.hours) || 0;
      const minutes = Number(curr.minutes) || 0;
      return acc + hours + minutes / 60;
    }, 0);

    const hoursOverTimeWorked = usersOverTimeEntries.reduce((acc, curr) => {
      const hours = Number(curr.hours) || 0;
      const minutes = Number(curr.minutes) || 0;
      return acc + hours + minutes / 60;
    }, 0);

    const ranges = [
      { name: '0 - 9.99', min: 0, max: 9.99 },
      { name: '10 - 19.99', min: 10, max: 19.99 },
      { name: '20 - 29.99', min: 20, max: 29.99 },
      { name: '30 - 39.99', min: 30, max: 39.99 },
      { name: '40+', min: 40, max: Infinity },
    ];

    const arrData = ranges.map(range => {
      const value = usersTimeEntries.reduce((acc, curr) => {
        const hours = Number(curr.hours) || 0;
        const minutes = Number(curr.minutes) || 0;
        const total = hours + minutes / 60;
        if (total >= range.min && total < range.max) {
          return acc + total;
        }
        return acc;
      }, 0);

      return {
        name: range.name,
        value,
        totalHours: hoursWorked,
        totalOverTimeHours: hoursOverTimeWorked,
        title: 'HOURS WORKED',
      };
    });

    setUserData(arrData);
  }, [usersTimeEntries, usersOverTimeEntries]);

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

  return (
    <div>
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center">
          <div className="w-100vh">
            <Loading />
          </div>
        </div>
      ) : (
        <HoursWorkedPieChart
          darkmode={darkMode}
          windowSize={windowSize}
          userData={userData}
          comparisonType={comparisonType}
        />
      )}
    </div>
  );
}
