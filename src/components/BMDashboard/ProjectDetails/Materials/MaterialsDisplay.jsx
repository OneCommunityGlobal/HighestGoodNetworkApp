import React from 'react';
import { Card } from 'reactstrap';
import Materials from './Materials';

function MaterialsDisplay() {
  return (
    <Card className="cards-container">
      <h2 className="cards-container_header">Materials with quantity less than 20% left</h2>
      <Materials />
    </Card>
  );
}

export default MaterialsDisplay;
