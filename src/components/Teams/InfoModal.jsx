import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'reactstrap';

function InfoModal({ isOpen, toggle }) {
  return (
    <div>
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Restrict the team member visibility</ModalHeader>
        <ModalBody>
          <p>
            By default a user can see all the members on their team. Disable it if you want to restrict the user&apos;s visibility and make it so that they cannot see other members on the same team.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={toggle} color="secondary" className="float-left">
            Ok
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default InfoModal;
