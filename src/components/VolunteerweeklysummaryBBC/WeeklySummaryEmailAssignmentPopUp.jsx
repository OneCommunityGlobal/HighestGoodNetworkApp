import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  InputGroup,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Container,
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPencilAlt, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { boxStyle, boxStyleDark } from '~/styles';
import {
  getAllWeeklySummaryEmailAssignments,
  setWeeklySummaryEmailAssignment,
  deleteWeeklySummaryEmailAssignment,
  updateWeeklySummaryEmailAssignment,
} from '../../actions/weeklySummaryEmailBCCAction';
import { getAllUserProfiles } from '../../actions/projectMembers';
import '../Reports/TeamReport/TeamReport.module.css'; // For css only

const WeeklySummaryEmailAssignmentPopUp = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const [searchWord, setSearchWord] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addUser, setAddUser] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editingEmail, setEditingEmail] = useState('');

  // const allUsers = useSelector(state => state.projectMembers?.users) || [];
  const allUsers = useSelector(state => state.projectMembers?.foundUsers) || [];

  const weeklySummaryEmailAssignments =
    useSelector(state => state.weeklySummaryEmailAssignment?.emailAssignment) || [];

  const activeUsers = allUsers.filter(user => user?.isActive);

  const closePopup = () => {
    props.onClose();
  };

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);

  const filteredUsers = activeUsers.filter(user => {
    if (!user) return false;

    // Filter out users who are already added
    const isAlreadyAdded = weeklySummaryEmailAssignments.some(
      assignment => assignment.email === user.email,
    );
    if (isAlreadyAdded) return false;

    if (searchWord.includes(' ')) {
      const [searchWordFirst, searchWordLast] = searchWord.split(' ');
      return (
        user.firstName?.toLowerCase().includes(searchWordFirst?.toLowerCase()) &&
        user.lastName?.toLowerCase().includes(searchWordLast?.toLowerCase())
      );
    }
    return (
      user.firstName?.toLowerCase().includes(searchWord.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchWord.toLowerCase())
    );
  });

  const handleAddBCC = e => {
    e.preventDefault();
    if (addUser?.email) {
      dispatch(setWeeklySummaryEmailAssignment(addUser.email));
    }
  };

  const handleAssignmentDelete = id => {
    dispatch(deleteWeeklySummaryEmailAssignment(id));
  };

  const handleEditStart = (id, email) => {
    setEditingId(id);
    setEditingEmail(email);
  };

  const handleEditSave = id => {
    if (editingEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingEmail)) {
      dispatch(updateWeeklySummaryEmailAssignment(id, editingEmail));
      setEditingId(null);
      setEditingEmail('');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingEmail('');
  };

  useEffect(() => {
    dispatch(getAllWeeklySummaryEmailAssignments());
    dispatch(getAllUserProfiles());
  }, [dispatch]);

  return (
    <Modal
      isOpen={props.isOpen}
      toggle={closePopup}
      size="lg"
      className={darkMode ? 'dark-mode text-light' : ''}
    >
      <ModalHeader toggle={closePopup} className={darkMode ? 'bg-space-cadet' : ''}>
        Set Weekly Summary Email Recipients
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Container>
          <InputGroup>
            <Input
              type="text"
              placeholder="Type to filter..."
              value={searchWord}
              onChange={e => {
                setSearchWord(e.target.value);
                setDropdownOpen(true);
              }}
              className={darkMode ? 'bg-dark text-light' : ''}
            />
            <Button color="primary" type="button" onClick={handleAddBCC}>
              Add
            </Button>
          </InputGroup>

          {dropdownOpen && (
            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
              <DropdownToggle tag="div" data-toggle="dropdown" aria-expanded={dropdownOpen} />
              <DropdownMenu
                className={darkMode ? 'bg-dark' : ''}
                style={{
                  position: 'absolute',
                  zIndex: 1000,
                  width: '100%',
                  maxHeight: '300px',
                  overflow: 'auto',
                }}
              >
                {filteredUsers.map((user, index) => (
                  <DropdownItem
                    key={user._id || index}
                    onClick={() => {
                      setAddUser(user);
                      setSearchWord(`${user.firstName} ${user.lastName}`);
                    }}
                    className={darkMode ? 'text-light table-hover-dark' : ''}
                  >
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                    >
                      <span>
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-muted">({user.email})</span>
                    </div>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}

          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table
              className={`table table-bordered table-responsive-lg mt-3 ${
                darkMode ? 'text-light' : 'table-hover'
              }`}
            >
              <thead>
                <tr className={darkMode ? 'bg-space-cadet' : ''}>
                  <th>Status</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {weeklySummaryEmailAssignments.length > 0 ? (
                  weeklySummaryEmailAssignments.map(assignment => (
                    <tr key={assignment._id}>
                      <td>
                        <span
                          className={assignment.assignedTo?.isActive ? 'isActive' : 'isNotActive'}
                        >
                          <i className="fa fa-circle" aria-hidden="true" />
                        </span>
                      </td>
                      <td>
                        {assignment.assignedTo?.firstName} {assignment.assignedTo?.lastName} (
                        {assignment.assignedTo?.role})
                      </td>
                      <td style={{ overflow: 'auto' }}>
                        {editingId === assignment._id ? (
                          <Input
                            type="email"
                            value={editingEmail}
                            onChange={e => setEditingEmail(e.target.value)}
                            style={{ width: '100%' }}
                            className={darkMode ? 'bg-dark text-light' : ''}
                          />
                        ) : (
                          assignment.email
                        )}
                      </td>
                      <td className="d-flex justify-content-center align-items-center">
                        {editingId === assignment._id ? (
                          <>
                            <Button
                              color="success"
                              className="mr-2"
                              onClick={() => handleEditSave(assignment._id)}
                              style={darkMode ? boxStyleDark : boxStyle}
                            >
                              <FontAwesomeIcon icon={faCheck} />
                            </Button>
                            <Button
                              color="secondary"
                              className="mr-2"
                              onClick={handleEditCancel}
                              style={darkMode ? boxStyleDark : boxStyle}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </Button>
                          </>
                        ) : (
                          <Button
                            color="primary"
                            className="mr-2"
                            onClick={() => handleEditStart(assignment._id, assignment.email)}
                            style={darkMode ? boxStyleDark : boxStyle}
                          >
                            <FontAwesomeIcon icon={faPencilAlt} />
                          </Button>
                        )}
                        <Button
                          color="danger"
                          onClick={() => handleAssignmentDelete(assignment._id)}
                          style={darkMode ? boxStyleDark : boxStyle}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No assignments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Container>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

WeeklySummaryEmailAssignmentPopUp.displayName = 'WeeklySummaryEmailAssignmentPopUp';

export default WeeklySummaryEmailAssignmentPopUp;
