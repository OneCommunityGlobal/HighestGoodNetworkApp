import { useSelector } from 'react-redux';
import styles from '../styles/LeftSection.module.css';
import profilePic from './profile.jpg';
import { getFontColor } from '../../../../styles';

/* function LeftSection({ profileData }) { */
function LeftSection() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const profileData = useSelector(state => state.userSkills.profileData);
  return (
    <div className={`${styles.leftSection}`}>
      <img src={profilePic} alt="Profile" className={`${styles.profilePic}`} />
      <h1 className={getFontColor(darkMode)}>{profileData.name.displayName || 'Unknown User'}</h1>
      <h3 className={getFontColor(darkMode)}>{profileData.jobTitle?.[0] || 'Job Title - N/A'}</h3>
    </div>
  );
}

export default LeftSection;
