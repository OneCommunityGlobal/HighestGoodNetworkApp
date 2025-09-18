import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';
// import './components/Community-portal/feedback-modal/styles/App.css'; // Any global styles you need

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <button type="button" onClick={openModal}>
        Leave Feedback
      </button>
      <FeedbackModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}

export default App;
