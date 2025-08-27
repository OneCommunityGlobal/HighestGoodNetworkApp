import { useSelector } from 'react-redux';
import styles from '../styles/ProfileDetails.module.css';

// function ProfileDetails({ profileData }) {
function ProfileDetails() {
  const profileData = useSelector(state => state.userSkills.profileData);
  return (
    <div className={`${styles.profileDetails}`}>
      <h3>User Profile</h3>
      <hr className={`${styles.horizontalSeparator}`} />
      <div className={`${styles.teamInfo}`}>
        <span>
          <strong>Team Name:</strong>{' '}
          <span className={`${styles.value}`}>
            {profileData.teams?.length > 0
              ? profileData.teams[profileData.teams.length - 1].name
              : 'Not Assigned'}
          </span>
        </span>
        <span>
          <strong>Years of Experience:</strong>{' '}
          <span className={`${styles.value}`}>
            {profileData.skillInfo?.general?.yearsOfExperience || 'N/A'}
          </span>
        </span>
      </div>
      <h3>Contact Information</h3>
      <hr className={`${styles.horizontalSeparator}`} />
      <div className={`${styles.contactsInfo}`}>
        <span>
          <strong>Email:</strong>{' '}
          <span className={`${styles.value}`}>{profileData.contactInfo.email || '🔒'}</span>
        </span>
        <span>
          <strong>Phone Number:</strong>{' '}
          <span className={`${styles.value}`}>{profileData.contactInfo.phone || '🔒'}</span>
        </span>
        <span>
          <strong>Slack:</strong>{' '}
          <span className={`${styles.value}`}>{profileData.socialHandles.slack || 'N/A'}</span>
        </span>
        <span>
          <strong>GitHub:</strong>{' '}
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
                className={`${styles.githubLink}`}
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
