import LeftSection from './LeftSection';
import RightSection from './RightSection';
import '../styles/UserSkillsProfile.css';
import SurveyFormDisplay from './SurveyData';

function UserSkillsProfile() {
  return (
    <div className="user-profile-home">
      <div className="dashboard-container">
        <LeftSection />
        <div className="vertical-separator" />
        <RightSection />
      </div>
      <SurveyFormDisplay />
    </div>
  );
}

export default UserSkillsProfile;
