export const CustomDateComponent = ({
  date,
  decreaseMonth,
  increaseMonth,
  darkMode,
  isStartDate,
}) => {
  const buttonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: darkMode ? 'white' : 'black',
    fontSize: '16px',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
      <button onClick={decreaseMonth} style={{ ...buttonStyle, marginLeft: '10px' }}>
        ◀
      </button>

      <span style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
        {date.toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        })}
      </span>

      {isStartDate ? (
        <button onClick={increaseMonth} style={{ ...buttonStyle, marginRight: '10px' }}>
          ▶
        </button>
      ) : (
        <></>
      )}
    </div>
  );
};
