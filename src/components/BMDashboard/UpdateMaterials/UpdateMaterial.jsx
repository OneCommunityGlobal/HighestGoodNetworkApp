import React from 'react';
import './UpdateMaterial.css'
import { Container } from 'reactstrap'
import * as moment from 'moment'
import { FormGroup, Input, Label, Form, Row, Col, Button, FormText } from 'reactstrap';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { postMaterialUpdate, resetMaterialUpdate } from 'actions/bmdashboard/materialsActions'
import { toast } from 'react-toastify'

function UpdateMaterial({ record, bulk, idx, sendUpdatedRecord, cancel, setModal }) {

  const dispatch = useDispatch();
  const postMaterialUpdateResult = useSelector(state => state.updateMaterials)

  useEffect(() => {
    if (postMaterialUpdateResult.loading == false && postMaterialUpdateResult.error == true) {
      toast.error(`${postMaterialUpdateResult.result}`);
      dispatch(resetMaterialUpdate())
      setModal(false);
    }
    else if (postMaterialUpdateResult.loading == false && postMaterialUpdateResult.result != null) {
      toast.success(`Updated ${record?.itemType?.name} successfully`);
      dispatch(resetMaterialUpdate())
      setModal(false);
    }
  }, [postMaterialUpdateResult])

  const { purchaseRecord, ['updateRecord']: _, ...rest } = record;
  let recordInitialState = {
    date: moment(new Date()).format('YYYY-MM-DD'),
    quantityUsed: 0,
    quantityWasted: 0,
    QtyUsedLogUnit: 'unit',
    QtyWastedLogUnit: 'unit',
    material: rest,
    newAvailable: undefined
  }
  let validationsInitialState = {
    quantityUsed: '',
    quantityWasted: '',
    quantityTogether: ''
  }
  const [updateRecord, setUpdateRecord] = useState(recordInitialState)

  useEffect(() => {
    setUpdateRecord({ ...recordInitialState })
    setValidations({ ...validationsInitialState })
  }, [cancel])

  const [validations, setValidations] = useState(validationsInitialState)

  const changeRecordHandler = (e) => {
    let value = e.target.value;
    if (e.target.name == 'quantityWasted' || e.target.name == 'quantityUsed') {
      if (value.match(/\./g)) {
        const [, decimal] = value.split('.');
        if (decimal?.length > 2) {
          //value = Number(value).toFixed(2);
          return;
        }
      }
      if (Number(value) < 0) return;
    }

    updateRecord[e.target.name] = value;


    if (e.target.name == 'quantityUsed') {
      validate(e.target.value, updateRecord.quantityWasted, updateRecord.QtyUsedLogUnit, updateRecord.QtyWastedLogUnit)
    }
    else if (e.target.name == 'quantityWasted') {
      validate(updateRecord.quantityUsed, e.target.value, updateRecord.QtyUsedLogUnit, updateRecord.QtyWastedLogUnit)
    }
    else //unit change
    {
      if (e.target.name == 'QtyUsedLogUnit') {
        validate(updateRecord.quantityUsed, updateRecord.quantityWasted, e.target.value, updateRecord.QtyWastedLogUnit)
      }
      else if (e.target.name == 'QtyWastedLogUnit') {
        validate(updateRecord.quantityUsed, updateRecord.quantityWasted, updateRecord.QtyUsedLogUnit, e.target.value)
      }
    }
  }

  const validate = (qtyUsed, qtyWasted, QtyUsedLogUnit, QtyWastedLogUnit) => {

    qtyUsed == '' ? 0 : qtyUsed;
    qtyWasted == '' ? 0 : qtyWasted;
    let available = record?.stockAvailable;
    let valUsed = +qtyUsed;
    let valWasted = +qtyWasted;
    if (QtyUsedLogUnit == 'percent') {
      valUsed = (+qtyUsed / 100) * available;
    }
    if (QtyWastedLogUnit == 'percent') {
      valWasted = (+qtyWasted / 100) * available;
    }

    valUsed = Number.parseFloat((valUsed).toFixed(4))
    valWasted = Number.parseFloat((valWasted).toFixed(4))
    if (valUsed > available) {
      validations.quantityUsed = "Quantity Used exceeds the available stock";
    }
    else {
      validations.quantityUsed = "";
    }

    if (valWasted > available) {
      validations.quantityWasted = "Quantity Wasted exceeds the available stock";
    }
    else {
      validations.quantityWasted = "";
    }

    if ((valUsed + valWasted) > available) {
      validations.quantityTogether = `Sum of Used and Wasted values exceeds available stock with a value of ${valUsed + valWasted}`;
    }
    else {
      validations.quantityTogether = "";
    }
    setValidations({ ...validations })
    let newAvailable = available - (valUsed + valWasted);

    if (newAvailable != available) {
      newAvailable = Number.parseFloat((newAvailable).toFixed(4))
      updateRecord.newAvailable = newAvailable
      setUpdateRecord({ ...updateRecord });
    }
    else {
      updateRecord.newAvailable = ''
      setUpdateRecord({ ...updateRecord });
    }
    if (bulk == true) sendUpdatedRecord(updateRecord, validations)
  }

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(postMaterialUpdate(updateRecord));
  }

  return (
    < >
      {
        bulk == true ?
          <>
            <tr key={record._id}>
              <td >   {record.project.name}  </td>
              <td>  {record.itemType.name}  </td>
              <td>  {record.stockAvailable} </td>
              <td>
                <Input
                  id="updateMaterialQuantityUsed"
                  name="quantityUsed"
                  placeholder="Used"
                  type="number"
                  value={updateRecord.quantityUsed}
                  onChange={(e) => changeRecordHandler(e)}
                  min={0}
                />
                {
                  validations.quantityUsed != ""
                  &&
                  <div className='materialFormTableError'>
                    {validations.quantityUsed}
                  </div>
                }
              </td>
              <td>
                <Input
                  id="updateMaterialQtyUsedLogUnitSelect"
                  name="QtyUsedLogUnit"
                  type="select"
                  value={updateRecord.QtyUsedLogUnit}
                  onChange={(e) => changeRecordHandler(e)}
                >
                  <option value='unit'>{record?.itemType?.unit}</option>
                  <option value='percent'>%</option>
                </Input>
              </td>
              <td>
                <Input
                  id="updateMaterialquantityWasted"
                  name="quantityWasted"
                  type="number"
                  placeholder='Wasted'
                  value={updateRecord.quantityWasted}
                  onChange={(e) => changeRecordHandler(e)}
                  min={0}
                />
                {
                  validations.quantityWasted != ""
                  &&
                  <div className='materialFormTableError'>
                    {validations.quantityWasted}
                  </div>
                }

              </td>
              <td>
                <Input
                  id="updateMaterialQtyWastedLogUnitSelect"
                  name="QtyWastedLogUnit"
                  type="select"
                  value={updateRecord.QtyWastedLogUnit}
                  onChange={(e) => changeRecordHandler(e)}
                >
                  <option value='unit'>{record?.itemType?.unit}</option>
                  <option value='percent'>%</option>
                </Input>
              </td>
              <td>
                <span className={updateRecord.newAvailable < 0 ? 'materialFormErrorClr' : undefined}>
                  {updateRecord.newAvailable}
                </span>
              </td>
            </tr>
            <tr >
              <td colSpan={7} className='materialFormTableError'>

                {validations.quantityTogether}

              </td>
            </tr>

          </> :
          <Container fluid className='updateMaterialContainer'>
            <div className='updateMaterialPage'>
              <div className='updateMaterial'>
                <Form>

                  {/* <img className='materialImage' alt='materialImage' src={riversand} /> */}
                  <FormGroup row className='align-items-center justify-content-start'>
                    <Label
                      for="updateMaterialName"
                      sm={4}
                      className='materialFormLabel'
                    >
                      Material
                    </Label>
                    <Col sm={6} className='materialFormValue'>
                      <b>{record?.itemType?.name}</b>
                    </Col>
                  </FormGroup>

                  <FormGroup row className='align-items-center'>
                    <Label
                      for="updateMaterialProject"
                      sm={4}
                      className='materialFormLabel'
                    >
                      Project Name
                    </Label>
                    <Col sm={8} className='materialFormValue'>
                      {record?.project.name}
                    </Col>
                  </FormGroup>

                  <FormGroup row className='align-items-center justify-content-start'>
                    <Label
                      for="updateMaterialDate"
                      sm={4}
                      className='materialFormLabel'
                    >
                      Date
                    </Label>
                    <Col sm={6} className='materialFormValue'>
                      <Input
                        id="updateMaterialDate"
                        name="date"
                        type="date"
                        value={updateRecord.date}
                        disabled={true}
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup row className='align-items-center justify-content-start'>
                    <Label
                      for="updateMaterialUnit"
                      sm={4}
                      className='materialFormLabel'
                    >
                      Available
                    </Label>
                    <Col sm={6} className='materialFormValue'>
                      {record?.stockAvailable}
                    </Col>
                  </FormGroup>

                  {
                    updateRecord.newAvailable != undefined &&
                    <FormGroup row className='align-items-center justify-content-start'>
                      <Label
                        for="updateMaterialUnit"
                        sm={4}
                        className='materialFormLabel'
                      >
                        New Available
                      </Label>
                      <Col sm={6} className='materialFormValue'>

                        <span className={updateRecord.newAvailable < 0 ? 'materialFormErrorClr' : undefined}>
                          {updateRecord.newAvailable}
                        </span>
                      </Col>
                    </FormGroup>
                  }

                  <FormGroup row>
                    <Label
                      for="updateMaterialQuantityUsed"
                      sm={4}
                      className='materialFormLabel'
                    >
                      Quantity Used
                    </Label>
                    <Col sm={4} className='materialFormValue'>
                      <Input
                        id="updateMaterialQuantityUsed"
                        name="quantityUsed"
                        placeholder="Used"
                        type="number"
                        value={updateRecord.quantityUsed}
                        onChange={(e) => changeRecordHandler(e)}
                        min={0}
                      />
                    </Col>
                    <Col sm={{ size: 4 }} className='materialFormValue'>
                      <Input
                        id="updateMaterialQtyUsedLogUnitSelect"
                        name="QtyUsedLogUnit"
                        type="select"
                        value={updateRecord.QtyUsedLogUnit}
                        onChange={(e) => changeRecordHandler(e)}
                      >
                        <option value='unit'>{record?.itemType?.unit}</option>
                        <option value='percent'>%</option>
                      </Input>
                    </Col>

                    {
                      validations.quantityUsed != ""
                      &&
                      <Label
                        for="updateMaterialQuantityUsedError"
                        sm={12}
                        className='materialFormError'
                      >
                        {validations.quantityUsed}
                      </Label>
                    }

                  </FormGroup>
                  <FormGroup row>
                    <Label
                      for="updateMaterialquantityWasted"
                      sm={4}
                      className='materialFormLabel'
                    >
                      Quantity Wasted
                    </Label>
                    <Col sm={4} className='materialFormValue'>
                      <Input
                        id="updateMaterialquantityWasted"
                        name="quantityWasted"
                        type="number"
                        placeholder='Wasted'
                        value={updateRecord.quantityWasted}
                        onChange={(e) => changeRecordHandler(e)}
                        min={0}
                      />
                    </Col>
                    <Col sm={{ size: 4 }} className='materialFormValue'>
                      <Input
                        id="updateMaterialQtyWastedLogUnitSelect"
                        name="QtyWastedLogUnit"
                        type="select"
                        value={updateRecord.QtyWastedLogUnit}
                        onChange={(e) => changeRecordHandler(e)}
                      >
                        <option value='unit'>{record?.itemType?.unit}</option>
                        <option value='percent'>%</option>
                      </Input>
                    </Col>
                    {
                      validations.quantityWasted != ""
                      &&
                      <Label
                        for="updateMaterialQuantityWastedError"
                        sm={12}
                        className='materialFormError'
                      >
                        {validations.quantityWasted}
                      </Label>
                    }

                  </FormGroup>


                  {
                    validations.quantityTogether != ""
                    &&
                    <FormGroup row>
                      <Label
                        for="updateMaterialQuantityTogetherError"
                        sm={12}
                        className='materialFormError'
                      >
                        {validations.quantityTogether}
                      </Label>
                    </FormGroup>
                  }


                  <FormGroup row className='d-flex justify-content-right'>
                    <Button disabled={postMaterialUpdateResult.loading || (updateRecord.newAvailable < 0)}
                      className='materialButtonBg' onClick={(e) => submitHandler(e)}>
                      Update Material
                    </Button>
                  </FormGroup>
                </Form>
              </div>
            </div>
          </Container>
      }
    </>
  )
}

export default UpdateMaterial
