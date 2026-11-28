import React from 'react';
import { Modal, ModalBody } from 'reactstrap';

const QuestionnaireReminder = ({ onComplete }) => (
  <Modal isOpen backdrop="static" keyboard={false} centered>
    <ModalBody className="text-center p-4">
      <h4>Complete Your HGN Skills Questionnaire</h4>

      <p>Please complete the questionnaire before accessing the dashboard.</p>

      <button type="button" className="btn btn-primary" onClick={onComplete}>
        Complete Questionnaire
      </button>
    </ModalBody>
  </Modal>
);

export default QuestionnaireReminder;
