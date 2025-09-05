/* eslint-disable no-undef */
import { Component, useEffect, useState } from 'react';
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

// Move auth initialization to after store is ready
let authInitialized = false;

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
      console.warn('❌ No auth token found for WebSocket connection.');
    }
  }, []);

  return null;
}

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log the error
    logger.logError(error);

    // Log additional error info for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '100vh' }}
        >
          <div className="text-center">
            <h2>Something went wrong</h2>
            <p>We are sorry, but something unexpected happened. Please try refreshing the page.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
                <summary>Error Details (Development)</summary>
                <p>{this.state.error.toString()}</p>
                <p>{this.state.errorInfo.componentStack}</p>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storeReady: false,
      authInitialized: false,
    };
  }

  componentDidMount() {
    // Wait for store to be ready before initializing auth
    this.setState({ storeReady: true });

    // Initialize auth after a short delay to ensure store is fully ready
    setTimeout(() => {
      if (process.env.NODE_ENV !== 'test' && !authInitialized) {
        try {
          initAuth();
          authInitialized = true;
          this.setState({ authInitialized: true });
        } catch (error) {
          console.error('Error initializing auth:', error);
          logger.logError(error);
        }
      }
    }, 100);

    // Listen for storage events to sync auth state between tabs
    this.handleStorageChange = this.handleStorageChange.bind(this);
    window.addEventListener('storage', this.handleStorageChange);
  }

  componentWillUnmount() {
    // Clean up storage event listener
    if (this.handleStorageChange) {
      window.removeEventListener('storage', this.handleStorageChange);
    }
  }

  handleStorageChange(event) {
    // Sync auth state when localStorage changes in other tabs
    if (event.key === 'token' || event.key === 'authToken') {
      if (event.newValue && !authInitialized) {
        try {
          initAuth();
          authInitialized = true;
          this.setState({ authInitialized: true });
        } catch (error) {
          console.error('Error syncing auth from storage event:', error);
        }
      }
    }
  }

  componentDidCatch(error, errorInfo) {
    logger.logError(error);
    console.error('App component caught an error:', error, errorInfo);
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <ErrorBoundary>
            <ModalProvider>
              <Router>
                <UpdateDocumentTitle />
                {routes}
              </Router>
            </ModalProvider>
          </ErrorBoundary>
        </PersistGate>
      </Provider>
    );
  }
}
export default App;
