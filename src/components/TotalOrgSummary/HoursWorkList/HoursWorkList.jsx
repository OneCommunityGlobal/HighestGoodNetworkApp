import { useState, useEffect } from 'react';

function HoursWorkList({ usersTimeEntries = [] }) {
  const [workedData, setWorkedData] = useState([]);

  // useEffect(() => {
  //   setWorkedData(usersTimeEntries);
  //   // eslint-disable-next-line no-console
  //   // console.log('workedData', workedData);
  //   // // eslint-disable-next-line no-console
  //   // console.log('VolunteerHoursStats(3)', usersTimeEntries);
  // }, [usersTimeEntries, workedData]);

  useEffect(() => {
    if (!Array.isArray(usersTimeEntries) || usersTimeEntries.length === 0) {
      return;
    }

    // const totalHoursWorked = usersTimeEntries.reduce((acc, curr) => {
    //   const hours = Number(curr.hours) || 0;
    //   const minutes = Number(curr.minutes) || 0;
    //   return acc + hours + minutes / 60;
    // }, 0);

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
      };
    });

    setWorkedData(arrData);
  }, [usersTimeEntries]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('userData', workedData);
  }, [workedData]);

  return (
    <div>
      <h6 style={{ color: 'grey' }}>Hours Worked</h6>
      <ul className="list-unstyled">
        {workedData.map(item => (
          <li key={item.name}>
            {item.name} - {item.value.toFixed(2)} hrs.
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HoursWorkList;
