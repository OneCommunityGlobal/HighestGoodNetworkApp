import '../styles/LeftSection.css';
import profilePic from './profile.jpg';

function LeftSection() {
  return (
    <div className="left-section">
      <img src={profilePic} alt="Profile" className="profile-pic" />
      <h1>Rahul Trivedi</h1>
      <h3>Software Developer</h3>
    </div>
  );
}

export default LeftSection;
