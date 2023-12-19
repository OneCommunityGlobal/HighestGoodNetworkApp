import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import Badge from './Badge';

const BadgeDashboardPopUp = (userId, role) => {
  const [showPopup, setShowPopup] = useState(false);

  const handleOpen = () => setShowPopup(true);
  const handleClose = () => setShowPopup(false);

  return (
    <div>
      <Button variant="primary" onClick={handleOpen}>
        Open Popup
      </Button>

      <Modal show={showPopup} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Badges</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Badge userId={userId} role={role} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BadgeDashboardPopUp;
