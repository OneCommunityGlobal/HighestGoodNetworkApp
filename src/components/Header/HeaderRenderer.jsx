/* eslint-disable import/order */
/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/no-named-as-default */
/* eslint-disable import/namespace */
/* eslint-disable import/default */
import { CPHeader } from '~/components/CommunityPortal';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { getWeeklySummaries } from '~/actions/weeklySummaries';
import { Header } from './Header';
import { getHeaderData } from '../../actions/authActions';
import { getAllRoles } from '../../actions/role';
import hasPermission from '../../utils/permissions';

export function HeaderRenderer(props) {
  const location = useLocation();
  const isCommunityPortal = location.pathname.startsWith('/communityportal');
  
// eslint-disable-next-line react/jsx-props-no-spreading
  return isCommunityPortal ? <CPHeader {...props} /> : <Header {...props} />;
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