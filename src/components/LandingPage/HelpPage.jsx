// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import HelpModal from './HelpModal';
import SummaryBar from '../SummaryBar/SummaryBar';
import { useHistory } from 'react-router-dom';

function HelpPage() {
  const [showModal, setShowModal] = useState(true);
  const history = useHistory();

  useEffect(() => {
    // Show modal when component mounts
    setShowModal(true);
  }, []);

  const handleClose = () => {
    setShowModal(false);
    // Navigate back to previous page or dashboard
    history.push('/dashboard');
  };

  return (
    <>
      <SummaryBar />
      <HelpModal 
        show={showModal} 
        onHide={handleClose}
      />
    </>
  );
}

export default HelpPage;
