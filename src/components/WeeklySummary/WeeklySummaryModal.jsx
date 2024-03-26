import { useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import WeeklySummary from './WeeklySummary';

function WeeklySummaryModal() {
  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);

  return (
    <div>
      <div className="row justify-content-center">
        <div
          data-testid="weeklySummaryTest"
          role="button"
          className="mt-3 mb-5 text-center"
          onClick={toggle}
          onKeyDown={toggle}
          tabIndex="0"
        >
          <WeeklySummary isModal />
        </div>
      </div>

      <Modal
        isOpen={modal}
        toggle={toggle}
        backdrop="static"
        size="xl"
        className="weekly-summary-modal"
      >
        <ModalHeader toggle={toggle}>Weekly Summary</ModalHeader>
        <ModalBody>
          <WeeklySummary />
        </ModalBody>
      </Modal>
    </div>
  );
}

export default WeeklySummaryModal;
