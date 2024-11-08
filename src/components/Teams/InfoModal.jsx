import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'reactstrap';

function InfoModal({ isOpen, toggle }) {
  return (
    <div>
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Restrict the team member visiblity</ModalHeader>
        <ModalBody>
          <p>
            By default a user can see all the team members. Disable it if you want to restrict the user's visibility
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
