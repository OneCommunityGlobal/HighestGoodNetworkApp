import styles from '../styles/LeftSection.module.css';
import profilePic from './profile.jpg';

function LeftSection({ profileData, darkMode }) {
  return (
    <div
      className={`${styles.leftSection} ${darkMode ? styles.dark : ''}`}
      style={{
        background: darkMode ? '#232b39' : '#fff',
        color: darkMode ? '#f7fafc' : '#2d3748',
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      <img src={profilePic} alt="Profile" className={`${styles.profilePic}`} />
      <h1>{profileData.name.displayName || 'Unknown User'}</h1>
      <h3>{profileData.jobTitle?.[0] || 'Job Title - N/A'}</h3>
    </div>
  );
}

export default LeftSection;
