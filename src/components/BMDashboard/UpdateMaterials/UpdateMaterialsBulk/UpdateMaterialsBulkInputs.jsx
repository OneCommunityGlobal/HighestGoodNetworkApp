import React from 'react'
import './UpdateMaterialsBulk.css';
import * as moment from 'moment'
import { FormGroup, Input, Label, Form, Row, Col, Button } from 'reactstrap';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import Select from 'react-select';

function UpdateMaterialsBulkInputs({ date, setDate }) {

  const [project, setProject] = useState('');

  const projects = [{ projectName: 'Project A', _id: '1' }, { projectName: 'Project B', _id: '2' }, { projectName: 'Project C', _id: '3' }]
  const [formattedProjects, setFormattedProjects] = useState([]);
  const today = moment(new Date()).format('YYYY-MM-DD')

  useEffect(() => {
    let _formattedProjects = projects.map((proj) => {
      return { label: proj.projectName, value: proj._id }
    })
    setFormattedProjects(_formattedProjects);
  }, []);

  const dateHandler = (e) => {
    let newDate = moment(e.target.value).format('YYYY-MM-DD')
    setDate(newDate)
  }
  const changeProjectHandler = (selectedOption) => {
    let proj = selectedOption;
    setProject(proj);
  }

  return (
    <div className='container'>

      <Form >
        <Row className="align-items-center logMaterialInputRow">
          <Col lg={6} md={12} className='logMaterialInputCol'>
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

          <Col lg={6} md={12} className='logMaterialInputCol'>
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
        </Row>


      </Form>

    </div>
  )
}

export default UpdateMaterialsBulkInputs
