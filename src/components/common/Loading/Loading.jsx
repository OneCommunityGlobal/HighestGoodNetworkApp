import React from 'react';

const Loading = () => {
  return (
    <div className="container-fluid" data-testid="loading">
      <div className="fa-5x">
        <i className="fa fa-spinner fa-pulse" data-testid="loading-spinner"></i>
      </div>
    </div>
  );
};

export default Loading;
