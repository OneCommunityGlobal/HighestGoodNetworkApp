import { fetchInvTypeByType } from 'actions/bmdashboard/invTypeActions';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardBody, Input, Label, Table, Col, FormGroup } from 'reactstrap';

function CheckTypes({ type }) {
  const buildingInventoryTypes = useSelector(state => state.bmInvTypes);
  const dispatch = useDispatch();
  const [InvType, setInvType] = useState(type);
  const [buildingInvTypes, setbuildingInvTypes] = useState([]);

  useEffect(() => {
    if (buildingInventoryTypes.invTypeList[InvType] != null)
      setbuildingInvTypes([...buildingInventoryTypes.invTypeList[InvType]]);
  }, [buildingInventoryTypes]);

  useEffect(() => {
    if (buildingInventoryTypes.invTypeList[InvType] == null) dispatch(fetchInvTypeByType(InvType));
    else {
      // In cache
      setbuildingInvTypes([...buildingInventoryTypes.invTypeList[InvType]]);
    }
  }, [InvType]);

  return (
    <div>
      <Card>
        <CardBody>
          <FormGroup row>
            <Label for="selectType" lg={2} sm={4}>
              Select Type
            </Label>
            <Col lg={4} sm={8}>
              <Input
                id="selectType"
                name="select"
                type="select"
                value={InvType}
                onChange={e => setInvType(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Materials">Materials</option>
                <option value="Consumables">Consumables</option>
                <option value="Equipments">Equipment</option>
                <option value="Tools">Tools</option>
                <option value="Reusables">Reusables</option>
              </Input>
            </Col>
          </FormGroup>
          <div
            style={{
              maxHeight: '800px',
              overflowY: 'auto',
              padding: '10px',
              borderRadius: '15px',
              border: '1px solid #dcdcdc',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Table size="sm" responsive hover striped>
              <thead
                style={{
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
              >
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {buildingInvTypes?.map((elemType, idx) => (
                  <tr
                    key={elemType._id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9f9f9',
                      cursor: 'pointer',
                    }}
                  >
                    <th>{idx + 1}</th>
                    <td>{elemType.name}</td>
                    <td>{elemType.category}</td>
                    <td>{elemType.description}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default CheckTypes;
