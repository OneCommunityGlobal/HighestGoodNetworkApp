import React from 'react';
import { Button } from 'react-bootstrap';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import BadgeReport from 'components/Badge/BadgeReport';
import { boxStyle } from 'styles';

const BadgeSummaryViz = (props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const toggle = () => setIsOpen(prev => !prev)

  const {
    userId,
    badgeCollection,
    role,
    firstName,
    lastName,
    permissions
  } = props
  
  const permissionsUser = permissions?.frontPermissions

  return (
    <div>
      <Button onClick={toggle} style={boxStyle}>
        Show Badge Summary
      </Button>
      <Modal size="lg" isOpen={isOpen} toggle={toggle}>
        <ModalHeader>Full View of Badge History</ModalHeader>
        <ModalBody>
          <BadgeReport
            badgeCollection={badgeCollection}
            userId={userId}
            role={role}
            firstName={firstName}
            lastName={lastName}
            close={toggle}
            // setUserProfile={props.setUserProfile}
            // setOriginalUserProfile={props.setOriginalUserProfile}
            // handleSubmit={props.handleSubmit}
            permissionsUser={permissionsUser}
          />
        </ModalBody>
      </Modal>
    </div>)
}

export default BadgeSummaryViz