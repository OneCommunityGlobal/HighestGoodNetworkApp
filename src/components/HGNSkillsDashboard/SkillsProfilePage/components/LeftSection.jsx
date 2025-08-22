import styles from '../styles/LeftSection.module.css';
import profilePic from './profile.jpg';

function LeftSection({ profileData, darkMode }) {
  return (
    <div
      className={`${styles.leftSection} ${darkMode ? styles.dark : ''}`}
      style={{
        background: darkMode ? '#303b4fff' : '#fff',
        color: darkMode ? '#f7fafc' : '#3e4c66ff',
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      <img src={profilePic} alt="Profile" className={`${styles.profilePic}`} />
      <h1
        style={{
          color: darkMode ? '#6c8ea7ff' : '#3182ce',
        }}
      >
        {profileData.name.displayName || 'Unknown User'}
      </h1>
      <h3>{profileData.jobTitle?.[0] || 'Job Title - N/A'}</h3>
    </div>
  );
}

export default LeftSection;
