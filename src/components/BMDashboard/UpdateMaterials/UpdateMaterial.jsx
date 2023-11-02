import React from 'react'
import riversand from './riversand.jpg'
import './UpdateMaterial.css'
import { Container } from 'reactstrap'
import * as moment from 'moment'
import { FormGroup, Input, Label, Form, Row, Col, Button, FormText } from 'reactstrap';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchUserActiveBMProjects, postMaterialUpdate, resetMaterialUpdate } from 'actions/bmdashboard/materialsActions'
import { toast } from 'react-toastify'
import { update } from 'lodash'

function UpdateMaterial({ record }) {

  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects.projects)
  const postMaterialUpdateResult = useSelector(state => state.updateMaterials)
  useEffect(() => {
    dispatch(fetchUserActiveBMProjects())
  }, [])

  useEffect(() => {
    if (postMaterialUpdateResult.loading == false && postMaterialUpdateResult.result != null) {
      toast.success(`Updated ${record?.inventoryItemType?.name} successfully`);
      dispatch(resetMaterialUpdate())
    }
  }, [postMaterialUpdateResult])


  const [updateRecord, setUpdateRecord] = useState({
    date: moment(new Date()).format('YYYY-MM-DD'),
    quantityUsed: 0,
    quantityWasted: 0,
    QtyUsedLogUnit: 'unit',
    QtyWastedLogUnit: 'unit',
    material: record
  })

  const [validations, setValidations] = useState({
    quantityUsed: '',
    quantityWasted: '',
    quantityTogether: ''
  })

  const changeRecordHandler = (e) => {
    setUpdateRecord({ ...updateRecord, [e.target.name]: e.target.value });
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

    let available = record.stockAvailable;
    let valUsed = +qtyUsed;
    let valWasted = +qtyWasted;
    if (QtyUsedLogUnit == 'percent') {
      valUsed = (+qtyUsed / 100) * available;
    }
    if (QtyWastedLogUnit == 'percent') {
      valWasted = (+qtyWasted / 100) * available;
    }

    if (valUsed > record?.stockAvailable) {
      validations.quantityUsed = "Please enter a value less than available stock for Quantity Used";
    }
    else {
      validations.quantityUsed = "";
    }

    if (valWasted > record?.stockAvailable) {
      validations.quantityWasted = "Please enter a value less than available stock for Quantity Wasted";
    }
    else {
      validations.quantityWasted = "";
    }

    if ((valUsed + valWasted) > record?.stockAvailable) {
      validations.quantityTogether = `Please check your Used and Wasted values. They exceed the available stock which sums up to around ${valUsed + valWasted}`;
    }
    else {
      validations.quantityTogether = "";
    }
    setValidations({ ...validations })
  }

  const submitHandler = (e) => {
    e.preventDefault();
    //console.log(updateRecord)
    dispatch(postMaterialUpdate(updateRecord))
  }

  return (
    <div >
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
                  <b>{record?.inventoryItemType?.name}</b>
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
                  {record?.project.projectName}
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
                    value={updateRecord.action}
                    onChange={(e) => changeRecordHandler(e)}
                  >
                    <option value='unit'>{record?.inventoryItemType?.uom}</option>
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
                    <option value='unit'>{record?.inventoryItemType?.uom}</option>
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
                <Button disabled={postMaterialUpdateResult.loading} className='materialButtonBg' onClick={(e) => submitHandler(e)}>
                  Update Material
                </Button>
              </FormGroup>
            </Form>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default UpdateMaterial
