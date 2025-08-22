import { useState } from 'react';
import RegistrationPopup from './RegistrationPopup'; // Ensure correct path

function RegistrationPage() {
  const [showPopup, setShowPopup] = useState(false);

  const handleRegisterClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
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
        }}
        onClick={handleRegisterClick}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg text-lg shadow-md"
      >
        Register
      </button>

      {showPopup && <RegistrationPopup onClose={handleClosePopup} />}
    </div>
  );
}

export default RegistrationPage;
