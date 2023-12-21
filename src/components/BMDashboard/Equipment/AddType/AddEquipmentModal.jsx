import { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  FormFeedback,
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
  const [errInput, setErrInput] = useState('');
  const handleSubmit = e => {
    e.preventDefault();
    const validate = schema.validate({ name, desc });
    if (validate.error) {
      return setErrInput(validate.error.details[0].path[0]);
    }
    // toggle();
  };
  return (
    <Modal isOpen={modal}>
      <ModalHeader>Add Equipment Type</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="item-name">Name</Label>
            <Input
              id="item-name"
              type="text"
              invalid={errInput === 'name'}
              onChange={({ target }) => setName(target.value)}
            />
            <FormFeedback>Please enter a name.</FormFeedback>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="item-description">Description</Label>
            <Input
              id="item-description"
              type="text"
              invalid={errInput === 'desc'}
              onChange={({ target }) => setDesc(target.value)}
            />
            <FormFeedback>Please enter a description.</FormFeedback>
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
