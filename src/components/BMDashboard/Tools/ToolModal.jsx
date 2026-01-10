import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

function ToolModal({ modal, toggle, title, value }) {
  return (
    <Modal isOpen={modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>{title}</ModalHeader>
      <ModalBody>{value}</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ToolModal;
