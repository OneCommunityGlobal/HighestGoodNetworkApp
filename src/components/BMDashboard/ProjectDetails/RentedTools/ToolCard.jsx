import React from 'react';

function ToolCard() {
  return (
    <div className="singleCard">
      <div className="cardImg">
        <img
          alt=""
          src="https://www.theforkliftcenter.com/images/forklift-hero-left.png"
          top
          width="100%"
        />
      </div>
      <div className="cardBody">
        <h6>Card title</h6>
        <div className="infoDiv">Term ends in __ hours.</div>
      </div>
    </div>
  );
}

export default ToolCard;
