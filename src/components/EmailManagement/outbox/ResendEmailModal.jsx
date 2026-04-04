import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
  Alert,
} from 'reactstrap';
import { FaPaperPlane, FaInfoCircle } from 'react-icons/fa';
import './ResendEmailModal.module.css';

const ResendEmailModal = ({ isOpen, toggle, email, onResend }) => {
  const [recipientOption, setRecipientOption] = useState('same');
  const [specificRecipients, setSpecificRecipients] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const resendData = {
        recipientOption: recipientOption,
        recipients:
          recipientOption === 'specific'
            ? specificRecipients
                .split(/[,\n]/)
                .map(email => email.trim())
                .filter(email => email.length > 0)
            : undefined,
      };

      // ISSUE 11 FIX: Don't wait for completion - call onResend but don't await it fully
      // Just trigger the resend and close immediately
      const resendPromise = onResend(resendData);

      // Close modal immediately after initiating resend
      setRecipientOption('same');
      setSpecificRecipients('');
      setIsSubmitting(false);
      toggle();

      // Show feedback that email is being processed
      toast.info('Email created for resend successfully! Processing will start shortly.', {
        autoClose: 3000,
      });

      // Handle the promise in the background (don't block UI)
      resendPromise.catch(error => {
        // Error handling is already done in parent component
        // eslint-disable-next-line no-console
        console.error('Resend error:', error);
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error initiating resend:', error);
      setIsSubmitting(false);
      toast.error('Failed to initiate resend. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRecipientOption('same');
      setSpecificRecipients('');
      toggle();
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="lg" className="resend-email-modal">
      <ModalHeader toggle={handleClose}>
        <FaPaperPlane className="me-2" />
        Resend Email: {email?.subject}
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody>
          <Alert color="info" className="mb-4">
            <FaInfoCircle className="me-2" />
            This will create a copy of the email and send it immediately to the selected recipients.
            Processing will start as soon as the email is created.
          </Alert>

          <FormGroup>
            <Label className="fw-bold mb-3">Select Recipients</Label>

            <div className="ms-3">
              <FormGroup check className="mb-3">
                <Label check>
                  <Input
                    type="radio"
                    name="recipientOption"
                    value="same"
                    checked={recipientOption === 'same'}
                    onChange={e => setRecipientOption(e.target.value)}
                  />
                  <span className="ms-2">Same as current recipients</span>
                  <small className="d-block ms-5 text-muted">
                    Resend to the exact same recipients as the original email
                  </small>
                </Label>
              </FormGroup>

              <FormGroup check className="mb-3">
                <Label check>
                  <Input
                    type="radio"
                    name="recipientOption"
                    value="all"
                    checked={recipientOption === 'all'}
                    onChange={e => setRecipientOption(e.target.value)}
                  />
                  <span className="ms-2">All subscribers</span>
                  <small className="d-block ms-5 text-muted">
                    Resend to all HGN users and email subscribers with active subscriptions
                  </small>
                </Label>
              </FormGroup>

              <FormGroup check className="mb-3">
                <Label check>
                  <Input
                    type="radio"
                    name="recipientOption"
                    value="specific"
                    checked={recipientOption === 'specific'}
                    onChange={e => setRecipientOption(e.target.value)}
                  />
                  <span className="ms-2">Specific recipients</span>
                  <small className="d-block ms-5 text-muted">
                    Enter specific email addresses (comma or newline separated)
                  </small>
                </Label>
              </FormGroup>
            </div>
          </FormGroup>

          {recipientOption === 'specific' && (
            <FormGroup>
              <Label for="specificRecipients">Email Addresses</Label>
              <Input
                type="textarea"
                id="specificRecipients"
                rows="6"
                placeholder="Enter email addresses separated by commas or new lines&#10;e.g., user1@example.com, user2@example.com"
                value={specificRecipients}
                onChange={e => setSpecificRecipients(e.target.value)}
                required
              />
              <small className="text-muted">Enter at least one valid email address</small>
            </FormGroup>
          )}
        </ModalBody>

        <ModalFooter>
          <Button color="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            color="primary"
            type="submit"
            disabled={
              isSubmitting || (recipientOption === 'specific' && !specificRecipients.trim())
            }
          >
            {isSubmitting ? 'Sending...' : 'Resend Email'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default ResendEmailModal;
