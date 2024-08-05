import { useEffect, useState } from 'react';
import HoursWorkedPieChart from '../HoursWorkedPieChart/HoursWorkedPieChart';

// components
import Loading from '../../common/Loading';

export default function VolunteerHoursDistribution({
  darkMode,
  usersTimeEntries = [],
  usersOverTimeEntries = [],
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
      {!Array.isArray(userData) || userData.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center">
          <div className="w-100vh">
            <Loading />
          </div>
        </div>
      ) : (
        <div>
          <h6 className={darkMode ? 'text-light' : 'text-dark'} style={{ textAlign: 'center' }}>
            Volunteer Hours Distribution
          </h6>
          <HoursWorkedPieChart darkmode={darkMode} windowSize={windowSize} userData={userData} />
        </div>
      )}

    </div>
  );
}
