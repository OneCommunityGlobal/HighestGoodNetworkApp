import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMaterials, resetMaterialUpdate } from '~/actions/bmdashboard/materialsActions';
import ItemListView from '../ItemList/ItemListView';
import UpdateMaterialModal from '../UpdateMaterials/UpdateMaterialModal';

function MaterialListView() {
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials.materialslist);
  const errors = useSelector(state => state.errors);
  const postMaterialUpdateResult = useSelector(state => state.materials.updateMaterials);

  // Transform the materials to match expected PropTypes
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
    <ItemListView
      itemType={itemType}
      items={transformedMaterials}
      errors={errors}
      UpdateItemModal={UpdateMaterialModal}
      dynamicColumns={dynamicColumns}
    />
  );
}

export default MaterialListView;
