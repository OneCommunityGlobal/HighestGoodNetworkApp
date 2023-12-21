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

  const handleChange = ({ target }) => {
    setErrInput('');
    if (target.name === 'name') {
      setName(target.value);
    }
    if (target.name === 'desc') {
      setDesc(target.value);
    }
  };

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
            <Label htmlFor="new-equipment-name">Name</Label>
            <Input
              id="new-equipment-name"
              name="name"
              type="text"
              invalid={errInput === 'name'}
              onChange={handleChange}
            />
            <FormFeedback>Please enter a name.</FormFeedback>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="new-equipment-description">Description</Label>
            <Input
              id="new-equipment-description"
              name="desc"
              type="text"
              invalid={errInput === 'desc'}
              onChange={handleChange}
            />
            <FormFeedback>Please enter a description.</FormFeedback>
          </FormGroup>
          <Button color="primary" size="lg" disabled={!name || !desc}>
            Submit
          </Button>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" size="lg" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
