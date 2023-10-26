import React from 'react'
import riversand from './riversand.jpg'
import './UpdateMaterial.css'
import { Container } from 'reactstrap'
import * as moment from 'moment'
import { FormGroup, Input, Label, Form, Row, Col, Button, FormText } from 'reactstrap';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

function UpdateMaterial({ record }) {
  const materialName = 'River Sand'
  const projectName = 'Building Project'
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
              <FormGroup row className='align-items-center'>
                <Label
                  for="updateMaterialProject"
                  sm={4}
                  className='materialFormLabel'
                >
                  Project Name
                </Label>
                <Col sm={8} className='materialFormValue'>
                  {projectName}
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
                    name="updateMaterialQuantity"
                    placeholder="Quantity of the material"
                    type="number"
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
                    name="updateMaterialDate"
                    type="date"
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
                    name="updateMaterialActionSelect"
                    type="select"
                  >
                    <option>Select Action</option>
                    <option>Add</option>
                    <option>Reduce</option>
                    <option>Hold</option>
                  </Input>
                </Col>
              </FormGroup>

              <FormGroup row>
                <Label
                  for="updateMaterialActionSelect"
                  sm={4}
                  className='materialFormLabel'
                >
                  Cause
                </Label>
                <Col sm={8} className='materialFormValue'>
                  <Input
                    id="updateMaterialActionSelect"
                    name="updateMaterialActionSelect"
                    type="select"
                  >
                    <option>Select Cause</option>
                    <option>Used</option>
                    <option>Lost</option>
                    <option>Wasted</option>
                    <option>Transfer</option>
                  </Input>
                </Col>
              </FormGroup>

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
                    name="updateMaterialDesc"
                    type="textarea"
                    maxLength="150"
                    placeholder='Please enter the reason for the update'
                  />
                </Col>
              </FormGroup>


              <FormGroup row className='d-flex justify-content-around'>

                <Button outline className='materialButtonOutline'>
                  Cancel Material
                </Button>
                <Button className='materialButtonBg'>
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
