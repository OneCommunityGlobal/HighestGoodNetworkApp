import React, { Component, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import { Provider } from 'react-redux';
import { BrowserRouter as Router , useLocation} from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import routes from '../routes';
import logger from '../services/logService';

import httpService from '../services/httpService';
import { setCurrentUser, logoutUser } from '../actions/authActions';

import configureStore from '../store';
import Loading from './common/Loading';

import config from '../config.json';
import '../App.css';

const { persistor, store } = configureStore();
const {tokenKey} = config;
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

  useEffect(() => {
    // Customize the title based on the route path
    switch (true) {
      case /^\/ProfileInitialSetup\/[^/]+$/.test(location.pathname):
        document.title = 'Profile Initial Setup';
        break;
      case /^\/dashboard$/.test(location.pathname):
        document.title = 'Dashboard';
        break;
      case /^\/dashboard\/[^/]+$/.test(location.pathname):
        document.title = 'User Dashboard';
        break;
      case /^\/project\/members\/[^/]+$/.test(location.pathname):
        document.title = 'Project Members';
        break;
      case /^\/timelog\/?$/.test(location.pathname):
        document.title = 'Timelog';
        break;
      case /^\/timelog\/[^/]+$/.test(location.pathname):
        document.title = 'User Timelog';
        break;
      case /^\/peoplereport\/[^/]+$/.test(location.pathname):
        document.title = 'People Report';
        break;
      case /^\/projectreport\/[^/]+$/.test(location.pathname):
        document.title = 'Project Report';
        break;
      case /^\/teamreport\/[^/]+$/.test(location.pathname):
        document.title = 'Team Report';
        break;
      case /^\/taskeditsuggestions$/.test(location.pathname):
        document.title = 'Task Edit Suggestions';
        break;
      case /^\/inventory\/[^/]+$/.test(location.pathname):
        document.title = 'Inventory';
        break;
      case /^\/inventory\/[^/]+\/wbs\/[^/]+$/.test(location.pathname):
        document.title = 'Inventory WBS';
        break;
      case /^\/weeklysummariesreport$/.test(location.pathname):
        document.title = 'Weekly Summaries Report';
        break;
      case /^\/reports$/.test(location.pathname):
        document.title = 'Reports';
        break;
      case /^\/teamlocations$/.test(location.pathname):
        document.title = 'Team Locations';
        break;
      case /^\/projects$/.test(location.pathname):
        document.title = 'Projects';
        break;
      case /^\/wbs\/tasks\/[^/]+\/[^/]+\/[^/]+$/.test(location.pathname):
        document.title = 'WBS Task Detail';
        break;
      case /^\/project\/wbs\/[^/]+$/.test(location.pathname):
        document.title = 'Project WBS';
        break;
      case /^\/wbs\/tasks\/[^/]+\/[^/]+$/.test(location.pathname):
        document.title = 'WBS Task Detail';
        break;
      case /^\/wbs\/tasks\/[^/]+$/.test(location.pathname):
        document.title = 'Single Task';
        break;
      case /^\/wbs\/samefoldertasks\/[^/]+$/.test(location.pathname):
        document.title = 'Same Folder Tasks';
        break;
      case /^\/usermanagement$/.test(location.pathname):
        document.title = 'User Management';
        break;
      case /^\/badgemanagement$/.test(location.pathname):
        document.title = 'Badge Management';
        break;
      case /^\/permissionsmanagement$/.test(location.pathname):
        document.title = 'Permissions Management';
        break;
      case /^\/permissionsmanagement\/[^/]+$/.test(location.pathname):
        document.title = 'User Role Permissions';
        break;
      case /^\/teams$/.test(location.pathname):
        document.title = 'Teams';
        break;
      case /^\/announcements$/.test(location.pathname):
        document.title = 'Announcements';
        break;
      case /^\/totalorgsummary$/.test(location.pathname):
        document.title = 'Total Organization Summary';
        break;
      case /^\/bmdashboard$/.test(location.pathname):
        document.title = 'BM Dashboard';
        break;
      case /^\/bmdashboard\/login$/.test(location.pathname):
        document.title = 'BM Dashboard Login';
        break;
      case /^\/bmdashboard\/materials\/purchase$/.test(location.pathname):
        document.title = 'Purchase Materials';
        break;
      case /^\/bmdashboard\/reusables\/purchase$/.test(location.pathname):
        document.title = 'Purchase Reusables';
        break;
      case /^\/bmdashboard\/equipment\/purchase$/.test(location.pathname):
        document.title = 'Purchase Equipment';
        break;
      case /^\/bmdashboard\/tools\/purchase$/.test(location.pathname):
        document.title = 'Purchase Tools';
        break;
      case /^\/bmdashboard\/projects\/[^/]+$/.test(location.pathname):
        document.title = 'BM Project Details';
        break;
      case /^\/bmdashboard\/lessonlist\/?$/.test(location.pathname):
        document.title = 'Lesson List';
        break;
      case /^\/bmdashboard\/materials\/update$/.test(location.pathname):
        document.title = 'Update Materials in Bulk';
        break;
      case /^\/bmdashboard\/reusables\/update$/.test(location.pathname):
        document.title = 'Update Reusables in Bulk';
        break;
      case /^\/bmdashboard\/materials\/add$/.test(location.pathname):
        document.title = 'Add Material';
        break;
      case /^\/bmdashboard\/equipment\/add$/.test(location.pathname):
        document.title = 'Add Equipment Type';
        break;
      case /^\/bmdashboard\/consumables\/purchase$/.test(location.pathname):
        document.title = 'Purchase Consumable';
        break;
      case /^\/bmdashboard\/inventory\/types$/.test(location.pathname):
        document.title = 'Check Inventory Types';
        break;
      case /^\/bmdashboard\/equipment$/.test(location.pathname):
        document.title = 'Equipment List';
        break;
      case /^\/bmdashboard\/equipment\/[^/]+$/.test(location.pathname):
        document.title = 'Equipment Detail';
        break;
      case /^\/bmdashboard\/consumables$/.test(location.pathname):
        document.title = 'Consumable List';
        break;
      case /^\/bmdashboard\/materials$/.test(location.pathname):
        document.title = 'Material List';
        break;
      case /^\/bmdashboard\/consumables\/add$/.test(location.pathname):
        document.title = 'Add Consumable';
        break;
      case /^\/bmdashboard\/reusables$/.test(location.pathname):
        document.title = 'Reusable List';
        break;
      case /^\/bmdashboard\/tools\/[^/]+\/update$/.test(location.pathname):
        document.title = 'Update Tool';
        break;
      case /^\/bmdashboard\/tools$/.test(location.pathname):
        document.title = 'Tools List';
        break;
      case /^\/bmdashboard\/tools\/add$/.test(location.pathname):
        document.title = 'Add Tool';
        break;
      case /^\/bmdashboard\/tools\/log$/.test(location.pathname):
        document.title = 'Log Tools';
        break;
      case /^\/bmdashboard\/tools\/[^/]+$/.test(location.pathname):
        document.title = 'Tool Detail';
        break;
      case /^\/bmdashboard\/lessonform\/[^/]*$/.test(location.pathname):
        document.title = 'Lesson Form';
        break;
      case /^\/bmdashboard\/inventorytypes$/.test(location.pathname):
        document.title = 'Inventory Types List';
        break;
      case /^\/login$/.test(location.pathname):
        document.title = 'Login';
        break;
      case /^\/forgotpassword$/.test(location.pathname):
        document.title = 'Forgot Password';
        break;
      case /^\/email-subscribe$/.test(location.pathname):
        document.title = 'Email Subscribe';
        break;
      case /^\/email-unsubscribe$/.test(location.pathname):
        document.title = 'Unsubscribe';
        break;
      case /^\/infoCollections$/.test(location.pathname):
        document.title = 'Info Collections';
        break;
      case /^\/userprofile\/[^/]+$/.test(location.pathname):
        document.title = 'User Profile';
        break;
      case /^\/userprofileedit\/[^/]+$/.test(location.pathname):
        document.title = 'Edit User Profile';
        break;
      case /^\/updatepassword\/[^/]+$/.test(location.pathname):
        document.title = 'Update Password';
        break;
      case /^\/Logout$/.test(location.pathname):
        document.title = 'Logout';
        break;
      case /^\/forcePasswordUpdate\/[^/]+$/.test(location.pathname):
        document.title = 'Force Password Update';
        break;
      case /^\/$/.test(location.pathname):
        document.title = 'Dashboard';
        break;
      default:
        document.title = 'HGN APP';
    }    
  }, [location]);

  return null;
}



class App extends Component {
  state = {};

  componentDidCatch(error, errorInfo) {
    logger.logError(error);
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <Router>
            <UpdateDocumentTitle />
            {routes}
          </Router>
        </PersistGate>
      </Provider>
    );
  }
}
export default App;
