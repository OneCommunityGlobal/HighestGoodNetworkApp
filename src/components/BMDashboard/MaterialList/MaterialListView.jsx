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

  const materialsWithId = materials
    ? materials.map(item => ({
        ...item,
        id:
          parseInt(item._id?.substring(item._id.length - 6), 16) ||
          Math.floor(Math.random() * 1000000),
      }))
    : [];

  useEffect(() => {
    dispatch(fetchAllMaterials());
  }, []);

  useEffect(() => {
    if (!postMaterialUpdateResult || postMaterialUpdateResult?.result == null)
      dispatch(fetchAllMaterials());
  }, [postMaterialUpdateResult?.result]);

  const itemType = 'Materials';

  const dynamicColumns = [
    { label: 'Unit', key: 'itemType.unit' },
    { label: 'Bought', key: 'stockBought' },
    { label: 'Used', key: 'stockUsed' },
    { label: 'Available', key: 'stockAvailable' },
    { label: 'Waste', key: 'stockWasted' },
  ];

  return (
    <ItemListView
      itemType={itemType}
      items={materialsWithId}
      errors={errors}
      UpdateItemModal={UpdateMaterialModal}
      dynamicColumns={dynamicColumns}
    />
  );
}

export default MaterialListView;
