import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';

export default function CheckTypesModal({ showModal, toggle }) {
  return (
    <Modal isOpen={showModal}>
      <ModalHeader>Inventory Types</ModalHeader>
      <ModalBody>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
            </tr>
          </thead>
        </Table>
      </ModalBody>
      <ModalFooter>
        <Button onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
}
