import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Spinner } from 'reactstrap';
import { ENDPOINTS } from 'utils/URL';
import styles from '../styles/SkillsSection.module.css';

function FrontendSkills({ profileData }) {
  const safeProfileData = profileData || {};
  const skillInfo = safeProfileData.skillInfo || {};
  const frontend = skillInfo.frontend || {};

  const [userSkillsData, setUserSkillsData] = useState(null);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const currentUser = useSelector(state => state.auth.user);

  const fetchUserSkills = async () => {
    try {
      setSkillsLoading(true);
      const response = await axios.get(`${ENDPOINTS.HGN_FORM_SUBMIT}`, {
        params: { skillsOnly: true },
      });
      const userSurveyData = response.data.find(
        user => user.userInfo?.email?.toLowerCase() === currentUser.email?.toLowerCase(),
      );

      if (userSurveyData) {
        setUserSkillsData(userSurveyData);
      }
    } catch (error) {
      toast.error('Failed to load skills data.');
    } finally {
      setSkillsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.email) {
      fetchUserSkills();
    } else {
      setSkillsLoading(false);
    }
  }, [currentUser]);

  // Get the current skills data
  const getCurrentSkillsData = () => {
    if (userSkillsData?.frontend) {
      return userSkillsData.frontend;
    }
    return frontend;
  };

  // skills array based on current skills data
  const getSkillsArray = () => {
    const currentSkills = getCurrentSkillsData();

    return [
      { value: currentSkills.overall, label: 'Overall Frontend' },
      { value: currentSkills.HTML, label: 'HTML' },
      { value: currentSkills.CSS, label: 'CSS' },
      { value: currentSkills.Bootstrap, label: 'Bootstrap' },
      { value: currentSkills.React, label: 'React' },
      { value: currentSkills.Redux, label: 'Redux' },
      { value: currentSkills.UIUXTools, label: 'UI/UX Design' },
      { value: currentSkills.ResponsiveUI, label: 'Responsive UI' },
      { value: currentSkills.WebSocketCom, label: 'Web Sockets' },
    ];
  };

  // determine color class based on skill value
  const getColorClass = value => {
    const numValue = Number(value) || 0;

    let scaledValue = numValue;
    if (userSkillsData?.frontend) {
      scaledValue = numValue * 2;
    }

    if (scaledValue <= 4) return `${styles.skillValue} ${styles.red}`;
    if (scaledValue <= 8) return `${styles.skillValue} ${styles.orange}`;
    return `${styles.skillValue} ${styles.green}`;
  };

  const getDisplayValue = value => {
    const numValue = Number(value) || 0;
    return numValue;
  };

  if (skillsLoading) {
    return (
      <div className={`${styles.skillsLoading}`}>
        <Spinner size="sm" color="primary" />
        <span>Loading skills...</span>
      </div>
    );
  }

  const skills = getSkillsArray();

  return (
    <div className={`${styles.skillSection}`}>
      <div className={`${styles.skillsRow}`}>
        {skills.map(skill => (
          <div key={skill.label} className={`${styles.skillItem}`}>
            <span className={getColorClass(skill.value)}>{getDisplayValue(skill.value)}</span>
            <span className={`${styles.skillLabel}`}>{skill.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FrontendSkills;
