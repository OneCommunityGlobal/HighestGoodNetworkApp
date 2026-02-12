import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Input, Button, InputGroup, InputGroupAddon } from 'reactstrap';
import { fetchAllMaterials, resetMaterialUpdate } from '~/actions/bmdashboard/materialsActions';
import ItemListView from '../ItemList/ItemListView';
import UpdateMaterialModal from '../UpdateMaterials/UpdateMaterialModal';

function MaterialListView() {
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials.materialslist);
  const errors = useSelector(state => state.errors);
  const postMaterialUpdateResult = useSelector(state => state.materials.updateMaterials);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Data Transformation
  const transformedMaterials =
    materials?.map(material => ({
      ...material,
      'product id': material._id,
      projectName: material.project?.name || 'N/A',
      name: material.itemType?.name || 'Unnamed Material',
      unit: material.itemType?.unit || '',
    })) || [];

  useEffect(() => {
    dispatch(fetchAllMaterials());
  }, [dispatch]);

  useEffect(() => {
    if (postMaterialUpdateResult?.result !== null && !postMaterialUpdateResult.loading) {
      if (!postMaterialUpdateResult.error) {
        dispatch(fetchAllMaterials());
        dispatch(resetMaterialUpdate());
      }
    }
  }, [postMaterialUpdateResult, dispatch]);

  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Filter Logic
  const filteredMaterials = transformedMaterials.filter(item => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();

    return (
      item.name.toLowerCase().includes(lowerTerm) ||
      item['product id'].toLowerCase().includes(lowerTerm) ||
      item.projectName.toLowerCase().includes(lowerTerm) ||
      item.unit.toLowerCase().includes(lowerTerm)
    );
  });

  const itemType = 'Materials';

  const dynamicColumns = [
    { label: 'Project', key: 'projectName' },
    { label: 'PID', key: 'product id' },
    { label: 'Measurement', key: 'itemType.unit' },
    { label: 'Bought', key: 'stockBought' },
    { label: 'Used', key: 'stockUsed' },
    { label: 'Available', key: 'stockAvailable' },
    { label: 'Wasted', key: 'stockWasted' },
    { label: 'Hold', key: 'stockHold' },
  ];

  return (
    <Container fluid className="p-0">
      {/* SEARCH BAR ROW */}
      <Row className="mb-3 mt-3 d-flex justify-content-end align-items-center">
        <Col xs="auto" className="d-flex align-items-center">
          <span className="mr-2" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
            Search:
          </span>
          <InputGroup style={{ width: '350px' }}>
            <Input
              type="text"
              placeholder="Material, PID, Unit, Project..."
              value={searchTerm}
              onChange={handleSearch}
              style={{
                borderTopRightRadius: searchTerm ? '0' : '4px',
                borderBottomRightRadius: searchTerm ? '0' : '4px',
              }}
            />
            {searchTerm && (
              <InputGroupAddon addonType="append">
                <Button color="secondary" onClick={handleClearSearch}>
                  <i className="fa fa-times" aria-hidden="true"></i> Clear
                </Button>
              </InputGroupAddon>
            )}
          </InputGroup>
        </Col>
      </Row>

      <ItemListView
        itemType={itemType}
        items={filteredMaterials}
        errors={errors}
        UpdateItemModal={UpdateMaterialModal}
        dynamicColumns={dynamicColumns}
      />
    </Container>
  );
}

export default MaterialListView;
