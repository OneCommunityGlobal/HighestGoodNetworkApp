import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMaterials } from 'actions/bmdashboard/materialsActions';
import ItemListView from '../ItemList/ItemListView';
import UpdateMaterialModal from '../UpdateMaterials/UpdateMaterialModal';

function MaterialListView() {
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials.materialslist);
  const errors = useSelector(state => state.errors);
  const postMaterialUpdateResult = useSelector(state => state.materials.updateMaterials);

  useEffect(() => {
    dispatch(fetchAllMaterials());
  }, []);

  useEffect(() => {
    if (!postMaterialUpdateResult || postMaterialUpdateResult?.result == null)
      dispatch(fetchAllMaterials());
  }, [postMaterialUpdateResult?.result]);

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
      items={materials}
      errors={errors}
      UpdateItemModal={UpdateMaterialModal}
      dynamicColumns={dynamicColumns}
    />
  );
}

export default MaterialListView;
