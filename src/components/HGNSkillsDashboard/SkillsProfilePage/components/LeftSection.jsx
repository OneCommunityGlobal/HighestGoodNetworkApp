import { useSelector } from 'react-redux';
import styles from '../styles/LeftSection.module.css';
import profilePic from './profile.jpg';

/* function LeftSection({ profileData }) { */
export default function LeftSection() {
  const profileData = useSelector(state => state.userSkills.profileData);
  const darkMode = useSelector(state => state?.theme?.darkMode);

  return (
    <aside className={`${styles.container} ${darkMode ? styles.dark : ''}`}>
      <img src={profilePic} alt="Profile" className={`${styles.profilePic}`} />
      <h1>{profileData.name.displayName || 'Unknown User'}</h1>
      <h3>{profileData.jobTitle?.[0] || 'Job Title - N/A'}</h3>
    </aside>
  );
}
