import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, DropdownToggle, DropdownMenu, DropdownItem, UncontrolledDropdown, Input } from 'reactstrap';
import './style.css';
import './reviewButton.css';
import { boxStyle } from 'styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import httpService from '../../services/httpService';
import { ApiEndpoint } from 'utils/URL';

const ReviewButton = ({
  user,
  myUserId,
  myRole,
  task,
  updateTask
}) => {


  const [modal, setModal] = useState(false);
  const [link, setLink] = useState("");
  const [verifyModal, setVerifyModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  const toggleModal = () => {
    setModal(!modal);
  };

  const toggleVerify = () => {
    setVerifyModal(!verifyModal);
  }

  const handleLink = (e) => {
    setLink(e.target.value);
  };

  const reviewStatus = function() {
    let status = "Unsubmitted";
    for(let resource of task.resources) {
      if (resource.userID === user.personId) {
        status = resource.reviewStatus ? resource.reviewStatus : "Unsubmitted"
        break;
      }
    }
    return status;
  }();

  const updReviewStat = (newStatus) => {
    const resources = [...task.resources];
    const newResources = resources.map(resource => {
      const newResource = { ...resource, reviewStatus: newStatus };
      newResource.completedTask = newStatus === "Reviewed";
      return newResource;
    });
    let updatedTask = { ...task, resources: newResources };

    //Add relatedWorkLinks to existing tasks
    if(!Array.isArray(task.relatedWorkLinks)) {
      task.relatedWorkLinks = [];
    }
  
    if (newStatus === 'Submitted' && link) {
      updatedTask = {...updatedTask, relatedWorkLinks: [...task.relatedWorkLinks, link] };
      setLink("");
    }
    updateTask(task._id, updatedTask);
    setModal(false);
  };

  const buttonFormat = () => {
    if (user.personId == myUserId && reviewStatus == "Unsubmitted") {
      return <Button className='reviewBtn' color='primary' onClick={toggleModal} style={boxStyle}>
        Submit for Review
      </Button>;
     } else if (reviewStatus == "Submitted")  {
      if (myRole == "Owner" ||myRole == "Administrator" || myRole == "Mentor" || myRole == "Manager") {
        return (
          <UncontrolledDropdown>
            <DropdownToggle className="btn--dark-sea-green reviewBtn" caret style={boxStyle}>
              Ready for Review
            </DropdownToggle>
            <DropdownMenu>
            {task.relatedWorkLinks && task.relatedWorkLinks.map((link, index) => (
              <DropdownItem key={index} href={link} target="_blank">
                View Link
              </DropdownItem>
            ))}
            <DropdownItem onClick={() => { setSelectedAction('Complete and Remove'); toggleVerify(); }}>
              <FontAwesomeIcon
                className="team-member-tasks-done"
                icon={faCheck}
              /> as complete and remove task
            </DropdownItem>
            <DropdownItem onClick={() => { setSelectedAction('More Work Needed'); toggleVerify()}}>
              More work needed, reset this button
            </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        );
      } else if (user.personId == myUserId) {
        return <Button className='reviewBtn' color='success' onClick={() => {updReviewStat("Unsubmitted");}}>
          More work needed, reset this button
        </Button>;
      } else {
        return <Button className='reviewBtn' color='success' disabled>
          Ready for Review
        </Button>;
      }
     } else {
      return <></>;
     }
    };
  
  const sendReviewReq = event => {
    event.preventDefault();
    var data = {};
    data['myUserId'] = myUserId;
    data['name'] = user.name;
    data['taskName'] = task.taskName;

    httpService.post(`${ApiEndpoint}/tasks/reviewreq/${myUserId}`, data);
  };

  return (
    <>
    {/* Verification Modal */}
    <Modal isOpen={verifyModal} toggle={toggleVerify}>
      <ModalHeader toggle={toggleVerify}>
        {selectedAction === 'Complete and Remove' && 'Are you sure you have completed the review?'}
        {selectedAction === 'More Work Needed' && 'Are you sure?'}
      </ModalHeader>
      <ModalFooter>
      <Button
            onClick={(e) => {
              if (selectedAction === 'More Work Needed') {
                updReviewStat("Unsubmitted");
              } else if (reviewStatus === "Unsubmitted") {
                updReviewStat("Submitted");
                sendReviewReq(e);
              } else {
                updReviewStat("Reviewed");
              }
              toggleVerify();
            }}
            color="primary"
            className="float-left"
            style={boxStyle}
          >
            {reviewStatus == "Unsubmitted"
              ? `Submit`
              : `Complete`}
          </Button>
          <Button
            onClick={toggleVerify}
            style={boxStyle}
          >
            Cancel
          </Button>
      </ModalFooter>
    </Modal>

            {/* Submission Modal */}
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          Change Review Status
        </ModalHeader>
        <ModalBody>
          {reviewStatus == "Unsubmitted" 
            ? `Are you sure you want to submit for review?`
            : `Are you sure you have completed the review?`}
        </ModalBody>
        <ModalBody>
          Please add link to related work:
          <Input 
          type='text' 
          value={link}
          onChange={handleLink}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={(e) => {
              reviewStatus == "Unsubmitted"
              ? (updReviewStat("Submitted"),
                sendReviewReq(e))
              : updReviewStat("Reviewed");
            }}
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
      {buttonFormat()}
    </>
  );
};
export default ReviewButton;
