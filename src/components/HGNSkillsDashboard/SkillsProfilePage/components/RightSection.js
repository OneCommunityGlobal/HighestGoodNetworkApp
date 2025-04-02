import ProfileDetails from './ProfileDetails';
import Skills from './Skills';
import RadarChart from './RadarChart';
import '../styles/RightSection.css';

function RightSection({ profileData }) {
  return (
    <div className="right-section">
      <ProfileDetails profileData={profileData} />
      <div className="skills-and-chart">
        <Skills />
        <RadarChart />
      </div>
    </div>
  );
}

export default RightSection;
