import React from 'react';
import { Card } from 'reactstrap';
import ToolCards from './ToolCards';

function RentedToolsDisplay() {
  return (
    <Card className="cards-container">
      <h6>Rented Tools or equipment to be returned in 3 days.</h6>
      <ToolCards />  
    </Card>
  );
}

export default RentedToolsDisplay;
