/* eslint-disable no-undef */
import { Component, useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { ModalProvider } from '../context/ModalContext';
import { persistor, store } from '../store';
import initAuth from '../utils/authInit';
import routes from '../routes';
import logger from '../services/logService';
import Loading from './common/Loading';
import '../App.css';
import { initMessagingSocket } from '../utils/messagingSocket';

// Check for token
if (process.env.NODE_ENV !== 'test') {
  initAuth();
}

function UpdateDocumentTitle() {
  const location = useLocation();
  const authUser = useSelector(state => state.userProfile);
  const fullName =
    authUser?.firstName && authUser?.lastName
      ? `${authUser.firstName} ${authUser.lastName}`
      : 'User';
  // Define the routes array with pattern and title
  const Routes = [
    { pattern: /^\/ProfileInitialSetup\/[^/]+$/, title: 'Profile Initial Setup' },
    { pattern: /^\/dashboard$/, title: `Dashboard - ${fullName}` },
    { pattern: /^\/dashboard\/[^/]+$/, title: `Dashboard - ${fullName}` },
    { pattern: /^\/project\/members\/[^/]+$/, title: 'Project Members' },
    { pattern: /^\/timelog\/?$/, title: `Timelog - ${fullName}` },
    { pattern: /^\/timelog\/[^/]+$/, title: `Timelog - ${fullName}` },
    { pattern: /^\/peoplereport\/[^/]+$/, title: `People Report - ${fullName}` },
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
    { pattern: /^\/bmdashboard\/tools\/equipmentupdate$/, title: 'Update Equipment or Tool' },
    { pattern: /^\/bmdashboard\/tools\/log$/, title: 'Log Tools' },
    { pattern: /^\/bmdashboard\/tools\/[^/]+$/, title: 'Tool Detail' },
    { pattern: /^\/bmdashboard\/lessonform\/[^/]*$/, title: 'Lesson Form' },
    { pattern: /^\/bmdashboard\/inventorytypes$/, title: 'Inventory Types List' },
    { pattern: /^\/bmdashboard\/totalconstructionsummary$/, title: 'Total Construction Summary' },
    { pattern: /^\/login$/, title: 'Login' },
    { pattern: /^\/forgotpassword$/, title: 'Forgot Password' },
    { pattern: /^\/email-subscribe$/, title: 'Email Subscribe' },
    { pattern: /^\/email-unsubscribe$/, title: 'Unsubscribe' },
    { pattern: /^\/infoCollections$/, title: 'Info Collections' },
    { pattern: /^\/userprofile\/[^/]+$/, title: `User Profile` },
    { pattern: /^\/userprofileedit\/[^/]+$/, title: `Edit User Profile` },
    { pattern: /^\/updatepassword\/[^/]+$/, title: 'Update Password' },
    { pattern: /^\/Logout$/, title: 'Logout' },
    { pattern: /^\/forcePasswordUpdate\/[^/]+$/, title: 'Force Password Update' },
    { pattern: /^\/$/, title: `Dashboard - ${fullName}` },
    { pattern: /.*/, title: 'HGN APP' }, // Default case
    {
      pattern: /^\/communityportal\/activity\/activityid\/feedback$/,
      title: 'Activity Feedback',
    },
  ];

  useEffect(() => {
    // Find the first matching route and set the document title
    const match = Routes.find(route => route.pattern.test(location.pathname));
    document.title = match.title;
  }, [location, fullName]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      initMessagingSocket(token);
    } else {
      Error('❌ No auth token found for WebSocket connection.');
    }
  }, []);

  return null;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {}; // Moving state initialization into constructor as per linting rule.
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
