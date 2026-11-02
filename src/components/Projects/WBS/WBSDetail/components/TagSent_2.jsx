import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

function TagSent({ elm, removeResource }) {
  return (
    //<li
    //  className="rounded-pill badge bg-primary text-wrap"
    //  onClick={() => removeResource(elm.userID)}
    //>
    //  <div className="text-white">
    //    <small className="fs-6 mr-1">{`${elm.name}`}</small>
    //    <FontAwesomeIcon icon={faTimesCircle} />
    //  </div>
    //</li>
    <li className="list-unstyled d-inline-block">
      <button
        type="button"
        className="rounded-pill badge bg-primary text-wrap border-0"
        onClick={() => removeResource(elm.userID)}
      >
        <div className="text-white d-flex align-items-center">
          <small className="fs-6 mr-1">{elm.name}</small>
          <FontAwesomeIcon icon={faTimesCircle} />
        </div>
      </button>
    </li>
  );
}

export default TagSent;
