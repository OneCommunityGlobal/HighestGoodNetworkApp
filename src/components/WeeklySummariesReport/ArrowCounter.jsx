import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import './ArrowCounter.css';

const ArrowCounter = ({ handleIncrement, handleDecrement }) => {

  return (
    <div className="container">
      <div className="button-container">
        <FontAwesomeIcon 
            icon={faArrowUp}
            onClick={() => handleIncrement()}
            size="xs"
        />
      </div>
      <div className="button-container">
        <FontAwesomeIcon 
            icon={faArrowDown}
            onClick={() => handleDecrement()}
            size="xs"
        />
      </div>
    </div>
  );
};

export default ArrowCounter;