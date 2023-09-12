import React from 'react';
import './ToolCard.css';
import { Card, CardImg, CardBody, CardTitle } from 'reactstrap';

function ToolCard() {
  return (
    <Card className="toolCard">
      <CardImg
        alt=""
        src="https://www.theforkliftcenter.com/images/forklift-hero-left.png"
        top
        width="100%"
      />
      <CardBody>
        <CardTitle tag="h6">Card title</CardTitle>
        <div className="infoDiv">Term ends in __ hours.</div>
      </CardBody>
    </Card>
  );
}

export default ToolCard;
