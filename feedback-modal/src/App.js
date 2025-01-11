import React, { useState } from 'react';
import FeedbackModal from './components/FeedbackModal';
import './styles/App.css'; // Any global styles you need

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <button onClick={openModal}>Leave Feedback</button>
      <FeedbackModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default App;

