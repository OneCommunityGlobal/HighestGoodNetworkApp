import { useSelector } from 'react-redux';
import styles from '../styles/ProfileDetails.module.css';
import { getFontColor } from '../../../../styles';

// function ProfileDetails({ profileData }) {
function ProfileDetails() {
  const profileData = useSelector(state => state.userSkills.profileData);
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div className={`${styles.profileDetails}`}>
      <h3 className={getFontColor(darkMode)}>User Profile</h3>
      <hr className={`${styles.horizontalSeparator}`} />
      <div className={`${styles.teamInfo}`}>
        <span>
          <strong className={darkMode ? 'text-azure' : ''}>Team Name:</strong>{' '}
          <span className={`${styles.value} ${getFontColor(darkMode)}`}>
            {profileData.teams?.length > 0
              ? profileData.teams[profileData.teams.length - 1].name
              : 'Not Assigned'}
          </span>
        </span>
        <span>
          <strong className={darkMode ? 'text-azure' : ''}>Years of Experience:</strong>{' '}
          <span className={`${styles.value} ${getFontColor(darkMode)}`}>
            {profileData.skillInfo?.general?.yearsOfExperience || 'N/A'}
          </span>
        </span>
      </div>
      <h3 className={getFontColor(darkMode)}>Contact Information</h3>
      <hr className={`${styles.horizontalSeparator}`} />
      <div className={`${styles.contactsInfo}`}>
        <span>
          <strong className={darkMode ? 'text-azure' : ''}>Email:</strong>{' '}
          <span className={`${styles.value} ${getFontColor(darkMode)}`}>
            {profileData.contactInfo.email || '🔒'}
          </span>
        </span>
        <span>
          <strong className={darkMode ? 'text-azure' : ''}>Phone Number:</strong>{' '}
          <span className={`${styles.value} ${getFontColor(darkMode)}`}>
            {profileData.contactInfo.phone || '🔒'}
          </span>
        </span>
        <span>
          <strong className={darkMode ? 'text-azure' : ''}>Slack:</strong>{' '}
          <span className={`${styles.value} ${getFontColor(darkMode)}`}>
            {profileData.socialHandles.slack || 'N/A'}
          </span>
        </span>
        <span>
          <strong className={darkMode ? 'text-azure' : ''}>GitHub:</strong>{' '}
          <span className={`${styles.value}`}>
            {profileData.socialHandles.github ? (
              <a
                href={
                  profileData.socialHandles.github.includes('http')
                    ? profileData.socialHandles.github
                    : `https://github.com/${profileData.socialHandles.github}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.githubLink} ${getFontColor(darkMode)}`}
              >
                {profileData.socialHandles.github.includes('http')
                  ? profileData.socialHandles.github.split('/').pop()
                  : profileData.socialHandles.github}
              </a>
            ) : (
              'N/A'
            )}
          </span>
        </span>
      </div>
      <hr className={`${styles.horizontalSeparator}`} />
    </div>
  );
}

export default ProfileDetails;
