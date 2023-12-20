import { useState } from 'react';
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
import Joi from 'joi';

const schema = Joi.object({
  name: Joi.string().required(),
  desc: Joi.string().required(),
});

export default function AddEquipmentModal({ modal, toggle }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const handleSubmit = e => {
    e.preventDefault();
    const value = schema.validate({ name, desc });
    console.log('joi: ', value);
    // toggle();
  };
  return (
    <Modal isOpen={modal}>
      <ModalHeader>Add Equipment Type</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="item-name">Item 1</Label>
            <Input id="item-name" type="text" onChange={({ target }) => setName(target.value)} />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="item-description">Description</Label>
            <Input
              id="item-description"
              type="text"
              onChange={({ target }) => setDesc(target.value)}
            />
          </FormGroup>
          <Button color="primary" size="lg">
            Submit
          </Button>
          <Button color="secondary" size="lg" onClick={toggle}>
            Cancel
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
}
