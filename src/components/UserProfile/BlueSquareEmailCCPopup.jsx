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

// eslint-disable-next-line react/display-name
const BlueSquareEmailCCPopup = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const [searchWord, setSearchWord] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addUser, setAddUser] = useState({});
  const allUsers = useSelector(state => state.allUserProfiles?.userProfiles) || [];
  const activeUsers = allUsers.filter(user => user.isActive === true);
  const ccList = props.ccList || [];

  const closePopup = () => {
    props.onClose();
  };

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);

  const filteredUsers = activeUsers.filter(user => {
    if (searchWord.includes(' ')) {
      const splitWords = searchWord.split(' ');
      const searchWordFirst = splitWords[0];
      const searchWordLast = splitWords[1];
      return (
        user.firstName.toLowerCase().includes(searchWordFirst.toLowerCase()) &&
        user.lastName.toLowerCase().includes(searchWordLast.toLowerCase()) &&
        user.email.toLowerCase().includes(searchWord.toLowerCase())
      );
    } else {
      return (
        user.firstName.toLowerCase().includes(searchWord.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchWord.toLowerCase()) ||
        user.email.toLowerCase().includes(searchWord.toLowerCase())
      );
    }
  });

  const ccListForUser = ccList.map(u => ({
  _id: u._id || u.id || u.email,
  email: u.email,
  assignedTo: {
    firstName: u.firstName || u.assignedTo?.firstName || '',
    lastName:  u.lastName  || u.assignedTo?.lastName  || '',
    role:      u.role      || u.assignedTo?.role      || '',
    isActive:  u.isActive ?? true,
  },
  role: u.role || u.assignedTo?.role || '',
}));


  const handleAddCC = (e) => {
  e?.preventDefault?.();

  if (!addUser?.email || !addUser?.firstName) {
    alert('Pick a user from the list first.');
    return;
  }
  if (!props.userId) {
    alert('Missing target userId.');
    return;
  }

  const payload = {
    email: addUser.email,
    firstName: addUser.firstName,
    lastName: addUser.lastName || '',
    role: addUser.role || '',
  };

  console.log('Dispatching addCCEmail...', payload);
  dispatch(addCCEmail(props.userId, payload));

  // reset state after dispatch
  setSearchWord('');
  setAddUser({});
  setDropdownOpen(false);
};

const handleRemoveCC = async (email) => {
  if (!props.userId) {
    alert('Missing target userId.');
    return;
  }

  if (!email) {
    alert('Missing CC email to delete.');
    return;
  }

  console.log('Dispatching deleteCCEmail...', email);
  dispatch(deleteCCEmail(props.userId, email));
};

  useEffect(() => {
  console.log('ccList data:', ccList);
}, [ccList]);

  useEffect(() => {
    dispatch(getAllUserProfile());
  }, []);

  return (
    <Modal isOpen={props.isOpen} toggle={closePopup} size='lg' className={darkMode ? 'dark-mode text-light' : ''}>
      <ModalHeader toggle={closePopup} className={darkMode ? 'bg-space-cadet' : ''}>Set blue square email recipients</ModalHeader>
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
                  key={index}
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
            {ccListForUser.length > 0 &&
              ccListForUser.map((assignment, index) => {
                return (
                  <tr key={assignment._id}>
                    <td>
                      <span className={assignment.assignedTo?.isActive ? "isActive" : "isNotActive"}>
                        <i className="fa fa-circle" aria-hidden="true" />
                      </span>
                    </td>
                    <td>
                        {assignment.assignedTo?.firstName} {assignment.assignedTo?.lastName} ({assignment.role})
                    </td>
                    <td style={{overflow:'auto'}}>
                        {assignment.email}
                    </td>
                    <td className='d-flex justify-content-center align-items-center'>
                      <Button
                        color="danger"
                        disabled={assignment.locked}
                        onClick={()=>handleRemoveCC(assignment.email)}
                        style={props.darkMode ? boxStyleDark : boxStyle}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
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
export default BlueSquareEmailCCPopup;
