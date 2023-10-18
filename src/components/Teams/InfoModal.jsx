import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'reactstrap';

function InfoModal({ isOpen, toggle }) {
  return (
    <div>
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>See All functionality </ModalHeader>
        <ModalBody>
          <p>
            Defualt value is disabled. If you want to restrict the user to unsee the team members
            select enable
          </p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={toggle} color="secondary" className="float-left">
            {' '}
            Ok{' '}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default InfoModal;
