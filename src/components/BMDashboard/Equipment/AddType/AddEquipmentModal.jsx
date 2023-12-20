import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';

export default function AddEquipmentModal({ modal, toggle }) {
  return (
    <Modal isOpen={modal}>
      <ModalHeader>Add Equipment Type</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label htmlFor="item-name">Item 1</Label>
            <Input id="item-name" type="text" />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="item-description">Description</Label>
            <Input id="item-description" type="text" />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button size="lg" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
