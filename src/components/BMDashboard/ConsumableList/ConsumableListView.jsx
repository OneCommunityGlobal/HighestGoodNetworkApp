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

  const transformedConsumables = consumables
    ? consumables
        .map(item => ({
          ...item,
          projectName: item.project?.name || 'N/A',
          name: item.itemType?.name || 'N/A',
          unit: item.itemType?.unit || 'N/A',
          inventoryItemType: item.itemType?.name || 'N/A',
          type: item.itemType?.name || 'N/A',
          itemType: item.itemType || { name: 'N/A', unit: '' },
          id: item._id,
        }))
        .filter(item => item.name !== 'N/A')
    : [];

  useEffect(() => {
    dispatch(fetchAllConsumables());
  }, [dispatch]);

  useEffect(() => {
    if (!postConsumableUpdateResult || postConsumableUpdateResult?.result == null)
      dispatch(fetchAllConsumables());
  }, [postConsumableUpdateResult?.result, dispatch]);

  const itemTypeLabel = 'Consumables';

  const dynamicColumns = [
    { label: 'Unit', key: 'unit' },
    { label: 'Bought', key: 'stockBought' },
    { label: 'Used', key: 'stockUsed' },
    { label: 'Available', key: 'stockAvailable' },
    { label: 'Waste', key: 'stockWasted' },
  ];

  return (
    <ItemListView
      itemType={itemTypeLabel}
      items={transformedConsumables}
      errors={errors}
      UpdateItemModal={UpdateConsumableModal}
      dynamicColumns={dynamicColumns}
    />
  );
}

export default ConsumableListView;
