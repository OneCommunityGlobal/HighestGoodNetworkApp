import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllReusables } from 'actions/bmdashboard/reusableActions';
import ItemListView from '../ItemList/ItemListView';
import UpdateReusableModal from '../UpdateReusables/UpdateReusableModal';

function ReusableListView() {
  const dispatch = useDispatch();
  const reusables = useSelector(state => state.bmReusables.reusablesList);
  const errors = useSelector(state => state.errors);
  const postReusableUpdateResult = useSelector(state => state.bmReusables.updateReusables);

  const reusablesWithId = reusables
    ? reusables.map(item => ({
        ...item,
        id:
          parseInt(item._id?.substring(item._id?.length - 6), 16) ||
          Math.floor(Math.random() * 1000000),
      }))
    : [];

  useEffect(() => {
    dispatch(fetchAllReusables());
  }, []);

  useEffect(() => {
    if (!postReusableUpdateResult || postReusableUpdateResult?.result == null)
      dispatch(fetchAllReusables());
  }, [postReusableUpdateResult?.result]);

  const itemType = 'Reusables';

  const dynamicColumns = [
    { label: 'Bought', key: 'stockBought' },
    { label: 'Available', key: 'stockAvailable' },
    { label: 'Destroyed', key: 'stockDestroyed' },
  ];

  return (
    <ItemListView
      itemType={itemType}
      items={reusablesWithId}
      errors={errors}
      UpdateItemModal={UpdateReusableModal}
      dynamicColumns={dynamicColumns}
    />
  );
}

export default ReusableListView;
