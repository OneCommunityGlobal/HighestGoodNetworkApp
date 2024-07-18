import { useState, useEffect } from 'react';

function HoursWorkList({ volunteerHoursStats = [] }) {
  const [workedData, setWorkedData] = useState([]);

  useEffect(() => {
    setWorkedData(volunteerHoursStats);
    // eslint-disable-next-line no-console
    // console.log('workedData', workedData);
    // // eslint-disable-next-line no-console
    // console.log('VolunteerHoursStats(3)', volunteerHoursStats);
  }, [volunteerHoursStats, workedData]);

  return (
    <div>
      <h6 style={{ color: 'grey' }}>Hours Worked</h6>
      <ul className="list-unstyled">
        {workedData.map(item => (
          <li key={item.id}>
            {item.range} - {item.count} hrs.
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HoursWorkList;
