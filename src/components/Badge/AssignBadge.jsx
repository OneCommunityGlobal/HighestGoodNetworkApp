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
  Table,
} from 'reactstrap';
import { connect, useSelector } from 'react-redux';
import { boxStyle, boxStyleDark } from 'styles';
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
  const darkMode = useSelector(state => state.theme.darkMode);
  const [isOpen, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    props.getAllUserProfile();
    props.clearNameAndSelected();
    props.closeAlert();
  }, []);

  useEffect(() => {
    if (fullName) {
      setFilteredUsers(
        props.allUserProfiles.filter(user => {
          const userFullName = `${user.firstName} ${user.lastName}`.toLowerCase();
          return userFullName.includes(fullName.toLowerCase());
        }),
      );
    } else {
      setFilteredUsers([]);
    }
  }, [fullName, props.allUserProfiles]);

  const handleFullNameChange = event => {
    setFullName(event.target.value);
  };

  const handleUserSelect = user => {
    if (selectedUserId === user._id) {
      setSelectedUserId(null);
      props.clearNameAndSelected();
    } else {
      setSelectedUserId(user._id);
      props.getFirstName(user.firstName);
      props.getLastName(user.lastName);
      props.getUserId(user._id);
    }
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

  return (
    <Form
      className={`container-fluid ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}
      style={{ padding: 20 }}
    >
      <div className="row align-items-center mb-3">
        <Label
          className={`col-12 col-md-2 ${darkMode ? 'text-light' : ''}`}
          style={{ fontWeight: 'bold', marginBottom: 10 }}
        >
          Search by Full Name
          <i
            className="fa fa-info-circle ml-2"
            id="NameInfo"
            data-testid="NameInfo"
            style={{ cursor: 'pointer' }}
          />
          <UncontrolledTooltip
            placement="right"
            target="NameInfo"
            style={{
              backgroundColor: '#666',
              color: '#fff',
            }}
          >
            <p className="badge_info_icon_text">
              Start typing a name and a list of the active members (matching what you type) will be
              auto-generated. Then you........ CHOOSE ONE!
            </p>
            <p className="badge_info_icon_text">
              After selecting a person, click &quot;Assign Badge&quot; and choose one or multiple
              badges. Click &quot;confirm&quot; then &quot;submit&quot; and those badges will be
              assigned.
            </p>
          </UncontrolledTooltip>
        </Label>
        <div className="col-12 col-md-8 mb-2">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={handleFullNameChange}
            className="form-control"
          />
        </div>
      </div>
      {filteredUsers.length > 0 && (
        <div className="table-responsive mb-3">
          <Table
            className={`table table-bordered ${
              darkMode ? 'dark-mode bg-yinmn-blue text-light' : ''
            }`}
          >
            <thead>
              <tr className={darkMode ? 'bg-space-cadet text-light' : 'table-primary'}>
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
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedUserId === user._id ? '#e9ecef' : '',
                  }}
                  className={darkMode && selectedUserId === user._id ? 'bg-dark text-light' : ''}
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
      <FormGroup className="mb-3">
        <Button
          className="btn--dark-sea-green"
          onClick={toggle}
          style={darkMode ? { ...boxStyleDark, margin: 20 } : { ...boxStyle, margin: 20 }}
          disabled={!fullName}
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
        <Alert color="dark" className="mt-3">
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
  assignBadges: (firstName, lastName, selectedBadge) =>
    dispatch(assignBadges(firstName, lastName, selectedBadge)),
  validateBadges: (firstName, lastName) => dispatch(validateBadges(firstName, lastName)),
  closeAlert: () => dispatch(closeAlert()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AssignBadge);