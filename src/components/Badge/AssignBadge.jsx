import React, { useState } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText, Row, Col, FormFeedback, Modal, ModalHeader, ModalBody } from 'reactstrap';
import AssignBadgePopup from './AssignBadgePopup';

const AssignBadge = (props) => {

  const [isOpen, setOpen] = useState(false);

  const toggle = () => setOpen(isOpen => !isOpen);

  return (
    <Form style={{
      margin: 20
    }}>
      <Row>
        <Col md="2">
          <Label>Name</Label>
        </Col>
        <Col md="4">
          <FormGroup>
            <Input
              type="text"
              name="firstName"
              id="firstName"
              placeholder="First Name"
            />
            <FormFeedback>First Name Can't be empty.</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Input
              type="text"
              name="lastName"
              id="lastName"
              placeholder="Last Name"

            />
            <FormFeedback>Last Name Can't be empty.</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
      <FormGroup>
        <Button className="btn--dark-sea-green" onClick={toggle}>Assign Badge</Button>
        <Modal isOpen={isOpen} toggle={toggle}>
          <ModalHeader toggle={toggle}>Assign Badge</ModalHeader>
          <ModalBody><AssignBadgePopup allBadgeData={props.allBadgeData} /></ModalBody>
        </Modal>
        <FormText color="muted">
          Please select a badge from the badge list.
        </FormText>
      </FormGroup>
      <Button size="lg">Submit</Button>

    </Form >
  );
};

export default AssignBadge;
