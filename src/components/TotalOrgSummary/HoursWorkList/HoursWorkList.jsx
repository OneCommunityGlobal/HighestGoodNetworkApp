import { useState, useEffect } from 'react';

function HoursWorkList({ usersTimeEntries = [] }) {
  const [workedData, setWorkedData] = useState([]);

  useEffect(() => {
    if (!Array.isArray(usersTimeEntries) || usersTimeEntries.length === 0) {
      return;
    }

    const ranges = [
      { name: '0 - 9.99', min: 0, max: 9.99, color: '#0088FE' },
      { name: '10 - 19.99', min: 10, max: 19.99, color: '#00C49F' },
      { name: '20 - 29.99', min: 20, max: 29.99, color: '#FFBB28' },
      { name: '30 - 39.99', min: 30, max: 39.99, color: '#FF8042' },
      { name: '40+', min: 40, max: Infinity, color: '#800080' },
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
        color: range.color,
      };
    });

    setWorkedData(arrData);
  }, [usersTimeEntries]);

  return (
    <div>
      <h6 style={{ color: 'grey' }}>Hours Worked</h6>
      <div>
        <ul className="list-unstyled">
          {workedData.map(item => (
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

export default HoursWorkList;
