import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

function UserTag({ userId, userName, onRemoveUser }) {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
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
