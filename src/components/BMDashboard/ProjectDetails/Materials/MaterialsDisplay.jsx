import React from 'react';
import { Card } from 'reactstrap';
import Materials from './Materials';

function MaterialsDisplay() {
  return (
    <Card className="cards-container">
      <h6>Materials with quantity less than 20% left</h6>
      <Materials />
    </Card>
  );
}

export default MaterialsDisplay;
