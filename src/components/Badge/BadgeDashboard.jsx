import React, { useState } from 'react';
import Badge from './Badge';
import { boxStyle } from 'styles';
import {Button} from 'reactstrap';

const BadgeDashboard = (userId, role) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div>
      <Button onClick={toggleVisibility} style={{ ...boxStyle, marginRight: '10px', marginBottom: '10px', marginLeft: '15px' }} color="primary">
        {isVisible ? 'Hide Badge' : 'Show Badge'}
      </Button>
      {isVisible && <Badge userId={userId} role={role} />}
    </div>
  );
};

export default BadgeDashboard;
