import React from 'react';

const NameMessageComponent = ({ name, message }) => {
  return (
    <div>
      <h4>{name}</h4>
      <p>{message}</p>
    </div>
  );
};

export default NameMessageComponent;
