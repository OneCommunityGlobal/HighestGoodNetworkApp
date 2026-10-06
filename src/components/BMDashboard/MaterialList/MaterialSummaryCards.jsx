import React from 'react';
import { Row, Col, Card, CardBody, CardTitle, CardText } from 'reactstrap';

const MaterialSummaryCards = ({ stats }) => {
  const cardConfigs = [
    { title: 'Active Materials', value: stats.activeMaterials, color: '#007bff' },
    { title: 'Low Stock Items', value: stats.lowStockCount, color: '#dc3545' },
    { title: 'Total Wasted', value: stats.totalWasted, color: '#6c757d' },
  ];

  return (
    <Row className="mb-4 px-3">
      {cardConfigs.map((card, idx) => (
        <Col key={idx} md="4">
          <Card
            style={{
              borderLeft: `5px solid ${card.color}`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <CardBody className="text-center">
              <CardTitle tag="h6" className="text-muted text-uppercase">
                {card.title}
              </CardTitle>
              <CardText tag="h4" style={{ fontWeight: 'bold', color: card.color }}>
                {card.value}
              </CardText>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default MaterialSummaryCards;
