import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMaterials } from 'actions/bmdashboard/materialsActions';
import ItemListView from '../ItemListView';
import { resetMaterialUpdate } from 'actions/bmdashboard/materialsActions';
import UpdateMaterialModal from '../../UpdateMaterials/UpdateMaterialModal';

function MaterialListView() {
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials.materialslist);
  const errors = useSelector(state => state.errors);

  useEffect(() => {
    dispatch(fetchAllMaterials());
  }, [dispatch]);

  const dynamicColumns = [
    { label: 'Unit', key: 'itemType.unit' },
    { label: 'Bought', key: 'stockBought' },
    { label: 'Used', key: 'stockUsed' },
    { label: 'Available', key: 'stockAvailable' },
    { label: 'Waste', key: 'stockWasted' },
  ]

  return (

    <ItemListView
      items={materials}
      errors={errors}
      fetchItems={() => dispatch(fetchAllMaterials())}
      UpdateItemModal={UpdateMaterialModal}
      resetItemUpdate={resetMaterialUpdate}
      dynamicColumns={dynamicColumns}
    />

  );
}

export default MaterialListView;
