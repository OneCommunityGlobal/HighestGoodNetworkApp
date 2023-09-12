import React from 'react';
import { Card } from 'reactstrap';
import Materials from './Materials';
import './MaterialsDisplay.css';

function MaterialsDisplay() {
  return (
    <Card className="materials-container">
      <h6>Materials with quantity less than 20% left</h6>
      <Materials />
    </Card>
  );
}

export default MaterialsDisplay;
