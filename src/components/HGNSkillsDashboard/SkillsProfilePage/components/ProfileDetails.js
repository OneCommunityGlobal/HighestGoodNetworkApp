import '../styles/ProfileDetails.css';

function ProfileDetails() {
  return (
    <div className="profile-details">
      <h3>User Profile</h3>
      <hr className="horizontal-separator" />
      <div className="team-info">
        <span>
          <strong>Team Name:</strong> <span className="value">Expressers</span>
        </span>
        <span>
          <strong>Years of Experience:</strong> <span className="value">0-3 years</span>
        </span>
      </div>
      <h3>Contact Information</h3>
      <hr className="horizontal-separator" />
      <div className="contacts-info">
        <span>
          <strong>Email:</strong> <span className="value">rahultrivedi@gmail.com</span>
        </span>
        <span>
          <strong>Slack ID:</strong> <span className="value">rahultrivedi1999</span>
        </span>
        <span>
          <strong>Phone Number:</strong> <span className="value">+1 935-984-333</span>
        </span>
      </div>
      <hr className="horizontal-separator" />
    </div>
  );
}

export default ProfileDetails;
