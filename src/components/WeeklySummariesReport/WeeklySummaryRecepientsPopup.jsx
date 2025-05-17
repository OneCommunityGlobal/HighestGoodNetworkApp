import React, { useState, useEffect } from 'react';
import { boxStyle, boxStyleDark } from 'styles';
import '../Header/DarkMode.css';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Container, Alert } from 'reactstrap';
import { toast } from 'react-toastify';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import MembersAutoComplete from '../Teams/MembersAutoComplete';
import {
  getSummaryRecipients,
  addSummaryRecipient,
  deleteSummaryRecipient,
} from '../../actions/weeklySummariesReportRecepients';

// const membersList = [{ id: 1, firstName: "onecommunityglobal", lastName: '', email: "onecommunityglobal@gmail.com" },
// { id: 2, firstName: "onecommunityhospitality", lastName: '', email: "onecommunityhospitality@gmail.com" }]

const WeeklySummaryRecipientsPopup = React.memo(props => {
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
        if (!result === 200) {
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
      if (!result === 200) {
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
        autoFocus={false}
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
        <ModalBody style={{ textAlign: 'center' }} className={darkMode ? 'bg-yinmn-blue' : ''}>
          <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
            <MembersAutoComplete
              summaries={summaries}
              onAddUser={selectUser}
              searchText={searchText}
              setSearchText={setSearchText}
              context="WeeklySummary"
            />
            <Button color="primary" onClick={addUserFn} style={darkMode ? boxStyleDark : boxStyle}>
              Add
            </Button>
          </div>
          {!isValidUser && <Alert color="danger">Please choose a valid user.</Alert>}
          <table
            className={`table table-bordered table-responsive-sm ${darkMode ? 'text-light' : ''}`}
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Recipient Name</th>
                <th style={{ cursor: 'pointer' }}>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {recipients?.length > 0 &&
                recipients?.toSorted().map((user, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <tr key={`recipient_name_${index}`}>
                    <td>{index + 1}</td>
                    <td>{`${user.firstName} ${user.lastName}`}</td>
                    <td>
                      {moment(user.permissionGrantedToGetWeeklySummaryReport).format('MMM-DD-YY')}
                    </td>
                    <td>
                      <Button
                        color="danger"
                        onClick={() => {
                          deleteRecipient(`${user._id}`);
                        }}
                        style={darkMode ? boxStyleDark : boxStyle}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
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
});
export default WeeklySummaryRecipientsPopup;
