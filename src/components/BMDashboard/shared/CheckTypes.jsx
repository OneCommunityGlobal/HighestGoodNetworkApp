import { fetchInvTypeByType } from 'actions/bmdashboard/invTypeActions';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardBody, Input, Label, Table, Col, FormGroup } from 'reactstrap';

function CheckTypes({ type }) {
  const buildingInventoryTypes = useSelector(state => state.bmInvTypes);
  const dispatch = useDispatch();
  const [InvType, setInvType] = useState(type);
  const [buildingInvTypes, setbuildingInvTypes] = useState([]);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [isAscending, setIsAscending] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Handle sorting by name
  const handleSortByName = () => {
    setIsAscending(!isAscending);
  };

  // Filter the data based on the search query
  const filteredBuildingInvTypes = buildingInvTypes.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Sorting function for name column
  const sortedBuildingInvTypes = [...filteredBuildingInvTypes].sort((a, b) => {
    if (isAscending) {
      return a.name.localeCompare(b.name);
    }
    return b.name.localeCompare(a.name);
  });

  return (
    <div
      style={{
        backgroundColor: darkMode ? '#1B2A41' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
        padding: '20px',
        minHeight: '100vh',
      }}
    >
      <Card
        style={{
          backgroundColor: darkMode ? '#1C2541' : '#ffffff',
          margin: '20px auto',
          width: '80%',
          borderRadius: '15px',
        }}
      >
        <CardBody>
          <FormGroup row>
            <Label
              for="selectType"
              lg={2}
              sm={4}
              style={{
                color: darkMode ? '#ffffff' : '#000000',
              }}
            >
              Select Type
            </Label>
            <Label for="search" lg={2} sm={4}>
              Search by Name
            </Label>
            <Col lg={4} sm={8}>
              <Input
                id="search"
                name="search"
                type="text"
                placeholder="Search for a type..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} // Update search query
              />
            </Col>
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
              backgroundColor: darkMode ? '#3A506B' : '#f9f9f9',
              border: darkMode ? '1px solid #444' : '1px solid #dcdcdc',
              boxShadow: darkMode
                ? '0 2px 10px rgba(255, 255, 255, 0.1)'
                : '0 2px 10px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Table size="sm" responsive hover>
              <thead
                style={{
                  backgroundColor: darkMode ? '#1C2541' : '#ffffff',
                  color: darkMode ? '#ffffff' : '#000000',
                  fontWeight: 'bold',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  borderTop: '1px solid #444',
                  borderBottom: '1px solid #444',
                }}
              >
                <tr>
                  <th>#</th>
                  <th style={{ cursor: 'pointer' }} onClick={handleSortByName}>
                    Name {isAscending ? '▲' : '▼'}
                  </th>
                  <th>Category</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {buildingInvTypes?.map((elemType, idx) => (
                  <tr key={elemType._id}>
                    <th>{idx + 1}</th>
                    <td>{elemType.name}</td>
                    <td>{elemType.category}</td>
                    <td>{elemType.description}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <style jsx>{`
              tbody tr:nth-child(odd) {
                background-color: ${darkMode ? '#1C2541' : '#ffffff'};
                color: ${darkMode ? '#ffffff' : '#000000'};
              }
              tbody tr:nth-child(even) {
                background-color: ${darkMode ? '#3A506B' : '#f9f9f9'};
                color: ${darkMode ? '#ffffff' : '#000000'};
              }
              tbody tr:hover {
                background-color: ${darkMode ? '#23395d !important' : '#e9ecef !important'};
                color: ${darkMode ? '#ffffff !important' : '#000000 !important'};
              }
              thead tr:hover {
                background-color: ${darkMode ? '#1C2541' : '#ffffff'};
              }
            `}</style>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default CheckTypes;
