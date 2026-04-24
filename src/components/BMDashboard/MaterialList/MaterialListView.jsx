import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Input,
  Button,
  InputGroup,
  InputGroupAddon,
  FormGroup,
  Label,
} from 'reactstrap';
import { fetchAllMaterials, resetMaterialUpdate } from '~/actions/bmdashboard/materialsActions';
import ItemListView from '../ItemList/ItemListView';
import UpdateMaterialModal from '../UpdateMaterials/UpdateMaterialModal';
import { Link } from 'react-router-dom';
import styles from '../InventoryTypesList/TypesList.module.css';

function MaterialListView() {
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials.materialslist);
  const errors = useSelector(state => state.errors);
  const postMaterialUpdateResult = useSelector(state => state.materials.updateMaterials);

  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

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

  const transformedMaterials = useMemo(() => {
    return (materials || []).map(material => {
      const bought = material.stockBought || 0;
      const available = material.stockAvailable || 0;
      const wasted = material.stockWasted || 0;
      const isLowStock = bought > 0 && available < 0.2 * bought;
      const wastePercentage = bought > 0 ? ((wasted / bought) * 100).toFixed(2) : '0.00';

      return {
        ...material,
        id: material._id,
        'product id': material._id,
        projectName: material.project?.name || 'N/A',
        name: material.itemType?.name || 'Unnamed Material',
        unit: material.itemType?.unit || '',
        wastePct: `${wastePercentage}%`,
        isLowStock,
      };
    });
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return transformedMaterials.filter(item => {
      if (showOnlyLowStock && !item.isLowStock) return false;
      if (!searchTerm) return true;
      const lowerTerm = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(lowerTerm) ||
        item['product id'].toLowerCase().includes(lowerTerm) ||
        item.projectName.toLowerCase().includes(lowerTerm) ||
        item.unit.toLowerCase().includes(lowerTerm)
      );
    });
  }, [transformedMaterials, searchTerm, showOnlyLowStock]);

  const dynamicColumns = [
    { label: 'Project', key: 'projectName' },
    { label: 'PID', key: 'product id' },
    { label: 'Unit', key: 'unit' },
    { label: 'Bought', key: 'stockBought' },
    { label: 'Used', key: 'stockUsed' },
    { label: 'Available', key: 'stockAvailable' },
    { label: 'Wasted', key: 'stockWasted' },
    { label: 'Waste %', key: 'wastePct' },
  ];

  return (
    <>
      <Link to="/bmdashboard/inventorytypes" className={styles.backLink}>
        All Inventory Types
      </Link>
      <Container fluid className="p-0 mt-3">
        <ItemListView
          itemType="Materials"
          items={filteredMaterials}
          errors={errors}
          UpdateItemModal={UpdateMaterialModal}
          dynamicColumns={dynamicColumns}
        >
          <FormGroup check className="m-0 d-flex align-items-center">
            <Label check style={{ fontWeight: '600', cursor: 'pointer', margin: 0 }}>
              <Input
                type="checkbox"
                checked={showOnlyLowStock}
                onChange={() => setShowOnlyLowStock(!showOnlyLowStock)}
              />{' '}
              Show only low-stock materials
            </Label>
          </FormGroup>
          <InputGroup style={{ width: '350px' }}>
            <Input
              type="text"
              placeholder="Search Material, PID, Unit..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <InputGroupAddon addonType="append">
                <Button color="secondary" onClick={() => setSearchTerm('')}>
                  <i className="fa fa-times" aria-hidden="true" style={{ marginRight: '5px' }}></i>{' '}
                  Clear
                </Button>
              </InputGroupAddon>
            )}
          </InputGroup>
        </ItemListView>
      </Container>
    </>
  );
}

export default MaterialListView;
