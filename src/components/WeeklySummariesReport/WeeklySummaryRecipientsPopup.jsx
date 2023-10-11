import React, { useCallback, useEffect, useState } from 'react';
import { boxStyle } from 'styles';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Container, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MembersAutoComplete from '../Teams/MembersAutoComplete';
import moment from 'moment';

// const membersList = [{ id: 1, firstName: "onecommunityglobal", lastName: '', email: "onecommunityglobal@gmail.com" },
// { id: 2, firstName: "onecommunityhospitality", lastName: '', email: "onecommunityhospitality@gmail.com" }]

export const WeeklySummaryRecipientsPopup = React.memo(props => {
  let { open, onClose, summaries, onAddUser,
    recipients,
    onDeleteClick } = props;

  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [isValidUser, setIsValidUser] = useState(true);

  const closePopup = () => {
    onClose();
  }

  const selectUser = user => {
    setSelectedUser(user);
    setIsValidUser(true);
  };

  const addUserFn = () => {
    if ((selectedUser && !recipients?.some(x => x._id === selectedUser?._id))) {
      onAddUser(selectedUser, recipients);
      setSearchText('');
    } else {
      setIsValidUser(false)
    }
  }

  return (
    <Container fluid>
      <Modal isOpen={open} toggle={closePopup} autoFocus={false} size='lg'>
        <ModalHeader toggle={closePopup}>{`Recipients of Weekly summaries`}</ModalHeader>
        <ModalBody style={{ textAlign: 'center' }}>
          <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
            <MembersAutoComplete
              summaries={summaries}
              onAddUser={selectUser}
              searchText={searchText}
              setSearchText={setSearchText}
              context="WeeklySummary"
            />
            <Button color="primary" onClick={addUserFn} style={boxStyle}>
              Add
            </Button>
          </div>
          {!isValidUser && <Alert color="danger">Please choose a valid user.</Alert>}
          <table className="table table-bordered table-responsive-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Recipient Name</th>
                <th style={{ cursor: 'pointer' }}
                >Date Added
                </th>
              </tr>
            </thead>
            <tbody>
              {recipients?.length > 0 &&
                recipients?.toSorted().map((user, index) => (
                  <tr key={`recipient_name_${index}`}>
                    <td>{index + 1}</td>
                    <td>{`${user.firstName} ${user.lastName}`}</td>
                    <td>{moment(user.createdDate).format('MMM-DD-YY')}</td>
                    <td>
                      <Button
                        color="danger"
                        onClick={() => onDeleteClick(`${user._id}`)}
                        style={boxStyle}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closePopup} style={boxStyle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );

})