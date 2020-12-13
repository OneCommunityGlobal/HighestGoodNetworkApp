import React, { useState } from 'react';
import {
  Card, CardTitle, CardBody, Button, Modal, ModalBody, ModalHeader
} from 'reactstrap';
import BadgeHistory from './BadgeHistory';

const OldBadges = (props) => {
  const [isOpen, setOpen] = useState(false);

  const toggle = () => setOpen(isOpen => !isOpen);

  return (
    <Card style={{ backgroundColor: '#f6f6f3', marginTop: 20, marginBottom: 20 }}>
      <CardBody>
        <CardTitle
          style={{
            fontWeight: 'bold',
            fontSize: 18,
            color: '#285739',
            marginBottom: 15
          }}
        >
          Badges Earned Before Last Week
        <Button className="btn--dark-sea-green float-right" onClick={toggle}>Full View</Button>
          <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Full View of Badge History</ModalHeader>
            <ModalBody><BadgeHistory badges={props.badges} /></ModalBody>
          </Modal>
        </CardTitle>
        <div className="old_badges">
          <BadgeHistory badges={props.badges} />
        </div>
      </CardBody>
    </Card >
  );
};

export default OldBadges;