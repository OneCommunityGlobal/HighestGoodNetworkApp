import { useEffect, useState } from 'react';

import { ReportPieChart } from '../../common/ReportPieChart/ReportPieChart';

export default function VolunteerHoursDistribution({ darkMode, volunteerHoursStats = [] }) {
  const [userData, setUserData] = useState([]);
  // eslint-disable-next-line no-console
  console.log('VolunteerHoursStats(2)', volunteerHoursStats);

  useEffect(() => {
    const totalHoursWorked =
      Array.isArray(volunteerHoursStats) &&
      volunteerHoursStats.length > 0 &&
      volunteerHoursStats.reduce((acc, curr) => {
        return acc + curr.count;
      }, 0);

    const arrData =
      Array.isArray(volunteerHoursStats) &&
      volunteerHoursStats.length > 0 &&
      volunteerHoursStats.map(member => {
        const data = {
          name: `${member._id}`,
          value: member.count,
          totalHoursCalculated: totalHoursWorked,
          title: 'Volunteer Hours',
          // lastName: '',
        };
        return data;
      });
    // eslint-disable-next-line no-console
    console.log('arrData', arrData);

    // const sortedArr = arrData.sort((a, b) => a.name.localeCompare(b.name));
    // setUserData(sortedArr);
    setUserData(arrData);
    // eslint-disable-next-line no-console
    // console.log('userData', userData);
  }, [volunteerHoursStats]);

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
