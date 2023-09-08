import React from 'react';
import { Card } from 'reactstrap';
import ToolCard from './ToolCard';

function RentedTools() {
  return (
    <Card style={{ margin: 20 }}>
      <h6>Rented Tools or equipment to be returned in 3 days.</h6>
      <ToolCard />
    </Card>
  );
}

export default RentedTools;
