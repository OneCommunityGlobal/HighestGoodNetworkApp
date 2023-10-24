import React from 'react'
import './LogMaterials.css';
import LogMaterialsInputs from './LogMaterialsInputs';
import LogMaterialsTable from './LogMaterialsTable';
import { Container } from 'reactstrap';
import { useState } from 'react';
import moment from 'moment';

function LogMaterial() {

  const [date, setDate] = useState(moment(new Date()).format('YYYY-MM-DD'));
  const [checkInOut, setCheckInOut] = useState(1);
  return (
    <Container fluid className='logMaterialContainer'>
      <div className='logMaterialPage'>
        <div className='logMaterial'>
          <div className='logMaterialTitle'>MATERIAL DAILY ACTIVITIES LOG</div>
          <LogMaterialsInputs date={date} setDate={setDate} checkInOut={checkInOut} setCheckInOut={setCheckInOut} />
          <LogMaterialsTable date={date} checkInOut={checkInOut} />
        </div>
      </div>
    </Container>
  )
}

export default LogMaterial
