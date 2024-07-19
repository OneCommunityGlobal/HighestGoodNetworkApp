import { useEffect, useState } from 'react';
import { ReportPieChart } from '../../common/ReportPieChart/ReportPieChart';

export default function VolunteerHoursDistribution({ darkMode, usersTimeEntries = [] }) {
  const [userData, setUserData] = useState([]);
  // eslint-disable-next-line no-console
  // console.log('VolunteerHoursStats(2)u);

  useEffect(() => {
    if (!Array.isArray(usersTimeEntries) || usersTimeEntries.length === 0) {
      return;
    }

    const totalHoursWorked = usersTimeEntries.reduce((acc, curr) => {
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
        totalHoursCalculated: totalHoursWorked,
        title: 'Volunteer Hours',
      };
    });

    setUserData(arrData);
  }, [usersTimeEntries]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('userData', userData);
  }, [userData]);

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
      <h4 style={{ color: 'black' }}>Volunteer Hours Distribution</h4>
      <ReportPieChart darkmode={darkMode} windowSize={windowSize} userData={userData} />
    </div>
  );
}
