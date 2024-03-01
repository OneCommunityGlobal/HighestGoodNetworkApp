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
  postBuildingReusableInventoryType,
  resetPostBuildingInventoryTypeResult,
} from 'actions/bmdashboard/invTypeActions';
import { fetchInvUnits } from 'actions/bmdashboard/invUnitActions';

import { similarity } from './SimilarityCheck';

function AddReusable() {
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
      dispatch(postBuildingReusableInventoryType(_material));
    }
  };

  return (
    <div>
      <Container fluid className="materialContainer">
        <div className="materialPage">
          <div className="material">
            <div className="materialTitle">ADD REUSABLE FORM</div>
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
                        value="Reusable"
                        disabled
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row className="align-items-center justify-content-start">
                    <Label for="name" lg={2} sm={4} className="materialFormLabel">
                      Reusable Name
                    </Label>
                    <Col lg={4} sm={8} className="materialFormValue">
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={material.name}
                        onChange={e => changeHandler(e)}
                        placeholder="Reusable Name"
                      />
                    </Col>

                    {validations.name !== '' && (
                      <Label for="materialNameErr" sm={12} className="materialFormError">
                        {`Material ${validations.name}`}
                      </Label>
                    )}
                  </FormGroup>

                  <FormGroup row>
                    {validations.commonUnit !== '' && (
                      <Label for="materialNameErr" sm={12} className="materialFormError">
                        {validations.commonUnit}
                      </Label>
                    )}
                  </FormGroup>

                  <FormGroup row className="align-items-center justify-content-start">
                    <Label for="description" lg={2} sm={4} className="materialFormLabel">
                      Reusable Description
                    </Label>
                    <Col lg={4} sm={8} className="materialFormValue">
                      <Input
                        id="description"
                        name="description"
                        type="text"
                        placeholder="Reusable description"
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
                      Add Reusable
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

export default AddReusable;
