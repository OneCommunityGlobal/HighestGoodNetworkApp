import React, { useState, useEffect } from 'react';
import {
  Button, Form, FormGroup, Label, FormText, Row, Col, Modal, ModalHeader, ModalBody, Alert
} from 'reactstrap';
import { connect } from 'react-redux';
import AssignBadgePopup from './AssignBadgePopup';
import { getFirstName, getLastName, assignBadges, clearNameAndSelected, closeAlert } from '../../actions/badgeManagement';
import { getAllUserProfile } from '../../actions/userManagement';
import Autosuggest from 'react-autosuggest';


const AssignBadge = (props) => {

  const [isOpen, setOpen] = useState(false);
  const [firstSuggestions, setFirstSuggestions] = useState([]);
  const [lastSuggestions, setLastSuggestions] = useState([]);

  useEffect(() => {
    props.getAllUserProfile();
    props.clearNameAndSelected();
    props.closeAlert();
  }, [])

  const activeUsers = props.allUserProfiles.filter(profile => profile.isActive === true);

  const escapeRegexCharacters = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const getSuggestions = (value) => {
    const escapedValue = escapeRegexCharacters(value.trim());
    const regex = new RegExp('^' + escapedValue, 'i');
    return activeUsers.filter(user => regex.test(user.firstName) || regex.test(user.lastName));
  }

  const getSuggestionFirst = suggestion => suggestion.firstName;

  const getSuggestionLast = suggestion => suggestion.lastName;

  const renderSuggestion = (suggestion) => {
    return (
      <div>{suggestion.firstName} {suggestion.lastName}</div>
    );
  }

  const onFirstChange = (event, { newValue }) => {
    props.getFirstName(newValue);
  };

  const onLastChange = (event, { newValue }) => {
    props.getLastName(newValue);
  };

  const onFirstSuggestionsFetchRequested = ({ value }) => {
    setFirstSuggestions(getSuggestions(value));
  };

  const onFirstSuggestionsClearRequested = () => {
    setFirstSuggestions([]);
  };

  const onFirstSuggestionSelected = (event, { suggestion }) => {
    props.getLastName(suggestion.lastName);
  };

  const onLastSuggestionsFetchRequested = ({ value }) => {
    setLastSuggestions(getSuggestions(value));
  };

  const onLastSuggestionsClearRequested = () => {
    setLastSuggestions([]);
  };

  const onLastSuggestionSelected = (event, { suggestion }) => {
    props.getFirstName(suggestion.firstName);
  };


  const toggle = () => setOpen(isOpen => !isOpen);


  const clickSubmit = () => {
    props.assignBadges(props.firstName, props.lastName, props.selectedBadges);
    props.clearNameAndSelected();
  }

  const FirstInputProps = {
    placeholder: "first name",
    value: props.firstName,
    onChange: onFirstChange
  };
  const LastInputProps = {
    placeholder: "last name",
    value: props.lastName,
    onChange: onLastChange
  };

  return (
    <Form style={{
      margin: 20,
    }}
    >
      <Row className="assign-badge-margin-top">
        <Col md="2">
          <Label style={{ fontWeight: 'bold' }}>Name</Label>
        </Col>
        <Col md="4">
          <Autosuggest
            suggestions={firstSuggestions}
            onSuggestionsFetchRequested={onFirstSuggestionsFetchRequested}
            onSuggestionsClearRequested={onFirstSuggestionsClearRequested}
            onSuggestionSelected={onFirstSuggestionSelected}
            getSuggestionValue={getSuggestionFirst}
            renderSuggestion={renderSuggestion}
            inputProps={FirstInputProps}
          />
        </Col>
        <Col md="4">
          <Autosuggest
            suggestions={lastSuggestions}
            onSuggestionsFetchRequested={onLastSuggestionsFetchRequested}
            onSuggestionsClearRequested={onLastSuggestionsClearRequested}
            onSuggestionSelected={onLastSuggestionSelected}
            getSuggestionValue={getSuggestionLast}
            renderSuggestion={renderSuggestion}
            inputProps={LastInputProps}
          />
        </Col>
      </Row>
      <FormGroup className="assign-badge-margin-top">
        <Button outline color="info" onClick={toggle}>Assign Badge</Button>
        <Modal isOpen={isOpen} toggle={toggle} backdrop={false}>
          <ModalHeader toggle={toggle}>Assign Badge</ModalHeader>
          <ModalBody><AssignBadgePopup allBadgeData={props.allBadgeData} toggle={toggle} /></ModalBody>
        </Modal>
        <FormText color="muted">
          Please select a badge from the badge list.
        </FormText>
        <Alert color="dark" className="assign-badge-margin-top"> {props.selectedBadges ? props.selectedBadges.length : '0'} bagdes selected</Alert>
      </FormGroup>
      <Button size="lg" color="info" className="assign-badge-margin-top" onClick={clickSubmit}>Submit</Button>
    </Form>
  );
};

const mapStateToProps = state => ({
  selectedBadges: state.badge.selectedBadges,
  firstName: state.badge.firstName,
  lastName: state.badge.lastName,
  message: state.badge.message,
  alertVisible: state.badge.alertVisible,
  color: state.badge.color,
  allUserProfiles: state.allUserProfiles.userProfiles
});

const mapDispatchToProps = dispatch => ({
  getFirstName: (firstName) => dispatch(getFirstName(firstName)),
  getLastName: (lastName) => dispatch(getLastName(lastName)),
  getAllUserProfile: () => dispatch(getAllUserProfile()),
  clearNameAndSelected: () => dispatch(clearNameAndSelected()),
  assignBadges: (fisrtName, lastName, selectedBadge) => dispatch(assignBadges(fisrtName, lastName, selectedBadge)),
  closeAlert: () => dispatch(closeAlert())
});

export default connect(mapStateToProps, mapDispatchToProps)(AssignBadge);

