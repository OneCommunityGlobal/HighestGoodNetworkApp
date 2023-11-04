import React from 'react'
import './UpdateMaterialsBulk.css';
import UpdateMaterialsBulkInputs from './UpdateMaterialsBulkInputs';
import UpdateMaterialsBulkTable from './UpdateMaterialsBulkTable';
import { Container } from 'reactstrap';
import { useState } from 'react';
import moment from 'moment';

function UpdateMaterialsBulk() {

  const [date, setDate] = useState(moment(new Date()).format('YYYY-MM-DD'));
  return (
    <Container fluid className='logMaterialContainer'>
      <div className='logMaterialPage'>
        <div className='logMaterial'>
          <div className='logMaterialTitle'>MATERIAL DAILY ACTIVITIES UPDATE FORM</div>
          <UpdateMaterialsBulkInputs date={date} setDate={setDate} />
          <UpdateMaterialsBulkTable />
        </div>
      </div>
    </Container>
  )
}

export default UpdateMaterialsBulk
