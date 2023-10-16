import React from 'react'
import './LogMaterials.css';
import * as moment from 'moment'
import { FormGroup, Input, Label, Form, Row, Col, Button } from 'reactstrap';
import { useState } from 'react';


function LogMaterialsInputs() {

  const [date, setDate] = useState(moment(new Date()).format('YYYY-MM-DD'));
  const dateHandler = (e) => {
    let newDate = moment(e.target.value).format('YYYY-MM-DD')
    setDate(newDate)
  }

  return (
    <div className='container-fluid'>
      <div className='row'>

        <div className='col-lg-4 col-12'>
          <div className="form-group form-inline align-items-center">
            <Label for="selectdate">
              Date:
            </Label>
            <Input value={date} onChange={dateHandler} id='selectdate' className='logMInput form-control' name='select' type="date">
            </Input>
          </div>
        </div>
        <div className='col-lg-4 col-12'>
          <div className="form-group form-inline align-items-center">
            <Label for="selectproject">
              Project:
            </Label>
            <Input id='selectproject' className='logMInput form-control' name='select' type="select">
              <option>Project 1</option>
              <option>Project 2</option>
              <option>Project 3</option>
            </Input>
          </div>
        </div>
        <div className='col-lg-4 col-12'>
          <div className="form-group form-inline align-items-center">
            <Label for="selectcheck">
              Check In or Out:
            </Label>
            <Input id='selectcheck' className='logMInput form-control' name='select' type="select">
              <option>Check In</option>
              <option>Check Out</option>
            </Input>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogMaterialsInputs
