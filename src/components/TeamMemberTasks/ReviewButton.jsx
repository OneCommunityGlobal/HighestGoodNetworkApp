import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, DropdownToggle, DropdownMenu, DropdownItem, UncontrolledDropdown } from 'reactstrap';
import './style.css';
import './reviewButton.css';
import { boxStyle } from 'styles';

const ReviewButton = ({
  user,
  myUserId,
  myRole,
  task,
  updateTask
}) => {

  const [modal, setModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const toggleModal = () => {
    setModal(!modal);
  };

  const reviewStatus = task.reviewStatus ? task.reviewStatus : "Unsubmitted";

  const updReviewStat = () => {
    const updatedTask = { ...task, reviewStatus: newStatus };
    updateTask(task._id, updatedTask);
    setModal(false);
  };

  const toggle = (status) => {
    setModal(true);
    setNewStatus(status);
  }

  return (
    <>
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          Change Review Status
        </ModalHeader>
        <ModalBody>
          {reviewStatus == "Unsubmitted" 
            ? `Are you sure you want to submit for review?`
            : `Are you sure you have completed the review?`}
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => updReviewStat()}
            color="primary"
            className="float-left"
            style={boxStyle}
          >
            {reviewStatus == "Unsubmitted"
              ? `Submit`
              : `Complete`}
          </Button>
          <Button
            onClick={toggleModal}
            style={boxStyle}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      {(user.personId == myUserId && reviewStatus == "Unsubmitted") ? (
          <Button className='reviewBtn' color='primary' onClick={() => {toggle("Submitted");}}>
              Submit for Review
            </Button>
        ) : ((myRole == "Administrator" || myRole == "Mentor" || myRole == "Manager") && reviewStatus == "Submitted") ? (
          <UncontrolledDropdown>
            <DropdownToggle className="btn--dark-sea-green reviewBtn" caret>
              Ready for Review
            </DropdownToggle>
            <DropdownMenu>
            <DropdownItem onClick={() => {setNewStatus("Unsubmitted"); updReviewStat();}}>
                Dismiss submission
            </DropdownItem>
            <DropdownItem onClick={() => {toggle("Reviewed");}}>
                Complete review
            </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        ) : (reviewStatus == "Submitted") ? (
          <Button className='reviewBtn' color='success' disabled>
            Ready for Review
          </Button>
        ) : (reviewStatus == "Reviewed")? (
          <Button className='reviewBtn' color='secondary' disabled>Reviewed</Button>
        ) : (<></>
        )}
    </>
  );
};

export default ReviewButton;
