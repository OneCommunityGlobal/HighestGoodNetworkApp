import { CPHeader } from '~/components/CommunityPortal';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { getWeeklySummaries } from '~/actions/weeklySummaries';
import Header from './Header';
import { getHeaderData } from '../../actions/authActions';
import { getAllRoles } from '../../actions/role';
import hasPermission from '../../utils/permissions';

export function HeaderRenderer(props) {
  const location = useLocation();
  const isCommunityPortal = location.pathname.startsWith('/communityportal');
  
  // Header is already Redux-connected; CPHeader still needs props from this wrapper.
  return isCommunityPortal ? <CPHeader {...props} /> : <Header />;
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