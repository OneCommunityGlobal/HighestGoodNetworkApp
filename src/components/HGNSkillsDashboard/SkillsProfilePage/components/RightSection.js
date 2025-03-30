import ProfileDetails from './ProfileDetails';
import Skills from './Skills';
import RadarChart from './RadarChart';
import '../styles/RightSection.css';

function RightSection() {
  return (
    <div className="right-section">
      <ProfileDetails />
      <div className="skills-and-chart">
        <Skills />
        <RadarChart />
      </div>
    </div>
  );
}

export default RightSection;
