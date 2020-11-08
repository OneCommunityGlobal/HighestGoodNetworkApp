import React, { useState } from 'react';
import {
  Card, CardText, CardBody, CardHeader, Button, Modal, ModalBody
} from 'reactstrap';
import './Badge.css';
import NewBadges from './NewBadges';
import OldBadges from './OldBadges';
import BadgeReport from './BadgeReport';


const Badge = () => {
  const [isOpen, setOpen] = useState(false);

  const toggle = () => setOpen(isOpen => !isOpen);

  return (
    <Card style={{ backgroundColor: '#fafafa', borderRadius: 0 }}>
      <CardHeader tag="h3">
        Badges
    </CardHeader>
      <CardBody>
        <NewBadges />
        <OldBadges />
        <CardText
          style={{
            fontWeight: 'bold',
            fontSize: 18,
            color: '#285739',

          }}
        >
          Bravo! You Earned 101 Badges!
      </CardText>
        <Button className="btn--dark-sea-green float-right" onClick={toggle}>Badge Report</Button>
        <Modal isOpen={isOpen} toggle={toggle}>
          <ModalBody><BadgeReport /></ModalBody>
        </Modal>
      </CardBody>
    </Card >
  );
};

export default Badge;
