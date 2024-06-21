import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'reactstrap';

function InfoModal({ isOpen, toggle }) {
  return (
    <div>
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Restrict the team member visiblity</ModalHeader>
        <ModalBody>
          <p>
          Toggle to change the visibility status of this team member. When turned on, the member will be visible to other team members. When turned off, the member will be hidden from view.
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
