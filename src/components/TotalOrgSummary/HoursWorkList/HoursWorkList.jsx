function HoursWorkList() {
  const ranges = [
    { name: '10-19.99', min: 10, max: 19.99, color: '#0088FE' },
    { name: '20-29.99', min: 20, max: 29.99, color: '#00C49F' },
    { name: '30-34.99', min: 30, max: 34.99, color: '#FFBB28' },
    { name: '35-39.99', min: 35, max: 39.99, color: '#FF8042' },
    { name: '40+', min: 40, max: Infinity, color: '#800080' },
  ];

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

export default HoursWorkList;
