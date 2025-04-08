import '../styles/ProfileDetails.css';

function ProfileDetails({ profileData }) {
  return (
    <div className="profile-details">
      <h3>User Profile</h3>
      <hr className="horizontal-separator" />
      <div className="team-info">
        <span>
          <strong>Team Name:</strong>{' '}
          <span className="value">
            {profileData.teams?.length > 0
              ? profileData.teams[profileData.teams.length - 1].name
              : 'Not Assigned'}
          </span>
        </span>
        <span>
          <strong>Years of Experience:</strong>{' '}
          <span className="value">
            {profileData.skillInfo?.general?.yearsOfExperience || 'N/A'}
          </span>
        </span>
      </div>
      <h3>Contact Information</h3>
      <hr className="horizontal-separator" />
      <div className="contacts-info">
        <span>
          <strong>Email:</strong>{' '}
          <span className="value">{profileData.contactInfo.email || 'N/A'}</span>
        </span>
        <span>
          <strong>Phone Number:</strong>{' '}
          <span className="value">{profileData.contactInfo.phone || 'N/A'}</span>
        </span>
        <span>
          <strong>Slack:</strong>{' '}
          <span className="value">{profileData.socialHandles.slack || 'N/A'}</span>
        </span>
        <span>
          <strong>GitHub:</strong>{' '}
          <span className="value">{profileData.socialHandles.github || 'N/A'}</span>
        </span>
      </div>
      <hr className="horizontal-separator" />
    </div>
  );
}

export default ProfileDetails;
