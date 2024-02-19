import './UpdateConsumable.css';
import * as moment from 'moment';
import { Container, FormGroup, Input, Label, Form, Col, Button, Table } from 'reactstrap';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
// import { postMaterialUpdate } from '../../../actions/bmdashboard/consumableActions';
import { postConsumableUpdate } from '../../../actions/bmdashboard/consumableActions';
import { toast } from 'react-toastify';

function UpdateConsumable({record, setModal}) {
  // console.log("UPD CONS. record: ", record)

  const dispatch = useDispatch();
  // const postConsumableUpdateResult = useSelector(state => state.consumables.updateConsumables); 
  const postConsumableUpdateResult = useSelector(state => state.bmConsumables.updateConsumables); 
  // consumables not in state at all.
  // state.consumables.updateConsumables needs to be {loading: false, result: null, error: undefined} etc 
  // console.log("@@@ postConsumableUpdateResult: ", postConsumableUpdateResult)

  const { purchaseRecord, stockAvailable, updateRecord: _, ...rest } = record;
  // console.log("purchaseRecord: ", purchaseRecord, ". stockAvailable: ", stockAvailable)
  const recordInitialState = {
    date: moment(new Date()).format('YYYY-MM-DD'),
    quantityUsed: 0,
    quantityWasted: 0,
    QtyUsedLogUnit: 'unit',
    QtyWastedLogUnit: 'unit',
    consumable: rest,
    newAvailable: undefined,
  };
  const validationsInitialState = {
    quantityUsed: '',
    quantityWasted: '',
    quantityTogether: '',
  };
  const [updateRecord, setUpdateRecord] = useState(recordInitialState);
  const [validations, setValidations] = useState(validationsInitialState);
  const [availableCount, setAvailableCount ] = useState(undefined);

  useEffect(() => {
    // console.log("FIRST LOAD. updateRecord and validations set to emty objects")
    setUpdateRecord({ ...recordInitialState });
    setValidations({ ...validationsInitialState });
  }, []); //used to be cancel in Matl's

  useEffect(() => {
    // console.log("useEff, postConsumableUpdateResult changed: ",postConsumableUpdateResult)
    if (postConsumableUpdateResult.loading === false && postConsumableUpdateResult.error === true) {
      console.log("error in postConsumableUpdateResult")
      toast.error(`${postConsumableUpdateResult.result}`);
      setModal(false);
    } else if (
      postConsumableUpdateResult.loading === false &&
      postConsumableUpdateResult.result !== null
    ) {
      toast.success(`Updated ${record?.itemType?.name} successfully`);
      setModal(false);
    }
  }, [postConsumableUpdateResult]);

  useEffect(()=>{
    // console.log("useEff, updateRecord changed: ",updateRecord)
    // if(updateRecord.quantityUsed || updateRecord.quantityWasted){
    //   console.log("updateRecord changed with truthy values")
    
    // validate(updateRecord.quantityUsed,
    //   updateRecord.quantityWasted,
    //       updateRecord.QtyUsedLogUnit,
    //       updateRecord.QtyWastedLogUnit);
    
    // }

  },[updateRecord]);

  const validate = (_qtyUsed, _qtyWasted, QtyUsedLogUnit, QtyWastedLogUnit) => {
    // console.log("VALIDATE called")
    // console.log("_qtyUsed: ", _qtyUsed, ", _qtyWasted: ", _qtyWasted, ", QtyUsedLogUnit: ", QtyUsedLogUnit, ", QtyWastedLogUnit: ", QtyWastedLogUnit)
    const qtyUsed = _qtyUsed === '' ? 0 : _qtyUsed;
    const qtyWasted = _qtyWasted === '' ? 0 : _qtyWasted;
    const available = record?.stockAvailable; //replace with stockAvailable 
    let valUsed = +qtyUsed; //is plus really necessary? test w/ and w/o
    let valWasted = +qtyWasted; //coercion to number?
    // console.log("COERCED _qtyUsed: ", _qtyUsed, ", _qtyWasted: ", _qtyWasted, ", valUsed: ", valUsed, ", valWasted: ", valWasted, ", available: ", available)
    if (QtyUsedLogUnit === 'percent') {
      valUsed = (+qtyUsed / 100) * available;  //replace with stockAvailable 
      // console.log("QtyUsedLogUnit is %. valUsed: ", valUsed);
    }
    if (QtyWastedLogUnit === 'percent') {
      valWasted = (+qtyWasted / 100) * available;  //replace with stockAvailable when done testing validation UI
      // console.log("QtyWastedLogUnit is %. valUsed: ", valWasted);
    }
    valUsed = Number.parseFloat(valUsed.toFixed(4));
    valWasted = Number.parseFloat(valWasted.toFixed(4));

    const tempValidations = { ...validations };
    
    if (valUsed > available) {  //replace with stockAvailable  
      tempValidations.quantityUsed = 'Quantity Used exceeds the available stock';
    } else {
      tempValidations.quantityUsed = '';
    }

    if (valWasted > available) { //replace with stockAvailable 
      tempValidations.quantityWasted = 'Quantity Wasted exceeds the available stock';
    } else {
      tempValidations.quantityWasted = '';
    }

    if (valUsed + valWasted > available) { //replace with stockAvailable 
      tempValidations.quantityTogether = `Sum of Used and Wasted values exceeds available stock with a value of ${valUsed +
        valWasted}`;
    } else {
      tempValidations.quantityTogether = '';
    }
    console.log("tempValidations: ", tempValidations)
    setValidations({ ...tempValidations }); //test to see if this works the same way 

    let newAvailable = available - (valUsed + valWasted);
    console.log("newAvailable: ", newAvailable)

    if (newAvailable !== available) {
      newAvailable = Number.parseFloat(newAvailable.toFixed(4));
      setAvailableCount(newAvailable);
      // const tempRecord = { ...updateRecord };
      // tempRecord.newAvailable = newAvailable; //rewrite this to only update on field
      // console.log("tempRecord that updates newAvailable: ", tempRecord)
      // setUpdateRecord({ ...tempRecord });
    } else {
      setAvailableCount(newAvailable);
      // const tempRecord = { ...updateRecord };
      // tempRecord.newAvailable = '';
      // setUpdateRecord({ ...tempRecord });
    }
  };

  const submitHandler = e => {
    e.preventDefault();
    console.log("updateRecord to POST to the backend: ", updateRecord)
    // dispatch(postConsumableUpdate(updateRecord));
  };


  const changeRecordHandler = e => {
    const { value, name } = e.target; //convert value to Number! 
    // const name = e.target.name;
    // const value = Number(e.target.value)
    if (e.target.name === 'quantityWasted' || e.target.name === 'quantityUsed') {
      //some decimal check here that I dont think did anything. Is any of this necessary? Selector wont go lover than 0 thanks to Reactstrap
      if (Number(value) < 0) return;
    }
    const tempRecord = { ...updateRecord } //ALL THIS WORKS TOO, perfectly fine JS...
    tempRecord[name] = value;
    // setUpdateRecord(tempRecord)
//ALSO WORKS
    // const tempRecord = {[name]: value}
    // console.log("tempRecord updated: ", tempRecord)
    // setUpdateRecord((prevValue)=>{return {...prevValue, ...tempRecord}})

    // updateRecord[e.target.name] = value;

    validate(
      tempRecord.quantityUsed,
      tempRecord.quantityWasted,
      tempRecord.QtyUsedLogUnit,
      tempRecord.QtyWastedLogUnit,
    );

    // setUpdateRecord((prevValue)=>{
    //   return {...prevValue, ...tempRecord}
    // })
    setUpdateRecord(tempRecord);


    // if (e.target.name === 'quantityUsed') {
    //   validate(
    //     e.target.value,
    //     updateRecord.quantityWasted,
    //     updateRecord.QtyUsedLogUnit,
    //     updateRecord.QtyWastedLogUnit,
    //   );
    // } else if (e.target.name === 'quantityWasted') {
    //   validate(
    //     updateRecord.quantityUsed,
    //     e.target.value,
    //     updateRecord.QtyUsedLogUnit,
    //     updateRecord.QtyWastedLogUnit,
    //   );
    // } // unit change
    // else if (e.target.name === 'QtyUsedLogUnit') {
    //   validate(
    //     updateRecord.quantityUsed,
    //     updateRecord.quantityWasted,
    //     e.target.value,
    //     updateRecord.QtyWastedLogUnit,
    //   );
    // } else if (e.target.name === 'QtyWastedLogUnit') {
    //   validate(
    //     updateRecord.quantityUsed,
    //     updateRecord.quantityWasted,
    //     updateRecord.QtyUsedLogUnit,
    //     e.target.value,
    //   );
    // }

  }

  return (
        <Container fluid className="updateConsumableContainer">
       <div className="updateConsumablePage">
          <div className="updateConsumable">
          <Form>
            <FormGroup row className="align-items-center justify-content-start">
              <Label for="updateConsumableName" sm={4} className="consumableFormLabel">
               Consumable
              </Label>
              <Col sm={6} className="consumableFormValue">
                <b>{record?.itemType?.name}</b>
              </Col>
            </FormGroup>

            <FormGroup row className="align-items-center">
              <Label for="updateConsumableProject" sm={4} className="consumableFormLabel">
                Project Name
              </Label>
              <Col sm={8} className="consumableFormValue">
                {record?.project.name}
              </Col>
            </FormGroup>



            <FormGroup row className="align-items-center justify-content-start">
              <Label for="updateConsumableDate" sm={4} className="consumableFormLabel">
                Date
              </Label>
              <Col sm={6} className="consumableFormValue">
                <Input
                  id="updateConsumableDate"
                  name="date"
                  type="date"
                  value={updateRecord.date}
                  disabled
                />
              </Col>
            </FormGroup>

            <FormGroup row className="align-items-center justify-content-start">
              <Label for="updateConsumableUnit" sm={4} className="consumableFormLabel">
                Available
              </Label>
              <Col sm={6} className="consumableFormValue">
                {record?.stockAvailable}
              </Col>
            </FormGroup>

    {availableCount !== undefined &&  <FormGroup row className="align-items-center justify-content-start">
                <Label for="updateMaterialUnit" sm={4} className="consumableFormLabel">
                  New Available
                </Label>
                <Col sm={6} className="consumableFormValue">
                  <span
                    className={updateRecord.newAvailable < 0 ? 'consumableFormErrorClr' : undefined}
                  >
                    {availableCount}
                  </span>
                </Col>
              </FormGroup>}
            
            {/* {updateRecord.newAvailable !== undefined && (
              <FormGroup row className="align-items-center justify-content-start">
                <Label for="updateMaterialUnit" sm={4} className="materialFormLabel">
                  New Available
                </Label>
                <Col sm={6} className="materialFormValue">
                  <span
                    className={updateRecord.newAvailable < 0 ? 'materialFormErrorClr' : undefined}
                  >
                    {updateRecord.newAvailable}
                  </span>
                </Col>
              </FormGroup>
            )} */}

            <FormGroup row>
              <Label for="updateConsumableQuantityUsed" sm={4} className="consumableFormLabel">
                Quantity Used
              </Label>
              <Col sm={4} className="consumableFormValue">
                <Input
                  id="updateConsumableQuantityUsed"
                  name="quantityUsed"
                  placeholder="Used"
                  type="number"
                  value={updateRecord.quantityUsed}
                  onChange={e => changeRecordHandler(e)}
                  min={0}
                />
              </Col>
              <Col sm={{ size: 4 }} className="consumableFormValue">
                <Input
                  id="updateConsumableQtyUsedLogUnitSelect"
                  name="QtyUsedLogUnit"
                  type="select"
                  value={updateRecord.QtyUsedLogUnit}
                  onChange={e => changeRecordHandler(e)}
                >
                  <option value="unit">{record?.itemType?.unit}</option>
                  <option value="percent">%</option>
                </Input>
              </Col>

              {validations.quantityUsed !== '' && (
                <Label for="updateMaterialQuantityUsedError" sm={12} className="consumableFormError">
                  {validations.quantityUsed}
                </Label>
              )}
            </FormGroup>

            <FormGroup row>
              <Label for="updateConsumablequantityWasted" sm={4} className="consumableFormLabel">
                Quantity Wasted
              </Label>
              <Col sm={4} className="consumableFormValue">
                <Input
                  id="updateConsumablequantityWasted"
                  name="quantityWasted"
                  type="number"
                  placeholder="Wasted"
                  value={updateRecord.quantityWasted}
                  onChange={e => changeRecordHandler(e)}
                  min={0}
                />
              </Col>
              <Col sm={{ size: 4 }} className="consumableFormValue">
                <Input
                  id="updateConsumableQtyWastedLogUnitSelect"
                  name="QtyWastedLogUnit"
                  type="select"
                  value={updateRecord.QtyWastedLogUnit}
                  onChange={e => changeRecordHandler(e)}
                >
                  <option value="unit">{record?.itemType?.unit}</option>
                  <option value="percent">%</option>
                </Input>
              </Col>
              {validations.quantityWasted !== '' && (
                <Label
                  for="updateConsumableQuantityWastedError"
                  sm={12}
                  className="consumableFormError"
                >
                  {validations.quantityWasted}
                </Label>
              )}
            </FormGroup>
{/* ONLY ENABLE THIS WHEN VALIDATIONS FOR THE INDIVIDUAL FIELDS ARE CLEAR */}
            {validations.quantityTogether !== '' &&
              validations.quantityUsed === '' &&
              validations.quantityWasted === '' && (
              <FormGroup row>
                <Label
                  for="updateConsumableQuantityTogetherError"
                  sm={12}
                  className="consumableFormError"
                >
                  {validations.quantityTogether}
                </Label>
              </FormGroup>
            )}

            <FormGroup row className="d-flex justify-content-right">
              <Button
                disabled={postConsumableUpdateResult.loading || availableCount < 0}
                className="consumableButtonBg"
                onClick={e => submitHandler(e)}
              >
                Update Consumable
              </Button>
            </FormGroup>

            </Form>
            </div>
          </div>
          </Container>
)}

export default UpdateConsumable;
