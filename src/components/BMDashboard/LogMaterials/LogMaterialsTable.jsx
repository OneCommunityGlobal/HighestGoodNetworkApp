import { postMaterialLog, resetLogMaterialsResult, resetMaterialsByProjAndCheckInOut } from 'actions/bmdashboard/inventoryMaterial';
import React, { useState } from 'react'
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Label, Table, Row, Col, Input } from 'reactstrap';
import { toast } from 'react-toastify';

function LogMaterialsTable({ date, checkInOut }) {

  const materials = useSelector(state => state.inventoryMaterials.materials);
  const [materialsState, setMaterialsState] = useState(materials);
  const [postMaterialLogData, setPostMaterialLogData] = useState({});
  const [error, setError] = useState(false)
  const logMaterialsResult = useSelector(state => state.inventoryMaterials.logMaterialsResult);
  const dispatch = useDispatch();

  const initializeLogValue = () => {
    let _materialsState = materials.map((material) => {
      material.logValue = '';
      material.error = '';
      return material;
    })
    setMaterialsState(_materialsState);
    setPostMaterialLogData({})
  }

  useEffect(() => {
    initializeLogValue();
  }, [materials])

  useEffect(() => {
    if (logMaterialsResult?.success != null) {
      toast.success(logMaterialsResult?.success)
      dispatch(resetLogMaterialsResult())
    }
    else if (logMaterialsResult?.error != null) {
      toast.error(logMaterialsResult?.error)
      dispatch(resetLogMaterialsResult())
    }
  }, [logMaterialsResult])


  const logValueHandler = (e, material_obj) => {

    if (checkInOut == 0) {
      if (e.target.value > +material_obj.stockAvailable) {
        material_obj.error = 'Please enter a value less than or equal to Stock Available';
        material_obj.logValue = e.target.value;
        setMaterialsState([...materialsState]);
        setError(true);
        return;
      }
    }
    else {
      if (e.target.value > +material_obj.stockUsed) {
        material_obj.error = 'Please enter a value less than or equal to Stock Used';
        material_obj.logValue = e.target.value;
        setMaterialsState([...materialsState]);
        setError(true);
        return;
      }
    }

    material_obj.logValue = e.target.value; material_obj.error = '';
    setMaterialsState([...materialsState]);
    postMaterialLogData[material_obj._id] = material_obj;
    if (error == true) setError(false);
  }

  const onSubmitHandler = () => {
    if (error) {
      toast.error('Please resolve all the errors before submitting the log')
    }
    else {
      let temppostMaterialLogData = Object.values(postMaterialLogData).filter(d => d.logValue != "")
      dispatch(postMaterialLog(temppostMaterialLogData, date));
      initializeLogValue();
    }

  }



  return (
    <div>

      <Table borderless className='logMaterialTable' responsive >
        <thead className='logMTableHeaderLine'>
          <tr className="">
            <th colSpan={2}> Item </th>
            <th colSpan={3}>Quantity</th>
            <th colSpan={1} className='logMTableHead'> Daily Log Input </th>
          </tr>
        </thead>
        <thead className='logMTableHeaderLine'>
          <tr className="table-light">
            <th> ID </th>
            <th>Name</th>
            <th>Working</th>
            <th> Available </th>
            <th>Using</th>
            <th className='logMTableHead'> Log Material </th>
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
              materialsState.map((material, idx) =>
                <tr key={material._id}>
                  <td scope="row">   {idx + 1}  </td>
                  <td>  {material.inventoryItemType.name}  </td>
                  <td>  {material.stockBought} </td>
                  <td>  {material.stockAvailable} </td>
                  <td>  {material.stockUsed} </td>
                  <td>
                    <Row >
                      <Col lg={9} md={8}>
                        <Row className="justify-content-start align-items-start">
                          <Input placeholder='Please the log amount used'
                            onChange={(e) => logValueHandler(e, materialsState[idx])}
                            value={materialsState[idx]?.logValue}
                            id={'log' + material._id} type="number" max={material.stockAvailable}>

                          </Input>
                          <br />
                          <span className='err'> {material.error} </span>
                        </Row>
                      </Col>
                      <Label
                        for={'log' + material._id}
                        lg={3} md={4}
                      >
                        {material.inventoryItemType.uom}
                      </Label>
                    </Row>
                  </td>
                </tr>
              )
          }
        </tbody>
      </Table>
      <div className='row justify-content-between '>
        <Button size="md" className='logMButtons' outline onClick={initializeLogValue}>Cancel</Button>
        <Button size="md" className='logMButtonBg' onClick={onSubmitHandler}  >Submit</Button>
      </div>

    </div>
  )
}

export default LogMaterialsTable
