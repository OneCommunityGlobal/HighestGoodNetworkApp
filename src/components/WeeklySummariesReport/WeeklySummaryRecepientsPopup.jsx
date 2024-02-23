import React, { useState, useEffect } from 'react';
import { boxStyle } from 'styles';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Container, Alert } from 'reactstrap';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import MembersAutoComplete from '../Teams/MembersAutoComplete';
import {
  getSummaryRecipients,
  addSummaryRecipient,
  deleteSummaryRecipient,
} from '../../actions/weeklySummariesReportRecepients';

// const membersList = [{ id: 1, firstName: "onecommunityglobal", lastName: '', email: "onecommunityglobal@gmail.com" },
// { id: 2, firstName: "onecommunityhospitality", lastName: '', email: "onecommunityhospitality@gmail.com" }]

const WeeklySummaryRecipientsPopup = React.memo(props => {
  const dispatch = useDispatch();
  // const { open, onClose, summaries, onAddUser, recipients, onDeleteClick } = props;
  const { open, onClose, summaries, onAddUser, onDeleteClick } = props;

  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [isValidUser, setIsValidUser] = useState(true);
  // The below states keeps a track of the list of Weekly Summary Report Recipients
  const [recipients, setRecipients] = useState([]);
  const [updatedRecipients, setUpdatedRecipients] = useState(false);

  useEffect(() => {
    const getRecipients = async () => {
      try {
        const data = await dispatch(getSummaryRecipients());
        setRecipients([...data]);
      } catch (error) {
        console.log(error);
      }
    };
    getRecipients();
  }, [updatedRecipients]);

  const closePopup = () => {
    onClose();
    setUpdatedRecipients(false);
  };

  const selectUser = user => {
    setSelectedUser(user);
    setIsValidUser(true);
  };

  const addUserFn = () => {
    if (selectedUser && !recipients?.some(x => x._id === selectedUser?._id)) {
      onAddUser(selectedUser, recipients);
      setUpdatedRecipients(true);
      setSearchText('');
    } else {
      setIsValidUser(false);
      setUpdatedRecipients(false);
    }
  };

  return (
    <Container fluid>
      <Modal isOpen={open} toggle={closePopup} autoFocus={false} size="lg">
        <ModalHeader toggle={closePopup}>Recipients of Weekly summaries</ModalHeader>
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
                    <td>{moment(user.createdDate).format('MMM-DD-YY')}</td>
                    <td>
                      <Button
                        color="danger"
                        onClick={() => {
                          onDeleteClick(`${user._id}`);
                          setUpdatedRecipients(true);
                        }}
                        style={boxStyle}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
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
});
export default WeeklySummaryRecipientsPopup;
