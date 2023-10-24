import React from 'react'
import './LogMaterials.css';
import * as moment from 'moment'
import { FormGroup, Input, Label, Form, Row, Col, Button } from 'reactstrap';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchProjectsByCategory } from 'actions/projects';
import { getMaterialsByProjAndCheckInOutSuccess, resetMaterialsByProjAndCheckInOut } from 'actions/inventoryMaterial';
import Select from 'react-select';

function LogMaterialsInputs({ date, setDate, checkInOut, setCheckInOut }) {

  const [project, setProject] = useState('');

  const projects = useSelector(state => state.allProjects.projects)
  const [formattedProjects, setFormattedProjects] = useState([]);
  const today = moment(new Date()).format('YYYY-MM-DD')

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(resetMaterialsByProjAndCheckInOut())
    dispatch(fetchProjectsByCategory('Housing'));
  }, []);

  useEffect(() => {
    let _formattedProjects = projects.map((proj) => {
      return { label: proj.projectName, value: proj._id }
    })
    setFormattedProjects(_formattedProjects);
  }, [projects]);

  const dateHandler = (e) => {
    let newDate = moment(e.target.value).format('YYYY-MM-DD')
    setDate(newDate)
  }
  const changeProjectHandler = (selectedOption) => {
    let proj = selectedOption;
    setProject(proj);
    let payload = { 'projectId': proj.value, 'checkInOut': checkInOut }
    if (payload.projectId != undefined)
      dispatch(getMaterialsByProjAndCheckInOutSuccess(payload))
  }
  const changeCheckInOutHandler = (e) => {
    let check = e.target.value;
    setCheckInOut(e.target.value);
    let payload = { 'projectId': project?.value, 'checkInOut': check }
    if (payload.projectId != undefined)
      dispatch(getMaterialsByProjAndCheckInOutSuccess(payload))
  }


  return (
    <div className='container'>

      <Form >
        <Row className="align-items-center logMaterialInputRow">
          <Col lg={4} md={12} className='logMaterialInputCol'>
            <Row className="justify-content-start align-items-center">
              <Label
                for="selectdate"
                lg={2} md={3}
              >
                Date:
              </Label>
              <Col lg={10} md={9}>
                <Input max={today} value={date} onChange={dateHandler} id='selectdate' name='select' type="date">
                </Input>
              </Col>
            </Row>
          </Col>

          <Col lg={4} md={12} className='logMaterialInputCol'>
            <Row className="justify-content-start align-items-center">
              <Label lg={3} md={3} for="selectproject">
                Project:
              </Label>
              <Col lg={9} md={9} >
                <Select
                  onChange={changeProjectHandler}
                  options={formattedProjects}
                  placeholder={'Please Select Project'}
                />
              </Col>
            </Row>
          </Col>

          <Col lg={4} md={12} className='logMaterialInputCol'>
            <Row className="justify-content-start align-items-center">
              <Label lg={6} md={3} for="selectcheck">
                Check In or Out:
              </Label>
              <Col lg={6} md={9}>
                <Input value={checkInOut} onChange={(e) => changeCheckInOutHandler(e)} id='selectcheck' name='select' type="select">
                  <option value={1}>Check In</option>
                  <option value={0}>Check Out</option>
                </Input>
              </Col>
            </Row>
          </Col>
        </Row>


      </Form>

    </div>
  )
}

export default LogMaterialsInputs
