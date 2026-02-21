import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { updateYearsOfExperience } from '../../../../actions/userSkillsActions';
import styles from '../styles/ProfileDetails.module.css';

function ProfileDetails() {
  const profileData = useSelector(state => state.userSkills.profileData);
  const loggedInUserId = useSelector(state => state.userSkills.profileData?.loggedInUserId);
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [yearsValue, setYearsValue] = useState(
    profileData?.skillInfo?.general?.yearsOfExperience || '',
  );

  const handleEditSave = () => {
    if (isEditing) {
      if (yearsValue !== '' && yearsValue !== null) {
        const num = Number(yearsValue);
        if (!Number.isInteger(num) || num < 0) {
          toast.error('Years of Experience must be a non-negative whole number.');
          return;
        }
      }
      dispatch(updateYearsOfExperience(loggedInUserId, yearsValue));
    }
    setIsEditing(prev => !prev);
  };

  const handleCancel = () => {
    setYearsValue(profileData?.skillInfo?.general?.yearsOfExperience || '');
    setIsEditing(false);
  };

  return (
    <div className={`${styles.profileDetails} ${darkMode ? 'dark-mode' : ''}`}>
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
          {isEditing ? (
            <input
              type="number"
              min="0"
              step="1"
              value={yearsValue}
              onChange={e => setYearsValue(e.target.value)}
              className={`${styles.yearsInput}`}
              placeholder="Enter years"
            />
          ) : (
            <span className={`${styles.value}`}>
              {profileData.skillInfo?.general?.yearsOfExperience || 'N/A'}
            </span>
          )}
        </span>
        {loggedInUserId === String(profileData?.userId) && (
          <div className={`${styles.editButtons}`}>
            <button type="button" className="edit-button" onClick={handleEditSave}>
              {isEditing ? 'Save' : 'Edit'}
            </button>
            {isEditing && (
              <button type="button" className="edit-button" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        )}
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

ProfileDetails.propTypes = {
  profileData: PropTypes.shape({
    teams: PropTypes.array,
    skillInfo: PropTypes.shape({
      general: PropTypes.shape({
        yearsOfExperience: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      }),
    }),
    contactInfo: PropTypes.shape({
      email: PropTypes.string,
      phone: PropTypes.string,
    }),
    socialHandles: PropTypes.shape({
      slack: PropTypes.string,
      github: PropTypes.string,
    }),
    userId: PropTypes.string,
    loggedInUserId: PropTypes.string,
  }),
};

export default ProfileDetails;
