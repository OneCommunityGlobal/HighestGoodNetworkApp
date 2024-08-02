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
  Table
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

function AssignBadge(props) {
  const { darkMode } = props;
  const [isOpen, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    props.getAllUserProfile();
    props.clearNameAndSelected();
    props.closeAlert();
  }, []);

 

  const toggle = (didSubmit = false) => {
    const { selectedBadges, firstName, lastName, userId } = props;
    if (isOpen && didSubmit === true) {
      // If user is selected from dropdown suggestions
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

  const handleFirstNameChange = event => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = event => {
    setLastName(event.target.value);
  };

  const submit = () => {
    toggle(true);
  };

  const FirstInputProps = {
    placeholder: ' first name',
    value: props.firstName,
    onChange: onFirstChange,
    autoFocus: true,
  };
  const LastInputProps = {
    placeholder: ' last name',
    value: props.lastName,
    onChange: onLastChange,
  };

  return (
    <Form
      className={darkMode ? 'bg-yinmn-blue text-light' : ''}
      style={{
        padding: 20,
      }}
    >
      <div className="assign-badge-margin-top" style={{ display: 'flex', alignItems: 'center' }}>
        <Label
          className={darkMode ? 'text-light' : ''}
          style={{
            fontWeight: 'bold',
            marginLeft: '15px',
            marginRight: '2px',
            paddingRight: '2px',
          }}
        >
          Search by Name
        </Label>
        <i
          className="fa fa-info-circle"
          id="NameInfo"
          data-testid="NameInfo"
          style={{ marginRight: '5px' }}
        />
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
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={handleFirstNameChange}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={handleLastNameChange}
            style={{ marginRight: '10px', padding: '5px' }}
          />
        </div>
      </div>
      {filteredUsers.length > 0 && (
        <div className="table-responsive mb-3">
          <Table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Select</th>
                <th>First Name</th>
                <th>Last Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  style={{ cursor: 'pointer', backgroundColor: selectedUserId === user._id ? '#e9ecef' : '' }}
                >
                  <td>
                    <input
                      type="radio"
                      name="user"
                      checked={selectedUserId === user._id}
                      readOnly
                    />
                  </td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      <FormGroup className="assign-badge-margin-top">
        <Button
          className="btn--dark-sea-green"
          onClick={toggle}
          style={darkMode ? { ...boxStyleDark, margin: 20 } : { ...boxStyle, margin: 20 }}
        >
          Assign Badge
        </Button>
        <Modal
          isOpen={isOpen}
          toggle={toggle}
          backdrop="static"
          className={darkMode ? 'text-light dark-mode' : ''}
        >
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
      {/* <Button size="lg" color="info" className="assign-badge-margin-top" onClick={clickSubmit}>Submit</Button> */}
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
  assignBadges: (firstName, lastName, selectedBadge) =>
    dispatch(assignBadges(firstName, lastName, selectedBadge)),
  validateBadges: (firstName, lastName) => dispatch(validateBadges(firstName, lastName)),
  closeAlert: () => dispatch(closeAlert()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AssignBadge);
