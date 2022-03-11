import React from 'react';
import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'reactstrap';

const InfoModal = ({ isOpen, toggle }) => (
  <div>
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>User Profile Info</ModalHeader>
      <ModalBody>
        <p>
          This is your One Community Profile Page! It is used to share your information relevant to
          your manager and fellow team members. Please add your picture and be sure the the “Links”
          and “Basic Information” sections are correct for you.
        </p>
        <p>
          You’ll see Blue Squares and contact information have a toggle option for “Public” or
          “Private”, toggling these to “Private” will make them visible only to Admins and Managers.
        </p>
        <ul>
          <li>
            Blue Squares: Blue squares are assigned for not completing weekly hours, not submitting
            your weekly summary, or missing a scheduled call. They are also meant to be used for
            requesting time off. Just ask and we’ll always say ‘yes’ and add a note (when the blue
            square is auto-issued for missed hours) to explain how it was used. We allow 5 of these
            before taking action.
          </li>
          <li>Basic Information: This is where your contact information and bio go.</li>
          <li>
            Volunteering Times: This shares your start and end dates, committed hours, total hours
            volunteered, etc.
          </li>
          <li>
            Teams: This shows any teams you are a member of. You will see all other members of your
            team in the Leaderboard on the Time Log page and have access to their Profiles and Time
            Logs from there.
          </li>
          <li>Projects: This shows all the projects and tasks you are assigned to.</li>
        </ul>
        <p>THANK YOU FOR BEING A PART OF ONE COMMUNITY!</p>
      </ModalBody>
      <ModalFooter>
        <Button onClick={toggle} color="secondary" className="float-left">
          {' '}
          Ok{' '}
        </Button>
      </ModalFooter>
    </Modal>
  </div>
);

export default InfoModal;
