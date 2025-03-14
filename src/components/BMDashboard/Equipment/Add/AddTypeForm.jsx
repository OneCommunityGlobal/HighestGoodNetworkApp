import { useState, useEffect } from 'react';
import { Form, FormGroup, FormFeedback, Label, Input, Button } from 'reactstrap';
import Joi from 'joi';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';

import { addEquipmentType } from 'actions/bmdashboard/equipmentActions';

const FuelTypes = {
  dies: 'Diesel',
  biod: 'Biodiesel',
  gaso: 'Gasoline',
  natg: 'Natural Gas',
  etha: 'Ethanol',
};

// const [inputText, setInputText] = useState('');

const schema = Joi.object({
  name: Joi.string().required(),
  desc: Joi.string()
    .required()
    .max(150),
});

export default function AddTypeForm() {
  const history = useHistory();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [fuel, setFuel] = useState(FuelTypes.dies);
  const [errInput, setErrInput] = useState('');
  const [errType, setErrType] = useState('');
  const [isRedirected, setIsRedirected] = useState(false);

  useEffect(() => {
    if (isRedirected) {
      history.push('/bmdashboard/equipment');
    }
  }, [isRedirected, history]);

  const handleChange = event => {
    setErrInput('');
    if (event.target.name === 'name') {
      setName(event.target.value);
    }
    if (event.target.name === 'desc') {
      setDesc(event.target.value);
    }
    if (event.target.name === 'fuel') {
      setFuel(event.target.value);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validate = schema.validate({ name, desc });
    if (validate.error) {
      setErrInput(validate.error.details[0].path[0]);
      setErrType(validate.error.details[0].type);
      return;
    }
    const response = await addEquipmentType({ name, desc, fuel });
    if (response.status === 201) {
      toast.success('Success: new equipment type added.');
      setIsRedirected(true);
    } else if (response.status === 409) {
      toast.error(`Error: that type already exists.`);
    } else if (response.status >= 400) {
      toast.error(`Error: ${response.status} ${response.statusText}.`);
    } else toast.warning(`Warning: unexpected status ${response.status}.`);
    setName('');
    setDesc('');
    setFuel('');
  };

  const handleCancel = () => history.goBack();

  return (
    <Form onSubmit={handleSubmit} className="inv-form">
      <FormGroup className="inv-form-group">
        <Label htmlFor="new-equipment-name" className="inv-form-required">
          Name
        </Label>
        <Input
          id="new-equipment-name"
          name="name"
          type="text"
          value={name}
          invalid={errInput === 'name'}
          onChange={handleChange}
        />
        <FormFeedback className="inv-form-feedback">Please enter a name.</FormFeedback>
      </FormGroup>
      <FormGroup className="inv-form-group">
        <Label htmlFor="new-equipment-description" className="inv-form-required">
          Description
        </Label>
        <Input
          id="new-equipment-description"
          name="desc"
          type="textarea"
          rows={2}
          value={desc}
          invalid={errInput === 'desc'}
          onChange={handleChange}
        />
        <div class="form-footer" style={{ color: desc.length > 150 ? '#dc3545' : 'black' }}>
          Character {desc.length}/150
        </div>
        {/* {!errInput && <FormText>Max 150 characters</FormText>} */}
        <FormFeedback>
          {errType === 'string.max'
            ? 'Exceeds maximum character limit (150).'
            : 'Please enter a description.'}
        </FormFeedback>
      </FormGroup>
      <FormGroup className="inv-form-group">
        <Label className="inv-form-required">Fuel Type</Label>
        <Input
          id="new-equipment-fuel-type"
          name="fuel"
          type="select"
          value={fuel}
          onChange={handleChange}
        >
          <option value={FuelTypes.dies}>{FuelTypes.dies}</option>
          <option value={FuelTypes.biod}>{FuelTypes.biod}</option>
          <option value={FuelTypes.gaso}>{FuelTypes.gaso}</option>
          <option value={FuelTypes.natg}>{FuelTypes.natg}</option>
          <option value={FuelTypes.etha}>{FuelTypes.etha}</option>
        </Input>
      </FormGroup>
      <div className="inv-form-btn-group">
        <Button color="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button color="primary" disabled={!name && !desc}>
          Submit
        </Button>
      </div>
    </Form>
  );
}
