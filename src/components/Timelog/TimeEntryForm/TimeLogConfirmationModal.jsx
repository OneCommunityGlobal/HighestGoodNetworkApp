import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label, FormGroup } from 'reactstrap';

const MIN_REASON_WORDS = 10;

const countWords = text =>
  text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;

function TimeLogConfirmationModal({ isOpen, toggleModal, onBack, onSubmit, darkMode }) {
  const [reason, setReason] = useState('');
  const [dateBelongsOn, setDateBelongsOn] = useState(moment().format('YYYY-MM-DD'));

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setDateBelongsOn(moment().format('YYYY-MM-DD'));
    }
  }, [isOpen]);

  const isReasonValid = countWords(reason) >= MIN_REASON_WORDS;
  const isDateValid = Boolean(dateBelongsOn);
  const canSubmit = isReasonValid && isDateValid;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(reason.trim(), dateBelongsOn);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggleModal} className={darkMode ? 'dark-mode' : ''}>
      <ModalHeader toggle={toggleModal}>INTANGIBLE TIME REASON</ModalHeader>
      <ModalBody>
        <p>
          If you are logging Intangible Time that you want converted to Tangible, you must include a
          reason why you didn&apos;t use the required timer.
        </p>
        <FormGroup>
          <Input
            type="textarea"
            id="intangibleTimeReason"
            name="intangibleTimeReason"
            placeholder="Detailed reason (10-word minimum)"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label for="intangibleTimeDate">DATE THIS BELONGS ON:</Label>
          <Input
            type="date"
            id="intangibleTimeDate"
            name="intangibleTimeDate"
            value={dateBelongsOn}
            onChange={e => setDateBelongsOn(e.target.value)}
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onBack} style={{ flex: 1, marginRight: '10px' }}>
          Whoops, take me back to edit this.
        </Button>
        <Button
          color="info"
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{ flex: 1 }}
        >
          I&apos;ve added all the specifics, submit!
        </Button>
      </ModalFooter>
    </Modal>
  );
}

TimeLogConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

TimeLogConfirmationModal.defaultProps = {
  darkMode: false,
};

export default TimeLogConfirmationModal;
