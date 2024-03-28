import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchToolTypes } from '../../../actions/bmdashboard/invTypeActions';
import ItemListView from '../ItemList/ItemListView';
import ToolItemListView from '../ToolItemList/ToolItemListView';
import UpdateMaterialModal from '../UpdateMaterials/UpdateMaterialModal';

function MaterialListView() {
  const dispatch = useDispatch();
  const tools = useSelector(state => state.tools.toolslist);
  const errors = useSelector(state => state.errors);
  const postToolUpdateResult = useSelector(state => state.tools.updateTools);

  useEffect(() => {
    dispatch(fetchToolTypes());
    // console.log("tools state: ", tools)
    // console.log("errors: ", errors)
    // console.log("postToolUpdateResult: ", postToolUpdateResult);
  }, []);

  useEffect(() => {
    if (!postToolUpdateResult || postToolUpdateResult?.result == null) {
      dispatch(fetchToolTypes());
    }
  }, [postToolUpdateResult?.result]);

  const itemType = 'Tools';

  const dynamicColumns = [
    // { label: 'Unit', key: 'itemType.unit' },
    { label: 'Bought', key: 'stockBought' },
    { label: 'Using', key: 'stockUsed' },
    { label: 'Available', key: 'stockAvailable' },
    { label: 'Waste', key: 'stockWasted' },
  ];

  return (
    <ToolItemListView
      itemType={itemType}
      items={tools}
      errors={errors}
      UpdateItemModal={UpdateMaterialModal}
      dynamicColumns={dynamicColumns}
    />
  );
}

export default MaterialListView;
