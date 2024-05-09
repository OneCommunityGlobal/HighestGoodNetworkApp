import { useSelector } from 'react-redux';
import { Button, Modal, ModalFooter, ModalBody } from 'reactstrap';
import CustomModalHeader from 'components/common/Modal/CustomModalHeader';
import { boxStyle, boxStyleDark } from 'styles';

function ListUsersPopUp({ open, onClose, userProfiles, removeUser, setEdit }) {
  const darkMode = useSelector(state => state.theme.darkMode)

  return (
    <Modal isOpen={open} toggle={onClose} className={`modal-dialog modal-lg ${darkMode ? 'text-light' : ''}`}>
      <CustomModalHeader title="Add New User Location" toggle={() => onClose()}/>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <div style={{ maxHeight: '300px', overflow: 'auto', margin: '4px' }}>
          {userProfiles.length > 0 ? (
            <table className={`table table-bordered table-responsive-md ${darkMode ? 'text-light' : ''}`}>
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>#</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {userProfiles.map((user, index) => {
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
                          {user.type === 'm_user' && (
                            <Button
                              color="danger"
                              onClick={() => removeUser(user._id)}
                              style={darkMode ? {} : boxStyle}
                              className="btn mr-1 btn-sm"
                            >
                              Remove
                            </Button>
                          )}
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
