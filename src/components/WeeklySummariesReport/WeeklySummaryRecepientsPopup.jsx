import React, { useState, useEffect } from 'react';
import { boxStyle, boxStyleDark } from '~/styles';
import '../Header/index.css';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Container,
  Alert,
  Input,
  InputGroup,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { toast } from 'react-toastify';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import {
  getSummaryRecipients,
  addSummaryRecipient,
  deleteSummaryRecipient,
} from '../../actions/weeklySummariesReportRecepients';
import { getAllUserProfile } from '~/actions/userManagement';

// const membersList = [{ id: 1, firstName: "onecommunityglobal", lastName: '', email: "onecommunityglobal@gmail.com" },
// { id: 2, firstName: "onecommunityhospitality", lastName: '', email: "onecommunityhospitality@gmail.com" }]

const WeeklySummaryRecipientsPopupComponent = props => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const dispatch = useDispatch();
  const { open, onClose, summaries, password, authEmailWeeklySummaryRecipient } = props;

  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [isValidUser, setIsValidUser] = useState(true);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // The below states keeps a track of the list of Weekly Summary Report Recipients - sucheta
  const [recipients, setRecipients] = useState([]);
  const [updatedRecipients, setUpdatedRecipients] = useState(false);

  const allUserProfiles = useSelector(state => state.allUserProfiles?.userProfiles) || [];

  const allUsers = useSelector(state => state.allUserProfiles?.userProfiles) || [];
  const activeUsers = allUsers.filter(user => user.isActive === true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredUsers = activeUsers.filter(user => {
    if (searchText.includes(' ')) {
      const [first, last] = searchText.split(' ');
      return (
        user.firstName.toLowerCase().includes(first.toLowerCase()) &&
        user.lastName.toLowerCase().includes(last.toLowerCase())
      );
    }
    return (
      user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  useEffect(() => {
    dispatch(getAllUserProfile());
  }, []);

  useEffect(() => {
    let isMounted = true; // Track if component is mounted

    const getRecipients = async () => {
      try {
        const data = await dispatch(getSummaryRecipients());
        if (isMounted) {
          setRecipients([...data]); // Only update state if still mounted
        }
        return data;
      } catch (err) {
        if (isMounted) {
          return null;
        }
        return null;
      }
    };

    getRecipients();

    return () => {
      isMounted = false; // Set to false on unmount
    };
  }, [open, updatedRecipients]);

  const closePopup = () => {
    onClose();
    setUpdatedRecipients(false);
  };

  const selectUser = user => {
    setSelectedUser(user);
    setIsValidUser(true);
  };
  // Adds new recipient of the Weekly Summary Report
  const addUserFn = async () => {
    if (selectedUser && !recipients?.some(x => x._id === selectedUser?._id)) {
      try {
        const result = await dispatch(addSummaryRecipient(selectedUser._id));
        if (result !== 200) {
          toast.error('Did not find recipient');
          return;
        }
        toast.success('Added new recipient.');
        setRecipients(prevState => [...prevState, selectedUser]);
        setUpdatedRecipients(prevState => !prevState);
        setSearchText('');
      } catch (error) {
        toast.error('Could not add recipient');
      }
    } else {
      setIsValidUser(false);
    }
  };
  // Function to delete recipient
  const deleteRecipient = async userId => {
    try {
      const result = await dispatch(deleteSummaryRecipient(userId));
      if (result !== 200) {
        toast.error('Could not delete recipient at this time! Please try again');
      } else {
        toast.success('Deleted successful!');
        setUpdatedRecipients(prevState => !prevState);
      }
    } catch (err) {
      toast.error('Could not delete recipient at this time! Please try again');
    }
  };

  // Function open info modal
  const openInfo = () => {
    setInfoModalOpen(prev => !prev);
    setShowPassword(false);
  };

  return (
    <Container fluid>
      <Modal
        isOpen={open}
        toggle={closePopup}
        size="lg"
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader toggle={closePopup}>
          Recipients of Weekly summaries
          <FontAwesomeIcon
            icon={faInfoCircle}
            className="mx-2"
            style={{ color: '#74C0FC', cursor: 'pointer' }}
            onClick={openInfo}
          />
          {infoModalOpen && (
            <div className="mt-3">
              <span style={{ fontSize: '.8em' }}>
                Authoried User: {authEmailWeeklySummaryRecipient}
              </span>
              <section>
                <span className="mr-3" style={{ fontSize: '.8em' }}>
                  Password: {showPassword ? password : ''}
                </span>
                {!showPassword && (
                  <Button
                    onClick={() => setShowPassword(true)}
                    style={darkMode ? boxStyleDark : boxStyle}
                  >
                    Reveal{' '}
                  </Button>
                )}
                {showPassword && (
                  <Button
                    onClick={() => setShowPassword(false)}
                    style={darkMode ? boxStyleDark : boxStyle}
                  >
                    Hide
                  </Button>
                )}
              </section>
            </div>
          )}
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <div className="input-group-prepend" style={{ width: '100%', marginBottom: '10px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <InputGroup style={{ width: '100%' }}>
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchText}
                  onChange={e => {
                    setSearchText(e.target.value);
                    setDropdownOpen(true);
                    setSelectedUser(undefined);
                  }}
                />
                <Button
                  color="primary"
                  onClick={addUserFn}
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  Add
                </Button>
              </InputGroup>

              {dropdownOpen && filteredUsers.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    zIndex: 1050,
                    backgroundColor: darkMode ? '#1a2b4a' : 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  {filteredUsers.slice(0, 10).map(user => (
                    <DropdownItem
                      key={user._id}
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchText(`${user.firstName} ${user.lastName}`);
                        setDropdownOpen(false);
                        setIsValidUser(true);
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>
                          {user.firstName} {user.lastName}
                        </span>
                        <small className="text-muted">{user.email}</small>
                      </div>
                    </DropdownItem>
                  ))}
                </div>
              )}
            </div>
          </div>
          {!isValidUser && <Alert color="danger">Please choose a valid user.</Alert>}
          <table
            className={`table table-bordered table-responsive-sm ${darkMode ? 'text-light' : ''}`}
          >
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Email</th>
                <th>Date Added</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {recipients?.length > 0 &&
                recipients?.toSorted().map((user, index) => {
                  return (
                    <tr key={`recipient_name_${index}`}>
                      <td>
                        <span className={user?.isActive ? 'isActive' : 'isNotActive'}>
                          <i className="fa fa-circle" aria-hidden="true" />
                        </span>
                      </td>
                      <td>{`${user.firstName} ${user.lastName}`}</td>
                      <td>{user.email}</td>
                      <td>
                        {moment(user.permissionGrantedToGetWeeklySummaryReport).format('MMM-DD-YY')}
                      </td>
                      <td className="d-flex justify-content-center align-items-center">
                        <Button
                          color="danger"
                          onClick={() => deleteRecipient(`${user._id}`)}
                          style={darkMode ? boxStyleDark : boxStyle}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button color="secondary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};
const WeeklySummaryRecipientsPopup = React.memo(WeeklySummaryRecipientsPopupComponent);
WeeklySummaryRecipientsPopup.displayName = 'WeeklySummaryRecipientsPopup';
export default WeeklySummaryRecipientsPopup;
