// ./src/index.js
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import logService from './services/logService';
import React from 'react';
import ReactDOM from 'react-dom'; // Use ReactDOM from 'react-dom' for React 17
import App from './components/CommunityPortal/feedback-modal/App';

// Get the root element from your HTML (make sure the element exists)
const rootElement = document.getElementById('root');

// Use ReactDOM.render for React 17
ReactDOM.render(<App />, rootElement);

logService.init();
registerServiceWorker();
