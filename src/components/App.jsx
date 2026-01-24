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
import '../App.module.css';
import { initMessagingSocket } from '../utils/messagingSocket';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ThemeManager from './common/ThemeManager';

// TODO: Fix undefined search parameters in Feedback page - Phase 1: Analysis & Planning

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
    { pattern: /^\/kitchenandinventory\/login$/, title: 'Kitchen and Inventory Login' },
    { pattern: /^\/kitchenandinventory$/, title: 'Kitchen and Inventory Dashboard' },
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
      try {
        initMessagingSocket(token);
      } catch (error) {
        // console.error('WebSocket initialization failed:', error);
        return error;
      }
    }
    // else {
    //   // console.warn('No auth token found for WebSocket connection');
    // }
  }, []);

  return null;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }; // Moving state initialization into constructor as per linting rule.
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    logger.logError(error);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>Something went wrong</h1>
          <p style={{ marginBottom: '20px', color: '#6c757d' }}>
            We apologize for the inconvenience. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '20px', textAlign: 'left', maxWidth: '800px' }}>
              <summary style={{ cursor: 'pointer', color: '#dc3545' }}>
                Error Details (Development Only)
              </summary>
              <pre
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  marginTop: '10px',
                }}
              >
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return (
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <ModalProvider>
              <Router>
                <ThemeManager />
                <UpdateDocumentTitle />
                {routes}
              </Router>
            </ModalProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    );
  }
}
export default App;
