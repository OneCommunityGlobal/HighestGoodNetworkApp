import {
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Button,
  CardBody,
  Card,
  Table,
} from 'reactstrap';
import './AddMaterial.css';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useState } from 'react';
import Joi from 'joi';
import { toast } from 'react-toastify';
import {
  fetchMaterialTypes,
  postBuildingInventoryType,
  resetPostBuildingInventoryTypeResult,
} from 'actions/bmdashboard/invTypeActions';
import { fetchInvUnits } from 'actions/bmdashboard/invUnitActions';
import Select from 'react-select';
import { similarity } from './SimilarityCheck';

function AddMaterial() {
  const dispatch = useDispatch();
  const postBuildingInventoryResult = useSelector(state => state.bmInvTypes.postedResult);
  const buildingInventoryUnits = useSelector(state => state.bmInvUnits.list);
  const [formattedUnits, setFormattedUnits] = useState([]);
  const [similarityData, setSimilarityData] = useState([]);

  const [material, setMaterial] = useState({
    name: '',
    unit: '',
    customUnit: '',
    customUnitCheck: false,
    description: '',
    allowNewMeasurement: false,
  });
  const [validations, setValidations] = useState({
    name: '',
    unit: '',
    customUnit: '',
    description: '',
    commonUnit: '',
    customUnitCheck: '',
    total: true,
  });

  useEffect(() => {
    dispatch(fetchMaterialTypes());
    dispatch(fetchInvUnits());
  }, []);

  useEffect(() => {
    const _formattedUnits = buildingInventoryUnits.map(proj => {
      return { label: proj.unit, value: proj.unit };
    });
    setFormattedUnits(_formattedUnits);
  }, [buildingInventoryUnits]);

  useEffect(() => {
    if (postBuildingInventoryResult?.error === true) {
      toast.error(`${postBuildingInventoryResult?.result}`);
      dispatch(fetchMaterialTypes());
      dispatch(resetPostBuildingInventoryTypeResult());
    } else if (postBuildingInventoryResult?.result !== null) {
      toast.success(
        `Created a new Material Type "${postBuildingInventoryResult?.result.name}" successfully`,
      );
      dispatch(fetchMaterialTypes());
      dispatch(resetPostBuildingInventoryTypeResult());
    }
  }, [postBuildingInventoryResult]);

  const obj = {
    name: Joi.string()
      .min(3)
      .max(50)
      .required(),
    description: Joi.string()
      .min(10)
      .max(150)
      .required(),
    unit: Joi.optional(),
    customUnit: Joi.string()
      .allow('')
      .optional(),
  };
  const schema = Joi.object(obj).options({ abortEarly: false, allowUnknown: true });

  const validationHandler = (field, value, complete) => {
    let validate;
    let propertySchema;
    let validationErrorFlag = false;
    if (complete) {
      validate = schema.validate(material);
    } else if (field !== 'customUnitCheck' && field !== 'allowNewMeasurement') {
      propertySchema = Joi.object({ [field]: obj[field] });
      validate = propertySchema.validate({ [field]: value });
    }

    if (!material.unit && !material.customUnit) {
      if (complete || field === 'unit' || field === 'customUnit') {
        validations.commonUnit = 'At least one of "unit" or "customUnit" must have a valid value';
        validationErrorFlag = true;
      }
    } else if (material.unit && material.customUnit) {
      if (complete || field === 'unit' || field === 'customUnit') {
        validations.commonUnit = 'Only one of the unit should have a value';
        validationErrorFlag = true;
      }
    } else {
      validations.commonUnit = '';
    }

    if (validate?.error) {
      for (let i = 0; i < validate.error.details.length; i += 1) {
        const errorObj = validate.error.details[i];
        if (errorObj.context.peersWithLabels) {
          for (let j = 0; j < errorObj.context.peersWithLabels.length; j += 1) {
            validations[errorObj.context.peersWithLabels[j]] = errorObj.message;
            validationErrorFlag = true;
          }
        } else validations[errorObj.context.label] = errorObj.message;
        validationErrorFlag = true;
      }
    } else if (!complete) {
      validations[field] = '';
    }

    if (material.customUnit !== '') {
      const _similarityData = [];
      for (let i = 0; i < buildingInventoryUnits.length; i += 1) {
        const similarityPercent = similarity(buildingInventoryUnits[i].unit, material.customUnit);
        // console.log(buildingInventoryUnits[i].unit, similarityPercent)
        if (similarityPercent > 0.5) {
          const simObj = {
            unitFromStore: buildingInventoryUnits[i].unit,
            similarityPercent: similarityPercent * 100,
          };
          _similarityData.push(simObj);
        }
      }
      setSimilarityData([..._similarityData]);
    } else {
      const _similarityData = [];
      setSimilarityData([..._similarityData]);
    }
    if (complete && similarityData.length !== 0 && !material.customUnitCheck) {
      validationErrorFlag = validationErrorFlag || true;
      validations.customUnitCheck = 'Please confirm or select a unit from available ones';
    } else {
      validationErrorFlag = validationErrorFlag || false;
      validations.customUnitCheck = '';
    }

    validations.total = validationErrorFlag;

    setValidations({ ...validations });
    return validationErrorFlag;
  };

  const unitSelectHandler = value => {
    material.customUnit = '';
    material.customUnitCheck = false;
    material.allowNewMeasurement = false;
    material.unit = value;
    setMaterial({ ...material });
  };

  const changeHandler = e => {
    const field = e.target.name;
    const { value } = e.target;
    material[field] = value;
    if (field === 'customUnit') {
      if (value) {
        material.unit = '';
      }
    }
    // if (field === 'unit') {
    //   if (value !== '') {
    //     material.customUnit = '';
    //     material.customUnitCheck = false;
    //     material.allowNewMeasurement = false;
    //   }
    // }
    if (field === 'customUnitCheck' || field === 'allowNewMeasurement') {
      material[field] = e.target.checked;
    }
    setMaterial({ ...material });
    if (field !== null) validationHandler(field, value);
  };

  const submitHandler = () => {
    const error = validationHandler(null, null, true);
    if (!error) {
      // formatted for react-select
      const _material = { ...material };
      _material.unit = material.unit?.value;
      dispatch(postBuildingInventoryType(_material));
    }
  };

  return (
    <div>
      <Container fluid className="materialContainer">
        <div className="materialPage">
          <div className="material">
            <div className="materialTitle">ADD MATERIAL FORM</div>
            <Card>
              <CardBody>
                <Form id="AddMaterialForm">
                  <FormGroup row className="align-items-center justify-content-start">
                    <Label for="" lg={2} sm={4} className="materialFormLabel">
                      Item Type
                    </Label>
                    <Col lg={4} sm={8} className="materialFormValue">
                      <Input
                        id=""
                        name=""
                        type="text"
                        placeholder="Material Name"
                        value="Material"
                        disabled
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row className="align-items-center justify-content-start">
                    <Label for="name" lg={2} sm={4} className="materialFormLabel">
                      Material Name
                    </Label>
                    <Col lg={4} sm={8} className="materialFormValue">
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={material.name}
                        onChange={e => changeHandler(e)}
                        placeholder="Material Name"
                      />
                    </Col>

                    {validations.name !== '' && (
                      <Label for="materialNameErr" sm={12} className="materialFormError">
                        {`Material ${validations.name}`}
                      </Label>
                    )}
                  </FormGroup>

                  <FormGroup row className="align-items-center justify-content-start">
                    <Label for="unit" lg={2} sm={4} className="materialFormLabel">
                      Measurement
                    </Label>
                    <Col lg={4} sm={8}>
                      {/* <Input
                        id="unit"
                        name="unit"
                        type="select"
                        value={material.unit}
                        onChange={e => changeHandler(e)}
                      >
                        <option value="" key="customUnit">
                          --Please select unit--
                        </option>
                        {buildingInventoryUnits?.map(matType => (
                          <option key={matType._id} value={matType.unit}>
                            {matType.unit}
                          </option>
                        ))}
                      </Input> */}

                      <Select
                        id="unit"
                        name="unit"
                        onChange={unitSelectHandler}
                        options={formattedUnits}
                        value={material.unit}
                        defaultValue={formattedUnits[0]}
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup check>
                    <Input
                      id="allowNewMeasurement"
                      name="allowNewMeasurement"
                      type="checkbox"
                      value={material.allowNewMeasurement}
                      checked={material.allowNewMeasurement}
                      onChange={e => changeHandler(e)}
                    />
                    <Label check for="allowNewMeasurement">
                      Please check here if you want to enter a New Measurement. (You can always
                      choose from provided list for better calculations)
                    </Label>
                  </FormGroup>

                  {material.allowNewMeasurement && (
                    <>
                      <FormGroup row className="align-items-center justify-content-start">
                        <Label for="customUnit" lg={2} sm={4} className="materialFormLabel">
                          <div className="d-flex flex-column justify-content-start">
                            New Measurement
                            <br />
                            <i className="materialFormSmallText">
                              Please note that , you can either select a unit from the list or enter
                              a cutom unit of your choice
                            </i>
                          </div>
                        </Label>
                        <Col lg={4} sm={8} className="materialFormValue">
                          <Input
                            id="customUnit"
                            name="customUnit"
                            type="text"
                            placeholder="Material Unit"
                            value={material.customUnit}
                            onChange={e => changeHandler(e)}
                          />
                        </Col>
                        {validations.customUnit !== '' && (
                          <Label for="materialNameErr" sm={12} className="materialFormError">
                            {validations.customUnit}
                          </Label>
                        )}
                      </FormGroup>

                      {similarityData.length !== 0 && (
                        <FormGroup row className="align-items-center justify-content-start">
                          <Label
                            for="similarityCheck"
                            lg={12}
                            sm={12}
                            className="materialFormLabel"
                          >
                            <div className="materialFormText">
                              <div>
                                <i>Found some similar units from store.</i>
                                <br />

                                <FormGroup check>
                                  <Input
                                    id="customUnitCheck"
                                    name="customUnitCheck"
                                    type="checkbox"
                                    value={material.customUnitCheck}
                                    onChange={e => changeHandler(e)}
                                  />
                                  <Label check for="customUnitCheck">
                                    Please confirm if the newly entered unit is different from the
                                    available ones.
                                  </Label>
                                  {validations.customUnitCheck !== '' && (
                                    <Label
                                      for="materialNameErr"
                                      sm={12}
                                      className="materialFormError"
                                    >
                                      {validations.customUnitCheck}
                                    </Label>
                                  )}
                                </FormGroup>
                              </div>
                              <Table bordered striped className="materialMargin">
                                <tbody>
                                  <tr>
                                    <th>Unit</th>
                                    <th>Similarity Percentage to {material.customUnit}</th>
                                  </tr>
                                  {similarityData.map(sim => (
                                    <tr key={sim.unitFromStore}>
                                      <td> {sim.unitFromStore} </td>
                                      <td> {sim.similarityPercent} </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          </Label>
                        </FormGroup>
                      )}
                    </>
                  )}

                  <FormGroup row>
                    {validations.commonUnit !== '' && (
                      <Label for="materialNameErr" sm={12} className="materialFormError">
                        {validations.commonUnit}
                      </Label>
                    )}
                  </FormGroup>

                  <FormGroup row className="align-items-center justify-content-start">
                    <Label for="description" lg={2} sm={4} className="materialFormLabel">
                      Material Description
                    </Label>
                    <Col lg={4} sm={8} className="materialFormValue">
                      <Input
                        id="description"
                        name="description"
                        type="text"
                        placeholder="Material description"
                        value={material.description}
                        onChange={e => changeHandler(e)}
                      />
                    </Col>
                    {validations.description !== '' && (
                      <Label for="materialNameErr" sm={12} className="materialFormError">
                        {`Material ${validations.description}`}
                      </Label>
                    )}
                  </FormGroup>

                  <FormGroup row className="d-flex justify-content-right">
                    <Button onClick={() => submitHandler()} className="materialButtonBg">
                      Add Material
                    </Button>
                  </FormGroup>
                </Form>
              </CardBody>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default AddMaterial;
