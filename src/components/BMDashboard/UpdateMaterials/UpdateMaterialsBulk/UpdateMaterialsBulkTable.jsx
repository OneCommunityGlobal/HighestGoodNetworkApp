import React, { useState } from 'react'
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Label, Table, Row, Col, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import { fetchAllMaterials } from 'actions/bmdashboard/materialsActions';
import UpdateMaterial from '../UpdateMaterial';

function UpdateMaterialsBulkTable({ date }) {

  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials);
  const updatedRecordsList = {};
  useEffect(() => {
    dispatch(fetchAllMaterials());
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();
    let tempPostMaterialUpdateData = Object.values(updatedRecordsList).filter(d => d.newAvailable != "")
    console.log('updatedRecordsList', tempPostMaterialUpdateData)
  }

  const sendUpdatedRecordHandler = (updatedRecord) => {
    updatedRecordsList[updatedRecord.material._id] = updatedRecord;
  }

  return (
    <div>

      <Table borderless className='logMaterialTable' responsive >
        <thead className='logMTableHeaderLine'>
          <tr className="">
            <th colSpan={2}> Item </th>
            <th colSpan={1}>Quantity</th>
            <th colSpan={5} className='logMTableHead'> Daily Log Input </th>
          </tr>
        </thead>
        <thead className='logMTableHeaderLine'>
          <tr className="table-light">
            <th> ID </th>
            <th>Name</th>
            <th>Available</th>
            <th className='logMTableHead'>Used</th>
            <th className='logMTableHead'>Used(Unit)</th>
            <th className='logMTableHead'>Wasted</th>
            <th className='logMTableHead'>Wasted(Unit) </th>
            <th className='logMTableHead'>New Available </th>
          </tr>
        </thead>
        <tbody >
          {
            materials.length == 0 ?
              <>
                <tr align="center">
                  <td colSpan={6}> <i>Please select a project that has valid material data! </i></td>
                </tr>
              </>
              :
              materials.map((material, idx) =>
                <UpdateMaterial key={idx} idx={idx} bulk={true} record={material} sendUpdatedRecord={sendUpdatedRecordHandler} />
              )
          }
        </tbody>
      </Table>
      <div style={{ marginRight: '0px', marginLeft: '0px' }} className='row justify-content-between '>
        <Button size="md" className='logMButtons' outline >Cancel</Button>
        <Button size="md" className='logMButtonBg' onClick={(e) => submitHandler(e)} >Submit</Button>
      </div>

    </div>
  )
}

export default UpdateMaterialsBulkTable
