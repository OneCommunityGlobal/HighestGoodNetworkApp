import { postMaterialLog } from 'actions/inventoryMaterial';
import React, { useState } from 'react'
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Label, Table, Row, Col, Input } from 'reactstrap';
import { toast } from 'react-toastify';

function LogMaterialsTable({ date }) {

  const materials = useSelector(state => state.inventoryMaterials.materials);
  const [materialsState, setMaterialsState] = useState(materials);
  const [postMaterialLogData, setPostMaterialLogData] = useState({});
  const logMaterialsResult = useSelector(state => state.inventoryMaterials.logMaterialsResult);
  const dispatch = useDispatch();

  const initializeLogValue = () => {
    let _materialsState = materials.map((material) => {
      material.logValue = '';
      return material;
    })
    setMaterialsState(_materialsState);
    setPostMaterialLogData({})
  }

  useEffect(() => {
    initializeLogValue();
  }, [materials])

  useEffect(() => {
    if (logMaterialsResult?.success != null)
      toast.success(logMaterialsResult?.success)
    else if (logMaterialsResult?.error != null)
      toast.error(logMaterialsResult?.error)
  }, [logMaterialsResult])


  const logValueHandler = (e, material_obj) => {
    material_obj.logValue = e.target.value;
    setMaterialsState([...materialsState]);
    postMaterialLogData[material_obj._id] = material_obj;
  }

  const onSubmitHandler = () => {
    dispatch(postMaterialLog(postMaterialLogData, date));
    initializeLogValue();
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
                    <Row className="justify-content-start align-items-center">
                      <Col lg={10} md={9}>
                        <Input placeholder='Please the log amount used'
                          onChange={(e) => logValueHandler(e, materialsState[idx])}
                          value={materialsState[idx]?.logValue}
                          id={'log' + material._id} type="number">

                        </Input>
                      </Col>
                      <Label
                        for={'log' + material._id}
                        lg={2} md={3}
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
