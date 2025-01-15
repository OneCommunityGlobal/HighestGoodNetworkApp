// ./src/index.js
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import logService from './services/logService';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/CommunityPortal/feedback-modal/App';

// Get the root element from your HTML (make sure the element exists)
const rootElement = document.getElementById('root');

// Create a root and render the App component
const root = createRoot(rootElement);
root.render(<App />);

//import FeedbackModal from './components/CommunityPortal/feedback-modal'; // Assuming this is correct path for feedback modal


//root.render(<FeedbackModal />); // Render FeedbackModal, which will call App

logService.init();
registerServiceWorker();
