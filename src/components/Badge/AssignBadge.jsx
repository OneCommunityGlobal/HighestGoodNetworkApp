import React, { useState, useEffect } from 'react';
import {
  Button, Form, FormGroup, Label, FormText, Row, Col, Modal, ModalHeader, ModalBody, Alert
} from 'reactstrap';
import { connect } from 'react-redux';
import AssignBadgePopup from './AssignBadgePopup';
import { getUserToBeAssigned, assignBadges, clearSelectedBadges } from '../../actions/badgeManagement';
import { getAllUserProfile } from '../../actions/userManagement';
import Autosuggest from 'react-autosuggest';


const AssignBadge = (props) => {

  const [isOpen, setOpen] = useState(false);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [firstSuggestions, setFirstSuggestions] = useState([]);
  const [lastSuggestions, setLastSuggestions] = useState([]);

  useEffect(() => {
    props.getAllUserProfile();
    props.clearSelectedBadges();
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
    setFirst(newValue);
  };

  const onLastChange = (event, { newValue }) => {
    setLast(newValue);
  };

  const onFirstSuggestionsFetchRequested = ({ value }) => {
    setFirstSuggestions(getSuggestions(value));
  };

  const onFirstSuggestionsClearRequested = () => {
    setFirstSuggestions([]);
  };

  const onFirstSuggestionSelected = (event, { suggestion }) => {
    setLast(suggestion.lastName);
  };

  const onLastSuggestionsFetchRequested = ({ value }) => {
    setLastSuggestions(getSuggestions(value));
  };

  const onLastSuggestionsClearRequested = () => {
    setLastSuggestions([]);
  };

  const onLastSuggestionSelected = (event, { suggestion }) => {
    setFirst(suggestion.firstName);
  };


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
    props.clearSelectedBadges();
  }

  const FirstInputProps = {
    placeholder: "first name",
    value: first,
    onChange: onFirstChange
  };
  const LastInputProps = {
    placeholder: "last name",
    value: last,
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
        <Button outline color="info" onClick={clickAssign}>Assign Badge</Button>
        <Modal isOpen={isOpen} toggle={toggle}>
          <ModalHeader toggle={toggle}>Assign Badge</ModalHeader>
          <ModalBody><AssignBadgePopup allBadgeData={props.allBadgeData} toggle={toggle} /></ModalBody>
        </Modal>
        <FormText color="muted">
          Please select a badge from the badge list.
        </FormText>
        <Alert color="info" className="assign-badge-margin-top"> {props.selectedBadges.length} bagdes selected</Alert>
      </FormGroup>
      <Button size="lg" color="info" className="assign-badge-margin-top" onClick={clickSubmit}>Submit</Button>
    </Form>
  );
};

const mapStateToProps = state => ({
  selectedBadges: state.badge.selectedBadges,
  userAssigned: state.badge.userAssigned,
  allUserProfiles: state.allUserProfiles.userProfiles
});

const mapDispatchToProps = dispatch => ({
  getUserToBeAssigned: (userName) => dispatch(getUserToBeAssigned(userName)),
  getAllUserProfile: () => dispatch(getAllUserProfile()),
  clearSelectedBadges: () => dispatch(clearSelectedBadges())
});

export default connect(mapStateToProps, mapDispatchToProps)(AssignBadge);

