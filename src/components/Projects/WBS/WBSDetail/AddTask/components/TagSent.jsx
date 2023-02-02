/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';

function TagSent({ titleName, removeTags, index }) {
  return (
    <li key={index} className="rounded-pill badge bg-primary text-wrap" onClick={removeTags}>
      <div className="text-white">
        <span className="fs-6">{titleName}</span>
      </div>
    </li>
  );
}

export default TagSent;
