import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addCCEmail, deleteCCEmail } from '~/actions/blueSquareEmailCCAction';
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
import { boxStyle, boxStyleDark } from '~/styles';
import { getAllUserProfile } from '~/actions/userManagement';

const BlueSquareEmailCCPopup = React.memo(props => {
  const { isOpen, onClose, userId, onCcListUpdate, darkMode: propDarkMode } = props;
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();

  const [searchWord, setSearchWord] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addUser, setAddUser] = useState({});
  const allUsers = useSelector(state => state.allUserProfiles?.userProfiles) || [];
  const activeUsers = allUsers.filter(user => user.isActive === true);
  const userProfile = allUsers.find(u => u._id === userId) || {};
  const ccList = userProfile?.infringementCCList || [];
  const ccCount = ccList.length;
  
  const filteredUsers = activeUsers.filter(user => {
    if (searchWord.includes(' ')) {
      const [first, last] = searchWord.split(' ');
      return (
        user.firstName.toLowerCase().includes(first.toLowerCase()) &&
        user.lastName.toLowerCase().includes(last.toLowerCase())
      );
    }
    return (
      user.firstName.toLowerCase().includes(searchWord.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchWord.toLowerCase()) ||
      user.email.toLowerCase().includes(searchWord.toLowerCase())
    );
  });

  const assignmentsWithStatus = useMemo(() => {
  return ccList.map(a => {
    const matchedUser = allUsers.find(user => user.email === a.email);
    return {
      ...a,
      assignedTo: {
        ...a.assignedTo,
        isActive: matchedUser?.isActive || false,
      },
    };
  });
}, [ccList, allUsers]);

  const handleAddCC = async (e) => {
  e?.preventDefault?.();

  if (!addUser?.email || !addUser?.firstName) {
    // eslint-disable-next-line no-alert
    alert('Pick a user from the list first.');
    return;
  }

  if (!userId) {
    // eslint-disable-next-line no-alert
    alert('Missing target userId.');
    return;
  }

  const payload = {
    email: addUser.email,
    firstName: addUser.firstName,
    lastName: addUser.lastName || '',
    role: addUser.role || '',
  };

  try {

    // ✅ Get updated list directly from dispatch return
    const result = await dispatch(addCCEmail(userId, payload));

    if (result) {

      // ✅ Notify parent immediately with latest count
      onCcListUpdate?.();

      // Optional: refresh profiles for global state consistency
      await dispatch(getAllUserProfile());
    }

    // Reset state and close modal
    setSearchWord('');
    setAddUser({});
    setDropdownOpen(false);
    onClose?.();

  } catch (err) {
    // eslint-disable-next-line no-alert
    alert(err?.response?.data?.error || 'Failed to add CC email.');
  }
};

const handleRemoveCC = async (email) => {
  if (!userId) {
    // eslint-disable-next-line no-alert
    alert('Missing target userId.');
    return;
  }

  if (!email) {
    // eslint-disable-next-line no-alert
    alert('Missing CC email to delete.');
    return;
  }

  try {

    // ✅ Get updated list directly from dispatch return
    const result = await dispatch(deleteCCEmail(userId, email));

    if (result) {

      // ✅ Notify parent immediately
      onCcListUpdate?.();

      // Optional: refresh profiles for global state
      await dispatch(getAllUserProfile());
    }

    // Close popup
    onClose?.();

  } catch (err) {
    // eslint-disable-next-line no-alert
    alert(err?.response?.data?.error || 'Failed to delete CC email.');
  }
};


  useEffect(() => {
    dispatch(getAllUserProfile());
  }, [dispatch]);

  return (
    <Modal isOpen={isOpen} toggle={onClose} size='lg' className={darkMode ? 'dark-mode text-light' : ''}>
      <ModalHeader toggle={onClose} className={darkMode ? 'bg-space-cadet' : ''}>
        Set blue square email recipients
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
            <Button color="primary" type="button" onClick={handleAddCC}>
              Add
            </Button>
          </InputGroup>

          {dropdownOpen && (
            <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
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
                    key={index}
                    onClick={() => {
                      setAddUser(user);
                      setSearchWord(`${user.firstName} ${user.lastName} (${user.email})`);
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
              {assignmentsWithStatus.map(assignment => (
                <tr key={assignment._id || assignment.email}>
                  <td>
                    <span className={assignment.assignedTo?.isActive ? "isActive" : "isNotActive"}>
                      <i className="fa fa-circle" aria-hidden="true" />
                    </span>
                  </td>
                  <td>
                    {assignment.firstName} {assignment.lastName} ({assignment.role})
                  </td>
                  <td>{assignment.email}</td>
                  <td className='d-flex justify-content-center align-items-center'>
                    <Button
                      color="danger"
                      onClick={() => handleRemoveCC(assignment.email)}
                      style={darkMode ? boxStyleDark : boxStyle}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Container>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={onClose} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

BlueSquareEmailCCPopup.displayName = "BlueSquareEmailCCPopup";

export default BlueSquareEmailCCPopup;
