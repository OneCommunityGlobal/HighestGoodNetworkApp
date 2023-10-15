import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { boxStyle } from 'styles';

function RemoveUserPopUp({ open, onClose, userProfiles, removeUser, setEdit }) {
  return (
    <Modal isOpen={open} toggle={onClose} className={'modal-dialog modal-md'}>
      <ModalHeader
        toggle={onClose}
        cssModule={{ 'modal-title': 'w-100 text-center my-auto pl-2' }}
      >
        Add New User Location
      </ModalHeader>
      <ModalBody>
        <div style={{ maxHeight: '300px', overflow: 'auto', margin: '4px' }}>
          <table className="table table-bordered table-responsive-md">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>#</th>
                <th>Name</th>
                <th>Location</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {userProfiles.length > 0 ? (
                userProfiles.map((user, index) => {
                  let userName = '';
                  if(user.firstName && user.lastName) {
                    userName = `${user.firstName}, ${user.lastName}`
                  } else {
                    userName = user.firstName || user.lastName || '-'
                  }
                  return (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>{userName}</td>
                      <td>{`${user.location.city ? user.location.city + ',' : ''} ${
                        user.location.country
                      }`}</td>
                      <td style={{ textAlign: 'center', display: 'flex', gap: '10px' }}>
                        <Button
                          color="danger"
                          onClick={() => removeUser(user._id)}
                          style={boxStyle}
                          className='btn mr-1 btn-sm'
                        >
                          Delete
                        </Button>
                        <Button color="Primary" className='btn btn-outline-success mr-1 btn-sm' onClick={() => setEdit(user)}>Edit</Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <></>
              )}
            </tbody>
          </table>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default RemoveUserPopUp;
