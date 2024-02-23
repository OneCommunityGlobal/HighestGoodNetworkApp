import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMaterials } from 'actions/bmdashboard/materialsActions';
import ItemListView from '../ItemListView';
import UpdateMaterialModal from '../../UpdateMaterials/UpdateMaterialModal';

function MaterialListView() {
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials.materialslist);
  const errors = useSelector(state => state.errors);

  useEffect(() => {
    dispatch(fetchAllMaterials());
  }, [dispatch]);

  return (

    <ItemListView
      items={materials}
      errors={errors}
      fetchItems={() => dispatch(fetchAllMaterials())}
      UpdateItemModal={UpdateMaterialModal}
    />

  );
}

export default MaterialListView;
