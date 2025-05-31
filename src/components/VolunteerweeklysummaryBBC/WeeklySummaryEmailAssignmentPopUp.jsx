import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getAllWeeklySummaryEmailAssignments,
  setWeeklySummaryEmailAssignment,
  deleteWeeklySummaryEmailAssignment
} from '../../actions/weeklySummaryEmailBCCAction';

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
  Container
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { boxStyle, boxStyleDark } from 'styles';
import { getAllUserProfiles } from '../../actions/projectMembers';



const WeeklySummaryEmailAssignmentPopUp = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const [searchWord, setSearchWord] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addUser, setAddUser] = useState({});

  // const allUsers = useSelector(state => state.projectMembers?.users) || [];
  const allUsers = useSelector(state => state.projectMembers?.foundUsers) || [];


  const weeklySummaryEmailAssignments = useSelector(state => state.weeklySummaryEmailAssignment?.emailAssignment) || [];

  const activeUsers = allUsers.filter(user => user?.isActive);

  const closePopup = () => {
    props.onClose();
  };

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);

  const filteredUsers = activeUsers.filter(user => {
    if (!user) return false;
    if (searchWord.includes(' ')) {
      const [searchWordFirst, searchWordLast] = searchWord.split(' ');
      return (
        user.firstName?.toLowerCase().includes(searchWordFirst?.toLowerCase()) &&
        user.lastName?.toLowerCase().includes(searchWordLast?.toLowerCase())
      );
    } else {
      return (
        user.firstName?.toLowerCase().includes(searchWord.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchWord.toLowerCase())
      );
    }
  });

  const handleAddBCC = (e) => {
    e.preventDefault();
    if (addUser?.email) {
      dispatch(setWeeklySummaryEmailAssignment(addUser.email));
    }
  };

  const handleAssignmentDelete = (id) => {
    dispatch(deleteWeeklySummaryEmailAssignment(id));
  };

  useEffect(() => {
    dispatch(getAllWeeklySummaryEmailAssignments());
    dispatch(getAllUserProfiles());
  }, [dispatch]);

  return (
    <Modal isOpen={props.isOpen} toggle={closePopup} size='lg' className={darkMode ? 'dark-mode text-light' : ''}>
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
            />
            <Button color="primary" type="button" onClick={handleAddBCC}>
              Add
            </Button>
          </InputGroup>

          {dropdownOpen && (
            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
              <DropdownToggle tag="div" data-toggle="dropdown" aria-expanded={dropdownOpen} />
              <DropdownMenu
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
                  >
                    {user.firstName} {user.lastName}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}

          <table className={`table table-bordered table-responsive-lg mt-3 ${darkMode ? 'text-light' : ''}`}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Email</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {weeklySummaryEmailAssignments.length > 0 ? (
                weeklySummaryEmailAssignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td>
                      <span className={assignment.assignedTo?.isActive ? "isActive" : "isNotActive"}>
                        <i className="fa fa-circle" aria-hidden="true" />
                      </span>
                    </td>
                    <td>
                      {assignment.assignedTo?.firstName} {assignment.assignedTo?.lastName} ({assignment.assignedTo?.role})
                    </td>
                    <td style={{ overflow: 'auto' }}>
                      {assignment.email}
                    </td>
                    <td className='d-flex justify-content-center align-items-center'>
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
                  <td colSpan="4" className="text-center">No assignments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Container>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button
          color="secondary"
          onClick={closePopup}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

export default WeeklySummaryEmailAssignmentPopUp;
