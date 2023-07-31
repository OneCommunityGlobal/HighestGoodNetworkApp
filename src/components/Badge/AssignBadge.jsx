import React, { useState, useEffect } from 'react';
import {
  Button,
  Form,
  FormGroup,
  Label,
  FormText,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  Alert,
  UncontrolledTooltip,
} from 'reactstrap';
import { connect } from 'react-redux';
import AssignBadgePopup from './AssignBadgePopup';
import {
  getFirstName,
  getLastName,
  assignBadges,
  clearNameAndSelected,
  closeAlert,
  validateBadges,
} from '../../actions/badgeManagement';
import { getAllUserProfile } from '../../actions/userManagement';
import Autosuggest from 'react-autosuggest';
import { boxStyle } from 'styles';

const AssignBadge = props => {
  const [isOpen, setOpen] = useState(false);
  const [firstSuggestions, setFirstSuggestions] = useState([]);
  const [lastSuggestions, setLastSuggestions] = useState([]);

  useEffect(() => {
    props.getAllUserProfile();
    props.clearNameAndSelected();
    props.closeAlert();
  }, []);

  const activeUsers = props.allUserProfiles.filter(profile => profile.isActive === true);

  const escapeRegexCharacters = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const getSuggestions = value => {
    const escapedValue = escapeRegexCharacters(value.trim());
    const regex = new RegExp('^' + escapedValue, 'i');
    return activeUsers.filter(user => regex.test(user.firstName) || regex.test(user.lastName));
  };

  const getSuggestionFirst = suggestion => suggestion.firstName;

  const getSuggestionLast = suggestion => suggestion.lastName;

  const renderSuggestion = suggestion => {
    return (
      <div>
        {suggestion.firstName} {suggestion.lastName}
      </div>
    );
  };

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

  const toggle = () => {
    const { firstName, lastName, selectedBadges } = props;
    if (isOpen) {
      props.assignBadges(firstName, lastName, selectedBadges);
      setOpen(isOpen => !isOpen);
      props.clearNameAndSelected();
    } else {
      if (firstName && lastName) {
        setOpen(isOpen => !isOpen);
      } else {
        props.validateBadges(firstName, lastName);
      }
    }
  };

  const FirstInputProps = {
    autofocus: 'autofocus',
    placeholder: ' first name',
    value: props.firstName,
    onChange: onFirstChange,
  };
  const LastInputProps = {
    placeholder: ' last name',
    value: props.lastName,
    onChange: onLastChange,
  };

  return (
    <Form
      style={{
        margin: 20,
      }}
    >
      <div className="assign-badge-margin-top" style={{ display: 'flex', alignItems: 'center' }}>
        <Label
          style={{
            fontWeight: 'bold',
            marginLeft: '15px',
            marginRight: '2px',
            paddingRight: '2px',
          }}
        >
          Search by Name
        </Label>
        <i className="fa fa-info-circle" id="NameInfo" style={{ marginRight: '5px' }} />
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '5px' }}>
          <UncontrolledTooltip
            placement="right"
            target="NameInfo"
            style={{
              backgroundColor: '#666',
              color: '#fff',
              paddingLeft: '2px',
              marginLeft: '2px',
            }}
          >
            <p className="badge_info_icon_text">
              Really, you&apos;re not sure what &quot;name&quot; means? Start typing a first or last
              name and a list of the active members (matching what you type) will be auto generated.
              Then you........ CHOOSE ONE!
            </p>
            <p className="badge_info_icon_text">
              Yep, that&apos;s it. Next you click &quot;Assign Badge&quot; and.... choose one or
              multiple badges! Click &quot;confirm&quot; then &quot;submit&quot; and those badges
              will show up as part of that person&apos;s earned badges. You can even assign a person
              multiple of the same badge(s) by repeating this process and choosing the same badge as
              many times as you want them to earn it.
            </p>
          </UncontrolledTooltip>
          <div style={{ marginRight: '5px' }}>
            <Autosuggest
              suggestions={firstSuggestions}
              onSuggestionsFetchRequested={onFirstSuggestionsFetchRequested}
              onSuggestionsClearRequested={onFirstSuggestionsClearRequested}
              onSuggestionSelected={onFirstSuggestionSelected}
              getSuggestionValue={getSuggestionFirst}
              renderSuggestion={renderSuggestion}
              inputProps={FirstInputProps}
              style={{ marginLeft: '5px', marginRight: '5px' }}
            />
          </div>
          <div style={{ marginLeft: '5px' }}>
            <Autosuggest
              suggestions={lastSuggestions}
              onSuggestionsFetchRequested={onLastSuggestionsFetchRequested}
              onSuggestionsClearRequested={onLastSuggestionsClearRequested}
              onSuggestionSelected={onLastSuggestionSelected}
              getSuggestionValue={getSuggestionLast}
              renderSuggestion={renderSuggestion}
              inputProps={LastInputProps}
              style={{ marginLeft: '5px' }}
            />
          </div>
        </div>
      </div>
      <FormGroup className="assign-badge-margin-top">
        <Button
          className="btn--dark-sea-green"
          onClick={toggle}
          style={{ ...boxStyle, margin: 20 }}
        >
          Assign Badge
        </Button>
        <Modal isOpen={isOpen} toggle={toggle} backdrop="static">
          <ModalHeader toggle={toggle}>Assign Badge</ModalHeader>
          <ModalBody>
            <AssignBadgePopup allBadgeData={props.allBadgeData} toggle={toggle} />
          </ModalBody>
        </Modal>
        <FormText color="muted">Please select a badge from the badge list.</FormText>
        <Alert color="dark" className="assign-badge-margin-top">
          {' '}
          {props.selectedBadges ? props.selectedBadges.length : '0'} bagdes selected
        </Alert>
      </FormGroup>
      {/* <Button size="lg" color="info" className="assign-badge-margin-top" onClick={clickSubmit}>Submit</Button> */}
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
  allUserProfiles: state.allUserProfiles.userProfiles,
});

const mapDispatchToProps = dispatch => ({
  getFirstName: firstName => dispatch(getFirstName(firstName)),
  getLastName: lastName => dispatch(getLastName(lastName)),
  getAllUserProfile: () => dispatch(getAllUserProfile()),
  clearNameAndSelected: () => dispatch(clearNameAndSelected()),
  assignBadges: (fisrtName, lastName, selectedBadge) =>
    dispatch(assignBadges(fisrtName, lastName, selectedBadge)),
  validateBadges: (firstName, lastName) => dispatch(validateBadges(firstName, lastName)),
  closeAlert: () => dispatch(closeAlert()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AssignBadge);
