import React from 'react';
import { Modal } from 'react-bootstrap';
import styles from './UnitModal.module.css'; // Reuse the same CSS if you want the identical styling

const BiddingInfoModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      centered
      size="xl" // Optional: ensures a similar width to your ImageModal
    >
      {/* HEADER */}
      <Modal.Header className={styles.modalHeaderCustom}>
        <h2 className={styles.modalTitle}>Bidding Information</h2>
        <span>
          <button onClick={onClose} className={styles.closeButton}>
            X
          </button>
        </span>
      </Modal.Header>

      {/* BODY */}
      <Modal.Body className={styles.modalBodyCustom}>
        <p>
          This amount is the amount you&apos;ve bid to pay for this particular unit. If you win the
          bid, the payment automatically goes through with the payment details you have provided on
          this form. We will notify you if you win the bid.
        </p>
        <p>
          <strong>THERE IS NO CANCELLATION POLICY</strong>
        </p>
      </Modal.Body>
    </Modal>
  );
};

export default BiddingInfoModal;
