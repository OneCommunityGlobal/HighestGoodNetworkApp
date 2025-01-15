// ./src/components/CommunityPortal/feedback-modal/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';  // Correct path to your App component
import FeedbackModal from './FeedbackModal';  // Ensure this is the correct path
export default FeedbackModal;

// Get the root element from your HTML (make sure the element exists)
const rootElement = document.getElementById('root');

// Create a root and render the App component
const root = createRoot(rootElement);
root.render(<App />);
