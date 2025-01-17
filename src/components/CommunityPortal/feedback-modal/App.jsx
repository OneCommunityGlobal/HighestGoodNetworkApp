import React, { Component, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import { Provider, useSelector } from 'react-redux';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { ModalProvider } from 'context/ModalContext';
import routes from '../../../routes';
import logger from '../../../services/logService';

import httpService from '../../../services/httpService';
import { setCurrentUser, logoutUser } from '../../../actions/authActions';

import configureStore from '../../../store';
import Loading from '../../common/Loading';

import config from '../../../config.json';
// import './components/CommunityPortal/feedback-modal/styles/App.css';

const { persistor, store } = configureStore();
const { tokenKey } = config;
// Require re-login 2 days before the token expires on server side
// Avoid failure due to token expiration when user is working
const TOKEN_LIFETIME_BUFFER = 86400 * 2;

// Check for token
if (localStorage.getItem(tokenKey)) {
  // Decode token and get user info and exp
  const decoded = jwtDecode(localStorage.getItem(tokenKey));
  // Check for expired token
  const currentTime = Date.now() / 1000;
  const expiryTime = new Date(decoded.expiryTimestamp).getTime() / 1000;
  // console.log(currentTime, expiryTime);
  if (expiryTime - TOKEN_LIFETIME_BUFFER < currentTime) {
    // Logout user
    store.dispatch(logoutUser());
  } else {
    // Set auth token header auth
    httpService.setjwt(localStorage.getItem(tokenKey));
    // Set user and isAuthenticated
    store.dispatch(setCurrentUser(decoded));
  }
}

function UpdateDocumentTitle() {
  const location = useLocation();
  const authUser = useSelector(state => state.userProfile);
  const fullName =
    authUser?.firstName && authUser?.lastName
      ? `${authUser.firstName} ${authUser.lastName}`
      : 'User';

  // Define the routes array with pattern and title
  /* const routes = [
    { pattern: /^\/ProfileInitialSetup\/[^/]+$/, title: 'Profile Initial Setup' },
    { pattern: /^\/dashboard$/, title: `Dashboard - ${fullName}` },
    { pattern: /^\/dashboard\/[^/]+$/, title: `Dashboard - ${fullName}` },
    { pattern: /^\/project\/members\/[^/]+$/, title: 'Project Members' },
    { pattern: /^\/timelog\/?$/, title: `Timelog - ${fullName}` },
    { pattern: /^\/timelog\/[^/]+$/, title: `Timelog - ${fullName}` },
    { pattern: /^\/peoplereport\/[^/]+$/, title: `People Report- ${fullName}` },
    { pattern: /^\/projectreport\/[^/]+$/, title: 'Project Report' },
    { pattern: /^\/teamreport\/[^/]+$/, title: 'Team Report' },
    { pattern: /^\/taskeditsuggestions$/, title: 'Task Edit Suggestions' },
    { pattern: /^\/inventory\/[^/]+$/, title: 'Inventory' },
    { pattern: /^\/inventory\/[^/]+\/wbs\/[^/]+$/, title: 'Inventory WBS' },
    { pattern: /^\/weeklysummariesreport$/, title: 'Weekly Summaries Report' },
    { pattern: /^\/reports$/, title: 'Reports' },
    { pattern: /^\/teamlocations$/, title: 'Team Locations' },
    { pattern: /^\/projects$/, title: 'Projects' },
    { pattern: /^\/wbs\/tasks\/[^/]+\/[^/]+\/[^/]+$/, title: 'WBS Task Detail' },
    { pattern: /^\/project\/wbs\/[^/]+$/, title: 'Project WBS' },
    { pattern: /^\/wbs\/tasks\/[^/]+\/[^/]+$/, title: 'WBS Task Detail' },
    { pattern: /^\/wbs\/tasks\/[^/]+$/, title: 'Single Task' },
    { pattern: /^\/wbs\/samefoldertasks\/[^/]+$/, title: 'Same Folder Tasks' },
    { pattern: /^\/usermanagement$/, title: 'User Management' },
    { pattern: /^\/badgemanagement$/, title: 'Badge Management' },
    { pattern: /^\/permissionsmanagement$/, title: 'Permissions Management' },
    { pattern: /^\/permissionsmanagement\/[^/]+$/, title: 'User Role Permissions' },
    { pattern: /^\/teams$/, title: 'Teams' },
    { pattern: /^\/announcements$/, title: 'Announcements' },
    { pattern: /^\/totalorgsummary$/, title: 'Total Organization Summary' },
    { pattern: /^\/bmdashboard$/, title: 'BM Dashboard' },
    { pattern: /^\/bmdashboard\/login$/, title: 'BM Dashboard Login' },
    { pattern: /^\/bmdashboard\/materials\/purchase$/, title: 'Purchase Materials' },
    { pattern: /^\/bmdashboard\/reusables\/purchase$/, title: 'Purchase Reusables' },
    { pattern: /^\/bmdashboard\/equipment\/purchase$/, title: 'Purchase Equipment' },
    { pattern: /^\/bmdashboard\/tools\/purchase$/, title: 'Purchase Tools' },
    { pattern: /^\/bmdashboard\/projects\/[^/]+$/, title: 'BM Project Details' },
    { pattern: /^\/bmdashboard\/lessonlist\/?$/, title: 'Lesson List' },
    { pattern: /^\/bmdashboard\/materials\/update$/, title: 'Update Materials in Bulk' },
    { pattern: /^\/bmdashboard\/reusables\/update$/, title: 'Update Reusables in Bulk' },
    { pattern: /^\/bmdashboard\/materials\/add$/, title: 'Add Material' },
    { pattern: /^\/bmdashboard\/equipment\/add$/, title: 'Add Equipment Type' },
    { pattern: /^\/bmdashboard\/consumables\/purchase$/, title: 'Purchase Consumable' },
    { pattern: /^\/bmdashboard\/inventory\/types$/, title: 'Check Inventory Types' },
    { pattern: /^\/bmdashboard\/equipment$/, title: 'Equipment List' },
    { pattern: /^\/bmdashboard\/equipment\/[^/]+$/, title: 'Equipment Detail' },
    { pattern: /^\/bmdashboard\/consumables$/, title: 'Consumable List' },
    { pattern: /^\/bmdashboard\/materials$/, title: 'Material List' },
    { pattern: /^\/bmdashboard\/consumables\/add$/, title: 'Add Consumable' },
    { pattern: /^\/bmdashboard\/reusables$/, title: 'Reusable List' },
    { pattern: /^\/bmdashboard\/tools\/[^/]+\/update$/, title: 'Update Tool' },
    { pattern: /^\/bmdashboard\/tools$/, title: 'Tools List' },
    { pattern: /^\/bmdashboard\/tools\/add$/, title: 'Add Tool' },
    { pattern: /^\/bmdashboard\/tools\/log$/, title: 'Log Tools' },
    { pattern: /^\/bmdashboard\/tools\/[^/]+$/, title: 'Tool Detail' },
    { pattern: /^\/bmdashboard\/lessonform\/[^/]*$/, title: 'Lesson Form' },
    { pattern: /^\/bmdashboard\/inventorytypes$/, title: 'Inventory Types List' },
    { pattern: /^\/login$/, title: 'Login' },
    { pattern: /^\/forgotpassword$/, title: 'Forgot Password' },
    { pattern: /^\/email-subscribe$/, title: 'Email Subscribe' },
    { pattern: /^\/email-unsubscribe$/, title: 'Unsubscribe' },
    { pattern: /^\/infoCollections$/, title: 'Info Collections' },
    { pattern: /^\/userprofile\/[^/]+$/, title: `User Profile- ${fullName}` },
    { pattern: /^\/userprofileedit\/[^/]+$/, title: `Edit User Profile- ${fullName}` },
    { pattern: /^\/updatepassword\/[^/]+$/, title: 'Update Password' },
    { pattern: /^\/Logout$/, title: 'Logout' },
    { pattern: /^\/forcePasswordUpdate\/[^/]+$/, title: 'Force Password Update' },
    { pattern: /^\/$/, title: `Dashboard - ${fullName}` }, */
  // { pattern: /.*/, title: 'HGN APP' }, // Default case
  // ];

  useEffect(() => {
    // Find the first matching route and set the document title
    const match = routes.find(route => route.pattern.test(location.pathname));
    document.title = match.title;
  }, [location, fullName]);

  return null;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidCatch(error) {
    logger.logError(error);
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <ModalProvider>
            <Router>
              <UpdateDocumentTitle />
              {routes}
            </Router>
          </ModalProvider>
        </PersistGate>
      </Provider>
    );
  }
}
export default App;
