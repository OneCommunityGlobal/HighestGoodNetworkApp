import { fetchInvTypeByType } from 'actions/bmdashboard/invTypeActions';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, CardBody, Table } from 'reactstrap';

function CheckTypes({ type }) {

  const buildingInventoryTypes = useSelector(state => state.bmInvTypes.list);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchInvTypeByType(type))
  }, [])

  return (
    <div>
      <Card>
        <CardBody>
          <Table size="sm" responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Category</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {buildingInventoryTypes?.map((elemType, idx) => (
                <tr key={elemType._id}>
                  <th>{idx + 1}</th>
                  <td>{elemType.name}</td>
                  <td>{elemType.category}</td>
                  <td>{elemType.description}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}

export default CheckTypes
