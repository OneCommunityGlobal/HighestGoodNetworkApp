import '../styles/LeftSection.css';
import profilePic from './profile.jpg';

function LeftSection({ profileData }) {
  return (
    <div className="left-section">
      <img src={profilePic} alt="Profile" className="profile-pic" />
      <h1>{profileData.name.displayName || 'Unknown User'}</h1>
      <h3>{profileData.jobTitle?.[0] || 'Job Title - N/A'}</h3>
    </div>
  );
}

export default LeftSection;
