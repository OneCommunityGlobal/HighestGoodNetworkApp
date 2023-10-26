import React from 'react'
import riversand from './riversand.jpg'
import './UpdateMaterial.css'
import { Container } from 'reactstrap'
import * as moment from 'moment'
import { FormGroup, Input, Label, Form, Row, Col, Button, FormText } from 'reactstrap';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchUserActiveBMProjects } from 'actions/bmdashboard/materialsActions'

function UpdateMaterial({ record }) {

  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects.projects)
  useEffect(() => {
    dispatch(fetchUserActiveBMProjects())
  }, [])

  const [updateRecord, setUpdateRecord] = useState({
    date: moment(new Date()).format('YYYY-MM-DD'),
    quantity: '',
    action: '',
    cause: '',
    description: '',
    transferTo: ''
  })

  const changeRecordHandler = (e) => {
    setUpdateRecord({ ...updateRecord, [e.target.name]: e.target.value })
  }

  const submitHandler = (e) => {
    e.preventDefault();
    console.log(updateRecord)
  }

  return (
    <div >
      <Container fluid className='updateMaterialContainer'>
        <div className='updateMaterialPage'>
          <div className='updateMaterial'>
            <Form>

              <img className='materialImage' alt='materialImage' src={riversand} />
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

              <FormGroup row className='align-items-center justify-content-start'>
                <Label
                  for="updateMaterialUnit"
                  sm={4}
                  className='materialFormLabel'
                >
                  Unit
                </Label>
                <Col sm={6} className='materialFormValue'>
                  {record?.inventoryItemType?.uom}
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
              <FormGroup row>
                <Label
                  for="updateMaterialQuantity"
                  sm={4}
                  className='materialFormLabel'
                >
                  Quantity
                </Label>
                <Col sm={8} className='materialFormValue'>
                  <Input
                    id="updateMaterialQuantity"
                    name="quantity"
                    placeholder="Quantity of the material"
                    type="number"
                    value={updateRecord.quantity}
                    onChange={(e) => changeRecordHandler(e)}
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label
                  for="updateMaterialDate"
                  sm={4}
                  className='materialFormLabel'
                >
                  Date
                </Label>
                <Col sm={8} className='materialFormValue'>
                  <Input
                    id="updateMaterialDate"
                    name="date"
                    type="date"
                    value={updateRecord.date}
                    onChange={(e) => changeRecordHandler(e)}
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label
                  for="updateMaterialActionSelect"
                  sm={4}
                  className='materialFormLabel'
                >
                  Action
                </Label>
                <Col sm={8} className='materialFormValue'>
                  <Input
                    id="updateMaterialActionSelect"
                    name="action"
                    type="select"
                    value={updateRecord.action}
                    onChange={(e) => changeRecordHandler(e)}
                  >
                    <option value=''>Select Action</option>
                    <option>Add</option>
                    <option>Reduce</option>
                    <option>Hold</option>
                  </Input>
                </Col>
              </FormGroup>

              <FormGroup row>
                <Label
                  for="updateMaterialCauseSelect"
                  sm={4}
                  className='materialFormLabel'
                >
                  Cause
                </Label>
                <Col sm={8} className='materialFormValue'>
                  <Input
                    id="updateMaterialCauseSelect"
                    name="cause"
                    type="select"
                    value={updateRecord.cause}
                    onChange={(e) => changeRecordHandler(e)}
                  >
                    <option value=''>Select Cause</option>
                    <option value='Used'>Used</option>
                    <option value='Lost'>Lost</option>
                    <option value='Wasted'>Wasted</option>
                    <option value='Transfer'>Transfer</option>
                  </Input>
                </Col>
              </FormGroup>

              {
                updateRecord.cause == 'Transfer' &&
                <>
                  <FormGroup row>
                    <Label
                      for="updateMaterialTransferToSelect"
                      sm={4}
                      className='materialFormLabel'
                    >
                      Transfer To
                    </Label>
                    <Col sm={8} className='materialFormValue'>
                      <Input
                        id="updateMaterialTransferToSelect"
                        name="transferTo"
                        type="select"
                        value={updateRecord.transferTo}
                        onChange={(e) => changeRecordHandler(e)}
                      >
                        <option value=''>Select Transfer To</option>
                        <option value='anotherProject'>Another Project</option>
                        <option value='generalStock'>General Stock</option>
                      </Input>
                    </Col>
                  </FormGroup>

                  {
                    updateRecord.transferTo == 'anotherProject' &&
                    <FormGroup row>
                      <Label
                        for="updateMaterialTransferToProjectSelect"
                        sm={4}
                        className='materialFormLabel'
                      >
                        Select Project to Transfer stock
                      </Label>
                      <Col sm={8} className='materialFormValue'>
                        <Input
                          id="updateMaterialTransferToProjectSelect"
                          name="transferToProject"
                          type="select"
                          value=""
                          onChange={(e) => changeRecordHandler(e)}
                        >
                          <option value=''>Select Project</option>
                          {
                            projects.map(proj =>
                              <option key={proj._id}>{proj.projectName}</option>
                            )
                          }
                        </Input>
                      </Col>
                    </FormGroup>
                  }

                </>
              }

              <FormGroup row>
                <Label
                  for="updateMaterialDesc"
                  sm={4}
                  className='materialFormLabel'
                >
                  Description of the update
                </Label>
                <Col sm={8} className='materialFormValue'>
                  <Input
                    id="updateMaterialDesc"
                    name="description"
                    type="textarea"
                    maxLength="150"
                    placeholder='Please enter the reason for the update'
                    onChange={(e) => changeRecordHandler(e)}
                    value={updateRecord.description}
                  />
                </Col>
              </FormGroup>


              <FormGroup row className='d-flex justify-content-between'>
                <Button className='materialButtonBg' onClick={(e) => submitHandler(e)}>
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
