import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchTools } from '../../../actions/bmdashboard/toolActions';
import ToolItemListView from '../ToolItemList/ToolItemListView';
import UpdateToolModal from '../UpdateTools/UpdateToolModal';

function ToolsList() {
  const dispatch = useDispatch();
  const tools = useSelector(state => state.tools.toolslist);
  const errors = useSelector(state => state.errors);
  const postToolUpdateResult = useSelector(state => state.tools.updateTools);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('/bmdashboard/tools')) {
      document.title = 'Tools List';
    }
  }, [location]);

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
