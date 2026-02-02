import { CPHeader } from '~/components/CommunityPortal';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { getWeeklySummaries } from '~/actions/weeklySummaries';
import { Header } from './Header';
import KitchenHeader from '../KitchenInterfaces/KitchenHeader';
import { getHeaderData } from '../../actions/authActions';
import { getAllRoles } from '../../actions/role';
import hasPermission from '../../utils/permissions';

export function HeaderRenderer(props) {
  const location = useLocation();
  const isCommunityPortal = location.pathname.startsWith('/communityportal');
  const isKitchenInterface = location.pathname.startsWith('/kitchenandinventory');
  const isEducationEvaluation = location.pathname.startsWith('/educationportal/evaluation-results');

  // Hide header for education portal evaluation results page
  if (isEducationEvaluation) {
    return null;
  }

  if (isKitchenInterface) {
    return (
      <>
        <Header {...props} />
        <KitchenHeader />
      </>
    );
  }

// eslint-disable-next-line react/jsx-props-no-spreading
  return isCommunityPortal ? <CPHeader {...props} /> : <Header {...props}/>;
}


const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  taskEditSuggestionCount: state.taskEditSuggestions.count,
  role: state.role,
  notification: state.notification,
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps, {
  getHeaderData,
  getAllRoles,
  hasPermission,
  getWeeklySummaries,
})(HeaderRenderer);