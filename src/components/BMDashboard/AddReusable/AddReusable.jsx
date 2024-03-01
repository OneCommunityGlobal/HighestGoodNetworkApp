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
} from 'reactstrap';
import './AddMaterial.css';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useState } from 'react';
import Joi from 'joi';
import { toast } from 'react-toastify';
import {
  fetchReusableTypes,
  postBuildingReusableInventoryType,
  resetPostBuildingInventoryTypeResult,
} from 'actions/bmdashboard/invTypeActions';

//TODO(Yan): consider make this into a reusable component
//TODO(Yan): change material to reusbale
function AddReusable() {
  const dispatch = useDispatch();
  //TODO(Yan): since all needs state.bmInvTypes.postedResult, fetchReusableTypes? fetchMaterialTypes? should I merge into one?
  const postBuildingInventoryResult = useSelector(state => state.bmInvTypes.postedResult);

  const [material, setMaterial] = useState({
    name: '',
    description: '',
    allowNewMeasurement: false,
  });
  const [validations, setValidations] = useState({
    name: '',
    unit: '',
    description: '',
    total: true,
  });

  useEffect(() => {
    dispatch(fetchReusableTypes());
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

    if (validate?.error) {
      //TODO(Yan): double for loop?
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

  const changeHandler = e => {
    const field = e.target.name;
    const { value } = e.target;
    material[field] = value;
    setMaterial({ ...material });
    if (field !== null) validationHandler(field, value);
  };

  const submitHandler = () => {
    dispatch(postBuildingReusableInventoryType(material));
    //TODO(Yan): which should you use?

    // const error = validationHandler(null, null, true);
    // if (!error) {
    //   const _material = { ...material };
    //   dispatch(postBuildingReusableInventoryType(_material));
    // }
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
