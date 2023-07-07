import React from 'react';

const NameMessageComponent = ({ name, message }) => {
  return (
    <div>
      <h4>{name}</h4>
      {message === '' ? <p style={{ color: 'red' }}>No reports posted yet</p> : <p>{message}</p>}
    </div>
  );
};

export default NameMessageComponent;
