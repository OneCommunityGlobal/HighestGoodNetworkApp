import React from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Button, Table, Card, CardBody } from 'reactstrap'

function MaterialTypesList() {
  const buildingInventoryTypes = useSelector(state => state.bmInvTypes.list)
  const [showTable, setShowTable] = useState(true);
  return (
    <div>

      <Button className='materialButtonBg' size="sm" onClick={() => setShowTable(!showTable)}>
        {showTable ? 'Hide' : 'Show'} Available Building Material Types</Button>


      {showTable &&
        <Card>
          <CardBody>
            <Table size="sm" responsive>
              <thead>
                <tr>
                  <th>
                    #
                  </th>
                  <th>
                    Material Name
                  </th>
                  <th>
                    Material Unit
                  </th>
                  <th>
                    Material description
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                  buildingInventoryTypes?.map((matType, idx) =>
                    <tr key={matType._id}>
                      <th>{idx + 1}</th>
                      <td>{matType.name}</td>
                      <td>{matType.unit}</td>
                      <td>{matType.description}</td>
                    </tr>)
                }

              </tbody>
            </Table>
          </CardBody>
        </Card>
      }


    </div>
  )
}

export default MaterialTypesList