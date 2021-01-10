import React, { useState } from 'react';
import {
  Button, Form, FormGroup, Label, Input, FormText, Row, Col, FormFeedback, Modal, ModalHeader, ModalBody,
} from 'reactstrap';
import { connect } from 'react-redux';
import AssignBadgePopup from './AssignBadgePopup';
import { getUserToBeAssigned, assignBadges } from '../../actions/badgeManagement';

const AssignBadge = (props) => {

  const [isOpen, setOpen] = useState(false);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');

  const toggle = () => setOpen(isOpen => !isOpen);

  const clickAssign = (e) => {
    e.preventDefault();
    assignUser(first, last);
    toggle();
  }

  const assignUser = (first, last) => {
    const userName = first + ' ' + last;
    props.getUserToBeAssigned(userName);
  }

  const clickSubmit = () => {
    assignBadges(props.userAssigned, props.selectedBadges);
  }


  return (
    <Form style={{
      margin: 20,
    }}
    >
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
              onChange={(e) => setFirst(e.target.value.trim())}
            />
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Input
              type="text"
              name="lastName"
              id="lastName"
              placeholder="Last Name"
              onChange={(e) => setLast(e.target.value.trim())}
            />
          </FormGroup>
        </Col>
      </Row>
      <FormGroup>
        <Button className="btn--dark-sea-green" onClick={clickAssign}>Assign Badge</Button>
        <Modal isOpen={isOpen} toggle={toggle}>
          <ModalHeader toggle={toggle}>Assign Badge</ModalHeader>
          <ModalBody><AssignBadgePopup allBadgeData={props.allBadgeData} toggle={toggle} /></ModalBody>
        </Modal>
        <FormText color="muted">
          Please select a badge from the badge list.
        </FormText>
      </FormGroup>
      <Button size="lg" onClick={clickSubmit}>Submit</Button>

    </Form>
  );
};

const mapStateToProps = state => ({
  selectedBadges: state.badge.selectedBadges,
  userAssigned: state.badge.userAssigned
});

const mapDispatchToProps = dispatch => ({
  getUserToBeAssigned: (userName) => dispatch(getUserToBeAssigned(userName)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AssignBadge);

