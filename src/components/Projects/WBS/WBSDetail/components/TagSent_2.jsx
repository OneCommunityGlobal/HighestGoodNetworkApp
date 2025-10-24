import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

function TagSent({ elm, removeResource }) {
  return (
    <li
      className="rounded-pill badge bg-primary text-wrap"
      onClick={() => removeResource(elm.userID)}
    >
      <div className="text-white">
        <small className="fs-6 mr-1">{`${elm.name}`}</small>
        <FontAwesomeIcon icon={faTimesCircle} />
      </div>
    </li>
  );
}

export default TagSent;
