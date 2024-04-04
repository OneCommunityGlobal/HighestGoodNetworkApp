import React from 'react';

const Loading = ({align, darkMode}) => {
  let alignClassName = "";
  if(align == "center"){
    alignClassName = "d-flex justify-content-center align-items-center"
  } else if (align == "right"){
    alignClassName = "d-flex justify-content-end align-items-center"
  } else if (align == "left"){
    alignClassName = "d-flex justify-content-start align-items-center"
  }

  return (
    <div className={`container-fluid ${alignClassName}`} data-testid="loading">
      <div className="fa-5x">
        <i className={`fa fa-spinner fa-pulse ${darkMode ? "text-azure" : ""}`} data-testid="loading-spinner"></i>
      </div>
    </div>
  );
};

export default Loading;
