const keyColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#800080'];

function HoursWorkList({ data }) {
  if (!data) return <div />;

  const ranges = data.map((elem, index) => {
    const rangeStr = elem._id;
    const entry = {
      name: rangeStr,
    };

    const rangeArr = rangeStr.split('-');
    entry.color = keyColors[index];

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

export default HoursWorkList;
