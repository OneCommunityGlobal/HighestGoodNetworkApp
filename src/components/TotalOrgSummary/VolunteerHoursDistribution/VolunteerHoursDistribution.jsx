import { useEffect, useState } from 'react';

import { ReportPieChart } from '../../common/ReportPieChart/ReportPieChart';

export default function VolunteerHoursDistribution({ darkMode, hoursWorked }) {
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
      <ReportPieChart darkmode={darkMode} windowSize={windowSize} userData={hoursWorked} />
    </div>
  );
}
