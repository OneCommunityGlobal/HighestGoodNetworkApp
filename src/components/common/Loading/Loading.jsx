import React from 'react';
import './styles.css';

const Loading = () => {
  return (
    <div className="container-fluid main-container">
      <div className="fa-5x">
        <i className="fa fa-spinner fa-pulse"></i>
      </div>
    </div>
  );
};

export default Loading;
