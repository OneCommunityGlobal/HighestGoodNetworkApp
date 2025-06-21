import '../styles/LeftSection.css';
import { useSelector } from 'react-redux';
import profilePic from './profile.jpg';

/* function LeftSection({ profileData }) { */
function LeftSection() {
  const profileData = useSelector(state => state.userSkills.profileData);
  return (
    <div className="left-section">
      <img src={profilePic} alt="Profile" className="profile-pic" />
      <h1>{profileData.name.displayName || 'Unknown User'}</h1>
      <h3>{profileData.jobTitle?.[0] || 'Job Title - N/A'}</h3>
    </div>
  );
}

export default LeftSection;
