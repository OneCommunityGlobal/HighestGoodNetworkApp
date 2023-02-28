/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

function TagSent({ tag, removeTags }) {
  return (
    <li className="rounded-pill badge bg-primary text-wrap" onClick={() => removeTags(tag._id)}>
      <div className="text-white">
        <small className="fs-6 mr-1">{`${tag.firstName} ${tag.lastName}`}</small>
        <FontAwesomeIcon icon={faTimesCircle} />
      </div>
    </li>
  );
}

export default TagSent;
