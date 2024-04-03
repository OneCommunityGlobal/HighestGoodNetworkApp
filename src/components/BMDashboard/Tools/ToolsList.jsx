import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { fetchToolTypes } from '../../../actions/bmdashboard/invTypeActions';
import { fetchTools } from 'actions/bmdashboard/toolActions';
import ToolItemListView from '../ToolItemList/ToolItemListView';
import ItemListView from '../ItemList/ItemListView';
import UpdateMaterialModal from '../UpdateMaterials/UpdateMaterialModal';

function MaterialListView() {
  const dispatch = useDispatch();
  const tools = useSelector(state => state.tools.toolslist);
  const errors = useSelector(state => state.errors);
  const postToolUpdateResult = useSelector(state => state.tools.updateTools);

  useEffect(() => {
    // dispatch(fetchToolTypes());
    // console.log("errors: ", errors)
    // console.log("postToolUpdateResult: ", postToolUpdateResult);
    dispatch(fetchTools());
    console.log("tools state: ", tools)
  }, []);

  useEffect(() => {
    // console.log("postToolUpdateResult changed")
    if (!postToolUpdateResult || postToolUpdateResult?.result == null) {
      // dispatch(fetchToolTypes());
      dispatch(fetchTools());
    }
  }, [postToolUpdateResult?.result]);

  const itemType = 'Tools';

  const dynamicColumns = [
    // { label: 'Unit', key: 'itemType.unit' },
    // { label: 'Bought', key: 'stockBought' },
    { label: 'Bought', key: 'purchaseStatus' },
    { label: 'Using', key: 'stockUsed' },
    { label: 'Available', key: 'stockAvailable' },
    { label: 'Waste', key: 'stockWasted' },
    { label: 'Code', key: 'code' },
    
  ];

  return (
    // <div>NOTHING HERE YET</div>
    <ToolItemListView
      itemType={itemType}
      items={tools}
      errors={errors}
      UpdateItemModal={UpdateMaterialModal}
      dynamicColumns={dynamicColumns}
    />
    // <ItemListView
    //   itemType={itemType}
    //   items={tools}
    //   errors={errors}
    //   UpdateItemModal={UpdateMaterialModal}
    //   dynamicColumns={dynamicColumns}
    // />
  );
}

export default MaterialListView;
