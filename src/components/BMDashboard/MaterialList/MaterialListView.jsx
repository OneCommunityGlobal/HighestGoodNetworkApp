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

  // Transform the materials to match expected PropTypes
  const transformedMaterials =
    materials?.map(material => ({
      ...material,
      id: parseInt(material._id?.split('-')[0], 16) || Math.random(), // Convert first part of _id to number or use random fallback
      name: material.itemType?.name || 'Unnamed Material',
    })) || [];

  useEffect(() => {
    dispatch(fetchAllMaterials());
  }, []);

  useEffect(() => {
    if (postMaterialUpdateResult?.result != null) {
      // Update only the changed material in the local state if possible
      const updatedMaterial = postMaterialUpdateResult.result;
      if (updatedMaterial && updatedMaterial._id) {
        // If we have the updated material data, we can update it locally
        dispatch({
          type: 'SET_MATERIALS',
          payload: materials.map(mat => (mat._id === updatedMaterial._id ? updatedMaterial : mat)),
        });
      } else {
        // Fallback to full refresh only if necessary
        fetchAllMaterials();
      }
    }
  }, [postMaterialUpdateResult?.result, materials, dispatch, fetchAllMaterials]);

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
      items={transformedMaterials}
      errors={errors}
      UpdateItemModal={UpdateMaterialModal}
      dynamicColumns={dynamicColumns}
    />
  );
}

export default MaterialListView;
