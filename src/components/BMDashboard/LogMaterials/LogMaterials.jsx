import React from 'react'
import './LogMaterials.css';
import LogMaterialsInputs from './LogMaterialsInputs';
import LogMaterialsTable from './LogMaterialsTable';
import { Container } from 'reactstrap';

function LogMaterial() {
  return (
    <Container fluid className='logMaterialContainer'>
      <div className='logMaterialPage'>
        <div className='logMaterial'>
          <div className='logMaterialTitle'>MATERIAL DAILY ACTIVITIES LOG</div>
          <LogMaterialsInputs />
          <LogMaterialsTable />
        </div>
      </div>
    </Container>
  )
}

export default LogMaterial
