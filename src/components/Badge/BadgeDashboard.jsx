import React, { useState } from 'react';
import Badge from './Badge';

const BadgeDashboard = (userId, role) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div>
      <button onClick={toggleVisibility}>
        {isVisible ? 'Hide Badge' : 'Show Badge'}
      </button>
      {isVisible && <Badge userId={userId} role={role} />}
    </div>
  );
};

export default BadgeDashboard;
