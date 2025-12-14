import React, { useState } from 'react';
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
import './ResendEmailModal.css';

const ResendEmailModal = ({ isOpen, toggle, email, onResend }) => {
  const [recipientOption, setRecipientOption] = useState('same');
  const [specificRecipients, setSpecificRecipients] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // FIXED: Issue 6 - Pass data as an object with correct structure
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

      await onResend(resendData);

      // Reset form after successful resend
      setRecipientOption('same');
      setSpecificRecipients('');
      toggle();
    } catch (error) {
      console.error('Error resending email:', error);
    } finally {
      setIsSubmitting(false);
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
