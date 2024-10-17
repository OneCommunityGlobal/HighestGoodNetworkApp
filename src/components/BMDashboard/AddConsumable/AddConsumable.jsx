/* eslint-disable react/jsx-no-bind */
import { useState, useEffect, useRef } from 'react';
import { Col, Container, Form, FormGroup, Input, Label, Button, CardBody, Card } from 'reactstrap';
import './AddConsumable.css';
import { useDispatch, useSelector } from 'react-redux';
import Joi from 'joi';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { fetchInvUnits } from '../../../actions/bmdashboard/invUnitActions';
import {
  fetchConsumableTypes,
  postBuildingConsumableType,
  resetPostBuildingConsumableTypeResult,
} from '../../../actions/bmdashboard/invTypeActions';

function AddConsumable() {
  const [newConsumable, setNewConsumable] = useState({
    consumableName: '',
    consumableDescription: '',
    consumableSize: '',
    consumableUnit: '',
  });

  const [allowNewMeasurement, setAllowNewMeasurement] = useState(false);
  const [formattedUnits, setFormattedUnits] = useState([]);
  const [errors, setErrors] = useState({});
  const [disableSubmit, setDisableSubmit] = useState(true);
  const dispatch = useDispatch();
  const buildingInventoryUnits = useSelector(state => state.bmInvUnits.list);
  const postBuildingInventoryResult = useSelector(state => state.bmInvTypes.postedResult);
  const selectInputRef = useRef();

  useEffect(() => {
    dispatch(fetchInvUnits());
  }, []);

  useEffect(() => {
    if (
      newConsumable.consumableName &&
      !errors.consumableName &&
      newConsumable.consumableDescription &&
      !errors.consumableDescription &&
      newConsumable.consumableUnit &&
      !errors.consumableUnit
    ) {
      setDisableSubmit(false);
    }
  }, [errors, newConsumable]);

  useEffect(() => {
    if (postBuildingInventoryResult?.error === true) {
      toast.error(`${postBuildingInventoryResult?.result}`);
      dispatch(resetPostBuildingConsumableTypeResult());
    } else if (postBuildingInventoryResult?.result !== null) {
      toast.success(
        `Created a new Consumable Type "${postBuildingInventoryResult?.result.name}" successfully`,
      );
      dispatch(fetchConsumableTypes());
      dispatch(resetPostBuildingConsumableTypeResult());

      selectInputRef.current.setValue({ label: '', value: '' });
      setNewConsumable({
        consumableName: '',
        consumableDescription: '',
        consumableSize: '',
        consumableUnit: '',
      });
      setAllowNewMeasurement(false);
      setDisableSubmit(true);
    }
  }, [postBuildingInventoryResult]);

  useEffect(() => {
    const _formattedUnits = buildingInventoryUnits.map(proj => {
      return { label: proj.unit, value: proj.unit };
    });

    setFormattedUnits(_formattedUnits);
  }, [buildingInventoryUnits]);

  const validationObj = {
    consumableName: Joi.string()
      .min(4)
      .max(50)
      .regex(/\S/)
      .required(),
    consumableDescription: Joi.string()
      .min(10)
      .max(150)
      .regex(/\S/)
      .required(),
    consumableSize: Joi.string()
      .allow('')
      .regex(/\S/)
      .optional(),
    consumableUnit: Joi.string().required(),
  };

  const schema = Joi.object(validationObj);

  function changeHandler(event) {
    const inputName = event.target.name;
    const inputValue = event.target.value;

    const errorsList = {};
    const validation = validationObj[inputName].validate(inputValue);
    if (validation.error) {
      validation.error.details.forEach(error => {
        errorsList[inputName] = error.message;
      });
    } else {
      errorsList[inputName] = '';
    }

    setErrors({ ...errors, ...errorsList });
    setNewConsumable(prevValue => {
      return { ...prevValue, [inputName]: inputValue };
    });
  }

  function unitSelectHandler(selectedOption) {
    setNewConsumable(prevValue => {
      return { ...prevValue, consumableUnit: selectedOption.value };
    });
  }

  function handleNewUnitCheck() {
    setNewConsumable(prevValue => {
      return { ...prevValue, consumableUnit: '' };
    });
    setAllowNewMeasurement(prevValue => !prevValue);
    setDisableSubmit(true);
  }

  function submitHandler() {
    const validation = schema.validate(newConsumable);
    if (!validation.error) {
      const postObj = {
        category: 'Consumable',
        name: newConsumable.consumableName,
        description: newConsumable.consumableDescription,
        unit: newConsumable.consumableUnit,
        size: newConsumable.consumableSize,
      };
      dispatch(postBuildingConsumableType(postObj));
    }
  }

  return (
    <Container fluid className="consumableContainer">
      <div className="consumablePage">
        <div className="consumable">
          <div className="consumableTitle">ADD CONSUMABLES FORM</div>
          <Card>
            <CardBody>
              <Form id="AddConsumableForm">
                <FormGroup row className="align-items-center justify-content-start">
                  <Label for="" lg={2} sm={4} className="consumableFormLabel">
                    Item Type
                  </Label>
                  <Col lg={8} sm={8} className="consumableFormValue">
                    <Input name="consumable" type="text" value="Consumable" disabled />
                  </Col>
                </FormGroup>
                <FormGroup row className="align-items-center justify-content-start">
                  <Label for="name" lg={2} sm={4} className="consumableFormLabel">
                    Consumable Name
                  </Label>
                  <Col lg={8} sm={8} className="consumableFormValue">
                    <Input
                      id="name"
                      name="consumableName"
                      type="text"
                      value={newConsumable.consumableName}
                      placeholder="Consumable Name"
                      onChange={event => changeHandler(event)}
                    />
                  </Col>
                  {errors.consumableName && (
                    <Label for="consumableNameErr" sm={12} className="consumableFormError">
                      Consumable &quot;name&quot; length must be at least 4 characters that are not
                      space
                    </Label>
                  )}
                </FormGroup>

                <FormGroup row className="align-items-center justify-content-start">
                  <Label for="name" lg={2} sm={4} className="consumableFormLabel">
                    Description
                  </Label>
                  <Col lg={8} sm={8} className="consumableFormValue">
                    <Input
                      id="description"
                      name="consumableDescription"
                      type="text"
                      value={newConsumable.consumableDescription}
                      onChange={event => changeHandler(event)}
                      placeholder="Description"
                    />
                  </Col>
                  {errors.consumableDescription && (
                    <Label for="consumableNameErr" sm={12} className="consumableFormError">
                      Consumable &quot;description&quot; length must be at least 10 characters that
                      are not space
                    </Label>
                  )}
                </FormGroup>

                <FormGroup row className="align-items-center justify-content-start">
                  <Label for="name" lg={2} sm={4} className="consumableFormLabel">
                    Size (optional)
                  </Label>
                  <Col lg={8} sm={8} className="consumableFormValue">
                    <Input
                      id="size"
                      name="consumableSize"
                      type="text"
                      value={newConsumable.consumableSize}
                      onChange={event => changeHandler(event)}
                      placeholder="Size"
                    />
                  </Col>
                  {errors.consumableSize && (
                    <Label for="consumableSizeErr" sm={12} className="consumableFormError">
                      Consumable &quot;size&quot; can not be space. Can be left blank if not
                      applicable
                    </Label>
                  )}
                </FormGroup>

                <FormGroup row className="align-items-center justify-content-start">
                  <Label for="unit" lg={2} sm={4} className="consumableFormLabel">
                    Measurement
                  </Label>
                  <Col lg={8} sm={8}>
                    <Select
                      id="unit"
                      name="unit"
                      onChange={event => unitSelectHandler(event)}
                      ref={selectInputRef}
                      options={formattedUnits}
                      isDisabled={!!allowNewMeasurement}
                    />
                  </Col>
                </FormGroup>

                <FormGroup check>
                  <Input
                    id="allowNewMeasurement"
                    name="allowNewMeasurement"
                    type="checkbox"
                    onChange={handleNewUnitCheck}
                  />
                  <Label check for="allowNewMeasurement">
                    Please check here if you want to enter a New Measurement. (You can always choose
                    from provided list for better calculations)
                  </Label>
                </FormGroup>

                {allowNewMeasurement && (
                  <FormGroup row className="align-items-center justify-content-start">
                    <Label for="name" lg={2} sm={4} className="consumableFormLabel">
                      New Measurement Unit
                    </Label>
                    <Col lg={8} sm={8} className="consumableFormValue">
                      <Input
                        id="newUnit"
                        name="consumableUnit"
                        type="text"
                        value={allowNewMeasurement ? newConsumable.consumableUnit : null}
                        onChange={event => changeHandler(event)}
                        placeholder="New Unit"
                      />
                    </Col>
                  </FormGroup>
                )}
                <FormGroup row className="d-flex justify-content-right">
                  <Button
                    onClick={event => submitHandler(event)}
                    className="consumableButtonBg"
                    disabled={disableSubmit}
                  >
                    Add Consumable
                  </Button>
                </FormGroup>
              </Form>
            </CardBody>
          </Card>
        </div>
      </div>
    </Container>
  );
}

export default AddConsumable;
