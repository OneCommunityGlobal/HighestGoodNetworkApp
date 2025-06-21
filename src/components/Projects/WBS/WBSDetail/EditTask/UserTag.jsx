import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

function UserTag({ userId, userName, onRemoveUser }) {
  return (
    <li
      className="rounded-pill badge bg-primary text-wrap"
      onClick={() => onRemoveUser(userId)}
    >
      <div className="text-white">
        <small className="fs-6 mr-1">{`${userName}`}</small>
        <FontAwesomeIcon icon={faTimesCircle} />
      </div>
    </li>
  );
}

export default UserTag;
