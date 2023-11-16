import React, { useState } from 'react'
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Label, Table, Row, Col, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import { fetchAllMaterials, postMaterialUpdateBulk, resetMaterialUpdateBulk } from 'actions/bmdashboard/materialsActions';
import UpdateMaterial from '../UpdateMaterial';

function UpdateMaterialsBulkTable({ date, project }) {

  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials);
  const [materialsState, setMaterialsState] = useState([...materials])
  const postMaterialUpdateBulkResult = useSelector(state => state.updateMaterialsBulk)
  const [cancel, setCancel] = useState(1);
  const updatedRecordsList = {};


  useEffect(() => {
    setMaterialsState([...materials])
  }, [materials])

  const cancelHandler = () => {
    setCancel((cancel) => cancel == 1 ? 2 : 1);
  }



  useEffect(() => {
    if (postMaterialUpdateBulkResult.result == null)
      dispatch(fetchAllMaterials());
  }, [postMaterialUpdateBulkResult.result]);

  useEffect(() => {
    if (project.value != '0') {
      let _materials = materials.filter((mat) => mat.project.name == project.label)
      setMaterialsState(_materials);
    }
    else {
      setMaterialsState([...materials])
    }
  }, [project])



  useEffect(() => {
    if (postMaterialUpdateBulkResult.loading == false && postMaterialUpdateBulkResult.error == true) {
      toast.error(`${postMaterialUpdateBulkResult.result}`);
      dispatch(resetMaterialUpdateBulk())
    }
    else if (postMaterialUpdateBulkResult.loading == false && postMaterialUpdateBulkResult.result != null) {
      toast.success(postMaterialUpdateBulkResult.result);
      dispatch(resetMaterialUpdateBulk())
    }
  }, [postMaterialUpdateBulkResult])


  const submitHandler = (e) => {
    e.preventDefault();
    let tempPostMaterialUpdateData = Object.values(updatedRecordsList).filter(d => d.newAvailable != "") //In case , user enters and removes data
    dispatch(postMaterialUpdateBulk(tempPostMaterialUpdateData))

    //Reset materials

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
            materialsState.length == 0 ?
              <>
                <tr align="center">
                  <td colSpan={6}> <i>Please select a project that has valid material data! </i></td>
                </tr>
              </>
              :
              materialsState?.map((material, idx) =>
                <UpdateMaterial key={material._id + material.stockAvailable} cancel={cancel}
                  idx={idx} bulk={true} record={material} sendUpdatedRecord={sendUpdatedRecordHandler} />
              )
          }
        </tbody>
      </Table>
      <div style={{ marginRight: '0px', marginLeft: '0px' }} className='row justify-content-between '>
        <Button size="md" className='logMButtons' outline onClick={cancelHandler}>Cancel</Button>
        <Button size="md" className='logMButtonBg' onClick={(e) => submitHandler(e)} >Submit</Button>
      </div>

    </div>
  )
}

export default UpdateMaterialsBulkTable
