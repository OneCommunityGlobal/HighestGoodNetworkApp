import { useSelector } from 'react-redux';
import styles from '../styles/LeftSection.module.css';
import profilePic from './profile.jpg';

/* function LeftSection({ profileData }) { */
function LeftSection() {
  const profileData = useSelector(state => state.userSkills.profileData);
  return (
    <div className={`${styles.leftSection}`}>
      <img src={profilePic} alt="Profile" className={`${styles.profilePic}`} />
      <h1>{profileData.name.displayName || 'Unknown User'}</h1>
      <h3>{profileData.jobTitle?.[0] || 'Job Title - N/A'}</h3>
    </div>
  );
}

export default LeftSection;
