import React from 'react';
import { Card } from 'reactstrap';
import MaterialCard from './MaterialCard';

function Materials() {
  return (
    <Card style={{ margin: 20 }}>
      <h5>Materials with quantity less than 20% left</h5>
      <MaterialCard />
    </Card>
  );
}

export default Materials;
