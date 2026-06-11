import { useState } from 'react';
import { useSelector } from 'react-redux';
import RegistrationPopup from './RegistrationPopup';

function RegistrationPage() {
  const [showPopup, setShowPopup] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleRegisterClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '16px',
        backgroundColor: darkMode ? '#1a1d23' : '#f9fafb',
        color: darkMode ? '#ffffff' : '#000000',
      }}
    >
      <button
        type="button"
        style={{
          marginTop: '20px',
          marginBottom: '20px',
          backgroundColor: '#3A506B',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer',
          border: 'none',
        }}
        onClick={handleRegisterClick}
      >
        Register
      </button>

      {showPopup && <RegistrationPopup onClose={handleClosePopup} />}
    </div>
  );
}

export default RegistrationPage;
