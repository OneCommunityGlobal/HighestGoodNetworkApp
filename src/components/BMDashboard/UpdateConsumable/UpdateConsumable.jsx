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

  const { purchaseRecord, stockAvailable, updateRecord: _, ...rest } = record;
  // console.log("purchaseRecord: ", purchaseRecord, ". stockAvailable: ", stockAvailable)
  const recordInitialState = {
    date: moment(new Date()).format('YYYY-MM-DD'),
    quantityUsed: '0',
    quantityWasted: '0',
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
  const [availableCount, setAvailableCount] = useState(undefined);
  const [changeOccured, setChangeOccured] = useState(false);

  useEffect(() => {
    setUpdateRecord({ ...recordInitialState });
    setValidations({ ...validationsInitialState });
  }, []); 

  useEffect(() => {
    // console.log("useEff, postConsumableUpdateResult changed: ",postConsumableUpdateResult)
    if (postConsumableUpdateResult.loading === false && postConsumableUpdateResult.error === true) {
      // console.log("error in postConsumableUpdateResult")
      console.log("postConsumableUpdateResult.result (err case): ", postConsumableUpdateResult.result)
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
    console.log("updateRecord: ", updateRecord)
    if(updateRecord.quantityUsed !== "0" || updateRecord.quantityWasted !== "0"){
      setChangeOccured(true); 
    }else{
      setChangeOccured(false); 
    }
  },[updateRecord]);

  // useEffect(()=>{
  //   console.log("changeOccured: ", changeOccured)
  // },[changeOccured])

  const validate = (_qtyUsed, _qtyWasted, QtyUsedLogUnit, QtyWastedLogUnit) => {
  
    let unitsUsed = _qtyUsed === '' ? 0 : parseFloat(_qtyUsed);
    let unitsWasted = _qtyWasted === '' ? 0 : parseFloat(_qtyWasted);
    if(QtyUsedLogUnit === "percent"){
      unitsUsed = (stockAvailable / 100) * unitsUsed;
    }

    if(QtyWastedLogUnit === "percent"){
      unitsWasted = (stockAvailable / 100) * unitsWasted;
    }
    const tempValidations = { ...validations };


    if (unitsUsed > stockAvailable){
      tempValidations.quantityUsed = 'Quantity Used exceeds the available stock';
    } else {
      tempValidations.quantityUsed = '';
    }

    if (unitsWasted > stockAvailable){
      tempValidations.quantityWasted = 'Quantity Wasted exceeds the available stock';
    } else {
      tempValidations.quantityWasted = '';
    }

    if (unitsUsed + unitsWasted > stockAvailable){
      tempValidations.quantityTogether = `Sum of Used and Wasted values exceeds available stock with a value of ${unitsUsed +
        unitsWasted}`;
    } else {
      tempValidations.quantityTogether = '';
    }

    setValidations({ ...tempValidations }); 
    const newAvailable = stockAvailable - (unitsUsed + unitsWasted)
    setAvailableCount(newAvailable);
  };

  const submitHandler = e => {
    // e.preventDefault(); //necessary?

    console.log("updateRecord to POST to the backend: ", updateRecord)
    if(validations.quantityUsed === '' &&
        validations.quantityWasted === '' &&
        validations.quantityTogether === '' &&
        changeOccured
        ){
          const postObject = {//might not be wort it, just post updateRecord? do conversion on the backend though
            date: updateRecord.date,
            quantityUsed: updateRecord.quantityUsed === ''? 0 : parseFloat(updateRecord.quantityUsed),
            QtyUsedLogUnit: updateRecord.QtyUsedLogUnit,
            quantityWasted: updateRecord.quantityWasted === '' ? 0 : parseFloat(updateRecord.quantityWasted),
            QtyWastedLogUnit: updateRecord.QtyWastedLogUnit,
            stockAvailable: stockAvailable,
            consumable: updateRecord.consumable,

          };
          console.log("postObject: ", postObject)
          dispatch(postConsumableUpdate(postObject));//works fine
        }else{
          toast.error("Invalid Data");
        };  
  };


  const changeRecordHandler = e => {
    const { value, name } = e.target; 
    const tempRecord = { ...updateRecord } 
    tempRecord[name] = value;

    setUpdateRecord(tempRecord);

    validate(
      tempRecord.quantityUsed,
      tempRecord.quantityWasted,
      tempRecord.QtyUsedLogUnit,
      tempRecord.QtyWastedLogUnit,
    );
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
                disabled={postConsumableUpdateResult.loading || availableCount < 0 || changeOccured === false}
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
