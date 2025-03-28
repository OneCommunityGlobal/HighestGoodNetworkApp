// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import HelpModal from './HelpModal';

function HelpPage() {
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    // Show modal when component mounts
    setShowModal(true);
  }, []);

  const handleClose = () => {
    setShowModal(false);
    // Navigate back to previous page or dashboard
    window.history.back();
  };

  return <HelpModal show={showModal} onHide={handleClose} />;
}

export default HelpPage;
