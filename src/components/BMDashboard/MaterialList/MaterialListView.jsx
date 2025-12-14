import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMaterials, resetMaterialUpdate } from '~/actions/bmdashboard/materialsActions';
import ItemListView from '../ItemList/ItemListView';
import UpdateMaterialModal from '../UpdateMaterials/UpdateMaterialModal';
import SummaryCards from './SummaryCards';
import { faBoxesStacked, faTriangleExclamation, faTrash } from '@fortawesome/free-solid-svg-icons';

function MaterialListView() {
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials.materialslist);
  const errors = useSelector(state => state.errors);
  const postMaterialUpdateResult = useSelector(state => state.materials.updateMaterials);

  // Transform the materials to match expected PropTypes
  const transformedMaterials =
    materials?.map(material => ({
      ...material,
      id: parseInt(material._id?.split('-')[0], 16) || Math.random(),
      name: material.itemType?.name || 'Unnamed Material',
    })) || [];

  // Calculate summary metrics
  const totalActiveMaterials = transformedMaterials.length;

  const lowStockCount = transformedMaterials.filter(
    material => material.stockAvailable < material.stockBought * 0.2,
  ).length;

  const totalWasted = transformedMaterials.reduce(
    (sum, material) => sum + (material.stockWasted || 0),
    0,
  );

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

  const itemType = 'Materials';

  const dynamicColumns = [
    { label: 'PID', key: 'product id' },
    { label: 'Measurement', key: 'itemType.unit' },
    { label: 'Bought', key: 'stockBought' },
    { label: 'Used', key: 'stockUsed' },
    { label: 'Available', key: 'stockAvailable' },
    { label: 'Wasted', key: 'stockWasted' },
    { label: 'Hold', key: 'stockHold' },
  ];

  return (
    <>
      <SummaryCards
        cardData={[
          {
            title: 'Total Active Materials',
            value: totalActiveMaterials,
            icon: faBoxesStacked,
            color: '#4154f1',
            isTriangle: true,
          },
          {
            title: 'Materials Low in Stock',
            value: lowStockCount,
            icon: faTriangleExclamation,
            color: '#f59f00',
            isTriangle: true,
          },
          {
            title: 'Total Wasted Materials',
            value: totalWasted,
            icon: faTrash,
            color: '#e03131',
          },
        ]}
      />

      <ItemListView
        itemType={itemType}
        items={transformedMaterials}
        errors={errors}
        UpdateItemModal={UpdateMaterialModal}
        dynamicColumns={dynamicColumns}
      />
    </>
  );
}

export default MaterialListView;
