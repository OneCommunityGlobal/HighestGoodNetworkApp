import { useState, useEffect } from 'react';
import {
  Button,
  Form,
  FormGroup,
  Label,
  FormText,
  Modal,
  ModalHeader,
  ModalBody,
  Alert,
  UncontrolledTooltip,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from 'reactstrap';
import { connect } from 'react-redux';
import Autosuggest from 'react-autosuggest';
import { boxStyle, boxStyleDark } from 'styles';
import { searchWithAccent } from 'utils/search';
import AssignBadgePopup from './AssignBadgePopup';
import {
  getFirstName,
  getLastName,
  assignBadges,
  assignBadgesByUserID,
  clearNameAndSelected,
  closeAlert,
  validateBadges,
  getUserId,
} from '../../actions/badgeManagement';
import { getAllUserProfile } from '../../actions/userManagement';
import '../Header/DarkMode.css';
import './AssignBadgeStyle.css';

function AssignBadge(props) {
  const { darkMode } = props;
  const [isOpen, setOpen] = useState(false);
  const [firstSuggestions, setFirstSuggestions] = useState([]);
  const [lastSuggestions, setLastSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    props.getAllUserProfile();
    props.clearNameAndSelected();
    props.closeAlert();
  }, []);

  const activeUsers = props.allUserProfiles.filter(profile => profile.isActive);

  const getSuggestions = value => {
    setLoading(true);
    const suggestions = activeUsers.filter(
      user =>
        searchWithAccent(user.firstName, value.trim()) ||
        searchWithAccent(user.lastName, value.trim())
    );
    setLoading(false);
    return suggestions;
  };

  const getSuggestionFirst = suggestion => suggestion.firstName;
  const getSuggestionLast = suggestion => suggestion.lastName;

  const renderSuggestion = suggestion => (
    <div className="react-autosuggest__suggestion">
      {suggestion.firstName} {suggestion.lastName}
    </div>
  );

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
    props.getUserId(suggestion._id);
  };

  const onLastSuggestionsFetchRequested = ({ value }) => {
    setLastSuggestions(getSuggestions(value));
  };

  const onLastSuggestionsClearRequested = () => {
    setLastSuggestions([]);
  };

  const onLastSuggestionSelected = (event, { suggestion }) => {
    props.getFirstName(suggestion.firstName);
    props.getUserId(suggestion._id);
  };

  const toggle = (didSubmit = false) => {
    const { selectedBadges, firstName, lastName, userId } = props;
    if (isOpen && didSubmit === true) {
      if (userId) {
        props.assignBadgesByUserID(userId, selectedBadges);
      } else {
        props.assignBadges(firstName, lastName, selectedBadges);
      }
      setOpen(prevIsOpen => !prevIsOpen);
      props.clearNameAndSelected();
    } else if (firstName && lastName) {
      setOpen(prevIsOpen => !prevIsOpen);
    } else {
      props.validateBadges(firstName, lastName);
    }
  };

  const submit = () => {
    toggle(true);
  };

  const clearFirstInput = () => {
    props.getFirstName('');
  };

  const clearLastInput = () => {
    props.getLastName('');
  };

  const FirstInputProps = {
    placeholder: 'First name',
    value: props.firstName,
    onChange: onFirstChange,
    className: 'autosuggest-input',
    autoFocus: true,
  };

  const LastInputProps = {
    placeholder: 'Last name',
    value: props.lastName,
    onChange: onLastChange,
    className: 'autosuggest-input',
  };

  return (
    <Form className={darkMode ? 'bg-yinmn-blue text-light' : ''} style={{ padding: 20 }}>
      <div className="assign-badge-margin-top" style={{ display: 'flex', alignItems: 'center' }}>
        <Label className={darkMode ? 'text-light' : ''} style={{ fontWeight: 'bold', marginLeft: '15px', marginRight: '2px', paddingRight: '2px' }}>
          Search by Name
        </Label>
        <i className="fa fa-info-circle" id="NameInfo" data-testid="NameInfo" style={{ marginRight: '5px' }} />
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '5px' }}>
          <UncontrolledTooltip placement="right" target="NameInfo" style={{ backgroundColor: '#666', color: '#fff', paddingLeft: '2px', marginLeft: '2px' }}>
            <p className="badge_info_icon_text">
              Really, you&apos;re not sure what &quot;name&quot; means? Start typing a first or last name and a list of the active members (matching what you type) will be auto generated. Then you........ CHOOSE ONE!
            </p>
            <p className="badge_info_icon_text">
              Yep, that&apos;s it. Next you click &quot;Assign Badge&quot; and.... choose one or multiple badges! Click &quot;confirm&quot; then &quot;submit&quot; and those badges will show up as part of that person&apos;s earned badges. You can even assign a person multiple of the same badge(s) by repeating this process and choosing the same badge as many times as you want them to earn it.
            </p>
          </UncontrolledTooltip>
          <div id="suggestion-box" style={{ display: 'flex', flexDirection: 'row' }}>
            <div className="autosuggest-container">
              <Autosuggest
                suggestions={firstSuggestions}
                onSuggestionsFetchRequested={onFirstSuggestionsFetchRequested}
                onSuggestionsClearRequested={onFirstSuggestionsClearRequested}
                onSuggestionSelected={onFirstSuggestionSelected}
                getSuggestionValue={getSuggestionFirst}
                renderSuggestion={renderSuggestion}
                inputProps={FirstInputProps}
              />
              <button className="clear-button" onClick={clearFirstInput}>&times;</button>
            </div>
            <div className="autosuggest-container" style={{ marginLeft: '5px' }}>
              <Autosuggest
                suggestions={lastSuggestions}
                onSuggestionsFetchRequested={onLastSuggestionsFetchRequested}
                onSuggestionsClearRequested={onLastSuggestionsClearRequested}
                onSuggestionSelected={onLastSuggestionSelected}
                getSuggestionValue={getSuggestionLast}
                renderSuggestion={renderSuggestion}
                inputProps={LastInputProps}
              />
              <button className="clear-button" onClick={clearLastInput}>&times;</button>
            </div>
          </div>
        </div>
      </div>
      <FormGroup className="assign-badge-margin-top">
        <Button className="btn--dark-sea-green" onClick={toggle} style={darkMode ? { ...boxStyleDark, margin: 20 } : { ...boxStyle, margin: 20 }}>
          Assign Badge
        </Button>
        <Modal isOpen={isOpen} toggle={toggle} backdrop="static" className={darkMode ? 'text-light dark-mode' : ''}>
          <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={toggle}>
            Assign Badge
          </ModalHeader>
          <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
            <AssignBadgePopup
              allBadgeData={props.allBadgeData}
              submit={submit}
              selectedBadges={props.selectedBadges}
            />
          </ModalBody>
        </Modal>
        <FormText color={darkMode ? 'white' : 'muted'}>
          Please select a badge from the badge list.
        </FormText>
        <Alert color="dark" className="assign-badge-margin-top">
          {' '}
          {props.selectedBadges ? props.selectedBadges.length : '0'} badges selected
        </Alert>
      </FormGroup>
    </Form>
  );
}

const mapStateToProps = state => ({
  selectedBadges: state.badge.selectedBadges,
  firstName: state.badge.firstName,
  lastName: state.badge.lastName,
  userId: state.badge.userId,
  message: state.badge.message,
  alertVisible: state.badge.alertVisible,
  color: state.badge.color,
  allUserProfiles: state.allUserProfiles.userProfiles,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  getFirstName: firstName => dispatch(getFirstName(firstName)),
  getLastName: lastName => dispatch(getLastName(lastName)),
  getUserId: userId => dispatch(getUserId(userId)),
  getAllUserProfile: () => dispatch(getAllUserProfile()),
  clearNameAndSelected: () => dispatch(clearNameAndSelected()),
  assignBadgesByUserID: (id, selectedBadge) => dispatch(assignBadgesByUserID(id, selectedBadge)),
  assignBadges: (firstName, lastName, selectedBadge) => dispatch(assignBadges(firstName, lastName, selectedBadge)),
  validateBadges: (firstName, lastName) => dispatch(validateBadges(firstName, lastName)),
  closeAlert: () => dispatch(closeAlert()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AssignBadge);
