import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllConsumables } from '../../../actions/bmdashboard/consumableActions';
import ItemListView from '../ItemList/ItemListView';
import UpdateConsumableModal from '../UpdateConsumables/UpdateConsumableModal';

function ConsumableListView() {
  const dispatch = useDispatch();
  const consumables = useSelector(state => state.bmConsumables.consumableslist);
  const errors = useSelector(state => state.errors);
  const postConsumableUpdateResult = useSelector(state => state.bmConsumables.updateConsumables);

  const consumablesWithId = consumables
    ? consumables.map(item => ({
        ...item,
        id:
          parseInt(item._id.substring(item._id.length - 6), 16) ||
          Math.floor(Math.random() * 1000000), // Convert last 6 chars of _id to number, or use random as fallback
      }))
    : [];

  useEffect(() => {
    dispatch(fetchAllConsumables());
  }, []);

  useEffect(() => {
    if (!postConsumableUpdateResult || postConsumableUpdateResult?.result == null)
      dispatch(fetchAllConsumables());
  }, [postConsumableUpdateResult?.result]);

  const itemType = 'Consumables';

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
      items={consumablesWithId}
      errors={errors}
      UpdateItemModal={UpdateConsumableModal}
      dynamicColumns={dynamicColumns}
    />
  );
}

export default ConsumableListView;
