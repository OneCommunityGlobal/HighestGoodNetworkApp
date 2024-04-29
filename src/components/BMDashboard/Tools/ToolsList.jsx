import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTools } from '../../../actions/bmdashboard/toolActions';
import ToolItemListView from '../ToolItemList/ToolItemListView';
import UpdateToolModal from '../UpdateTools/UpdateToolModal';

function ToolsList() {
  const dispatch = useDispatch();
  const tools = useSelector(state => state.tools.toolslist);
  const errors = useSelector(state => state.errors);
  const postToolUpdateResult = useSelector(state => state.tools.updateTools);

  useEffect(() => {
    dispatch(fetchTools());
  }, []);

  useEffect(() => {
    if (!postToolUpdateResult || postToolUpdateResult?.result == null) {
      dispatch(fetchTools());
    }
  }, [postToolUpdateResult?.result]);

  const itemType = 'Tools';

  const dynamicColumns = [
    { label: 'Bought', key: 'purchaseStatus' },
    { label: 'Using', key: 'stockUsed' },
    { label: 'Available', key: 'stockAvailable' },
    { label: 'Condition', key: 'condition' },
    { label: 'Code', key: 'code' },
  ];

  return (
    <ToolItemListView
      itemType={itemType}
      items={tools}
      errors={errors}
      UpdateItemModal={UpdateToolModal}
      dynamicColumns={dynamicColumns}
    />
  );
}

export default ToolsList;
