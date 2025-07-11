import React from "react";
import { Modal } from "react-bootstrap";
import "./UnitModal.css"; // Reuse the same CSS if you want the identical styling

const BiddingInfoModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      centered
      size="xl" // Optional: ensures a similar width to your ImageModal
    >
      {/* HEADER */}
      <Modal.Header className="modal-header-custom">
        <h2 className="modal-title">Bidding Information</h2>
        <span>
<button onClick={onClose} className="close-button">X</button>
        </span>
      </Modal.Header>

      {/* BODY */}
      <Modal.Body className="modal-body-custom">
        <p>
          This amount is the amount you've bid to pay for this particular unit.
          If you win the bid, the payment automatically goes through with the
          payment details you have provided on this form. We will notify you if
          you win the bid.
        </p>
        <p><strong>THERE IS NO CANCELLATION POLICY</strong></p>
      </Modal.Body>
    </Modal>
  );
};

export default BiddingInfoModal;