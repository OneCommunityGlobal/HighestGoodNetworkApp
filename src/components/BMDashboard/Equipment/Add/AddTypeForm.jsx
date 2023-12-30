import { useState } from 'react';
import { Form, FormGroup, FormFeedback, Label, Input, Button } from 'reactstrap';
import Joi from 'joi';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';

import { addEquipmentType } from 'actions/bmdashboard/equipmentActions';

const FuelTypeEnum = {
  dies: 'Diesel',
  biod: 'Biodiesel',
  gaso: 'Gasoline',
  natg: 'Natural Gas',
  etha: 'Ethanol',
};

const schema = Joi.object({
  name: Joi.string().required(),
  desc: Joi.string().required(),
});

export default function AddTypeForm() {
  const history = useHistory();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [fuel, setFuel] = useState(FuelTypeEnum.dies);
  const [errInput, setErrInput] = useState('');

  const handleChange = ({ target }) => {
    setErrInput('');
    if (target.name === 'name') {
      setName(target.value);
    }
    if (target.name === 'desc') {
      setDesc(target.value);
    }
    if (target.name === 'fuel') {
      setFuel(target.value);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validate = schema.validate({ name, desc });
    if (validate.error) {
      setErrInput(validate.error.details[0].path[0]);
      return;
    }
    const response = await addEquipmentType({ name, desc, fuel });
    if (response.status === 201) {
      toast.success('Success: new equipment type added.');
    } else if (response.status >= 400) {
      toast.error(`Error: ${response.status} ${response.statusText}.`);
    } else toast.warning(`Warning: unexpected status ${response.status}.`);
    setName('');
    setDesc('');
    setFuel('');
  };

  const handleCancel = () => history.goBack();

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="new-equipment-name">Name</Label>
        <Input
          id="new-equipment-name"
          name="name"
          type="text"
          value={name}
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
          value={desc}
          invalid={errInput === 'desc'}
          onChange={handleChange}
        />
        <FormFeedback>Please enter a description.</FormFeedback>
      </FormGroup>
      <FormGroup>
        <Label>Fuel Type</Label>
        <Input
          id="new-equipment-fuel-type"
          name="fuel"
          type="select"
          value={fuel}
          onChange={handleChange}
        >
          <option value={FuelTypeEnum.dies}>{FuelTypeEnum.dies}</option>
          <option value={FuelTypeEnum.biod}>{FuelTypeEnum.biod}</option>
          <option value={FuelTypeEnum.gaso}>{FuelTypeEnum.gaso}</option>
          <option value={FuelTypeEnum.natg}>{FuelTypeEnum.natg}</option>
          <option value={FuelTypeEnum.etha}>{FuelTypeEnum.etha}</option>
        </Input>
      </FormGroup>
      <Button color="secondary" size="lg" onClick={handleCancel}>
        Cancel
      </Button>
      <Button color="primary" size="lg">
        Submit
      </Button>
    </Form>
  );
}
