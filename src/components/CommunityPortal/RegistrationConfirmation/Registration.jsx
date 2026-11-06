import { useState } from 'react';
import RegistrationPopup from './RegistrationPopup';
import styles from './Registration.module.css';
import { useSelector } from 'react-redux';

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
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.container}`}>
        <button type="button" onClick={handleRegisterClick} className={`${styles.registerButton}`}>
          Register
        </button>

        {showPopup && <RegistrationPopup onClose={handleClosePopup} />}
      </div>
    </div>
  );
}

export default RegistrationPage;
