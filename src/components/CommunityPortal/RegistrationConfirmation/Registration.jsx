import { useState } from 'react';
import { useSelector } from 'react-redux';
import RegistrationPopup from './RegistrationPopup';
import styles from './Registration.module.css';

function RegistrationPage() {
  const [showPopup, setShowPopup] = useState(false);
  const darkMode = useSelector(state => state.theme?.darkMode);
  const userProfile = useSelector(state => state.userProfile);
  const authUser = useSelector(state => state.auth?.user);

  const resolveUserName = () => {
    const first = userProfile?.firstName || authUser?.firstName;
    const last = userProfile?.lastName || authUser?.lastName;

    if (first && last) return `${first} ${last}`;
    return authUser?.email || 'Community Member';
  };

  const handleRegisterClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className={darkMode ? styles.darkMode : ''} data-testid="registration-page-wrapper">
      <div className={styles.container}>
        <button type="button" onClick={handleRegisterClick} className={styles.registerButton}>
          Register
        </button>

        {showPopup && (
          <RegistrationPopup
            onClose={handleClosePopup}
            activity={{
              id: '1',
              name: 'Community Wellness Workshop',
              date: 'Tuesday, January 7th, 2025',
              time: '7:00 PM CST',
              location: 'Community Center',
              description: 'A community gathering focused on wellness and collaboration.',
            }}
            userName={resolveUserName()}
            userEmail={authUser?.email || userProfile?.email || 'member@example.com'}
          />
        )}
      </div>
    </div>
  );
}

export default RegistrationPage;
