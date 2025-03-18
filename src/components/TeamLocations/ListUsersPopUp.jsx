import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Modal, ModalHeader, ModalFooter, ModalBody } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import '../Header/DarkMode.css';

function ListUsersPopUp({ open, onClose, userProfiles, removeUser, setEdit }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  // State to manage sorting
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  // Function to handle sorting
  const sortedProfiles = [...userProfiles].sort((a, b) => {
    let aValue = '';
    let bValue = '';

    // Get sorting values based on the key (name or location)
    if (sortConfig.key === 'name') {
      aValue =
        a.firstName && a.lastName
          ? `${a.firstName} ${a.lastName}`
          : a.firstName || a.lastName || '-';
      bValue =
        b.firstName && b.lastName
          ? `${b.firstName} ${b.lastName}`
          : b.firstName || b.lastName || '-';
    } else if (sortConfig.key === 'location') {
      aValue = `${a.location.city ? `${a.location.city}, ` : ''}${a.location.country}`;
      bValue = `${b.location.city ? `${b.location.city}, ` : ''}${b.location.country}`;
    }

    // Convert values to lowercase for case-insensitive comparison
    aValue = aValue.toLowerCase();
    bValue = bValue.toLowerCase();

    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  // Function to handle sorting click
  const handleSort = key => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <Modal
      isOpen={open}
      toggle={onClose}
      className={`modal-dialog modal-lg ${darkMode ? 'text-light dark-mode' : ''}`}
    >
      <ModalHeader
        className={darkMode ? 'bg-space-cadet' : ''}
        toggle={onClose}
        cssModule={{ 'modal-title': 'w-100 text-center my-auto pl-2' }}
      >
        Users`&apos;` Location List
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <div style={{ maxHeight: '300px', overflow: 'auto', margin: '4px' }}>
          {userProfiles.length > 0 ? (
            <table
              className={`table table-bordered table-responsive-md ${
                darkMode ? 'text-light bg-yinmn-blue' : ''
              }`}
            >
              <thead>
                <tr className={darkMode ? 'bg-space-cadet' : ''}>
                  <th style={{ width: '70px' }}>#</th>
                  <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                    Name{' '}
                    {sortConfig.key === 'name' &&
                      (sortConfig.direction === 'ascending' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>
                    Location{' '}
                    {sortConfig.key === 'location' &&
                      (sortConfig.direction === 'ascending' ? '▲' : '▼')}
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedProfiles.map((user, index) => {
                  let userName = '';
                  if (user.firstName && user.lastName) {
                    userName = `${user.firstName} ${user.lastName}`;
                  } else {
                    userName = user.firstName || user.lastName || '-';
                  }
                  return (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>{userName}</td>
                      <td>{`${user.location.city ? `${user.location.city}, ` : ''} ${
                        user.location.country
                      }`}</td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                          }}
                        >
                          <Button
                            color="danger"
                            onClick={() => removeUser(user._id)}
                            style={darkMode ? {} : boxStyle}
                            className="btn mr-1 btn-sm"
                          >
                            Remove
                          </Button>
                          <Button
                            color="Primary"
                            className="btn btn-outline-success mr-1 btn-sm"
                            onClick={() => setEdit(user)}
                            style={darkMode ? {} : boxStyle}
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="d-flex justify-content-center align-center">
              There are no users to remove or edit.
            </p>
          )}
        </div>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={onClose} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ListUsersPopUp;
