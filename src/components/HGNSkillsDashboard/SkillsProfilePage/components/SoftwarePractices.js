import styles from '../styles/SkillsSection.module.css';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Spinner } from 'reactstrap';
import { ENDPOINTS } from 'utils/URL';

function SoftwarePractices({ profileData }) {
  const safeProfileData = profileData || {};
  const skillInfo = safeProfileData.skillInfo || {};
  const backend = skillInfo.backend || {};
  const general = skillInfo.general || {};
  const frontend = skillInfo.frontend || {};

  const [userSkillsData, setUserSkillsData] = useState(null);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (currentUser?.email) {
      fetchUserSkills();
    } else {
      setSkillsLoading(false);
    }
  }, [currentUser]);

    const fetchUserSkills = async () => {
    try {
      setSkillsLoading(true);
      const response = await axios.get(`${ENDPOINTS.HGN_FORM_SUBMIT}`, {
        params: { skillsOnly: true }
      });
      console.log("response-deployment: ", response.data);
      const userSurveyData = response.data.find(
        (user) => user.userInfo?.email?.toLowerCase() === currentUser.email?.toLowerCase()
      );
      
      if (userSurveyData) {
        setUserSkillsData(userSurveyData);
      }
    } catch (error) {
      console.error("Failed to fetch skills data:", error);
      toast.error("Failed to load skills data.");
    } finally {
      setSkillsLoading(false);
    }
  };

    const getCurrentSkillsData = () => {
    if (userSkillsData?.backend) {
      return userSkillsData.backend;
    }
    return deployment;
  };

  const getSkillsArray = () => {
    const currentSkills = getCurrentSkillsData();
    return [
      { value: currentSkills.Overall, label: 'Overall Software Practices' },
      { value: currentSkills.CodeReview, label: 'Code Review' },
      { value: currentSkills.AgileDevelopment, label: 'Agile Development' },
      { value: currentSkills.Documentation, label: 'Documentation' },
      { value: currentSkills.leadership_experience, label: 'Leadership / Management Experience' },
      { value: currentSkills.leadership_skills, label: 'Leadership / Management Skills' },
      { value: currentSkills.AdvancedCoding, label: 'Advanced Coding Skills' },
    ];
  };

    // Function to determine color based on value
  const getColorClass = value => {
    const numValue = Number(value) || 0; // Convert to number, default to 0 if undefined
    if (numValue <= 4) return `${styles.skillValue} ${styles.red}`;
    if (numValue <= 7) return `${styles.skillValue} ${styles.orange}`;
    return `${styles.skillValue} ${styles.green}`; // 9-10
  };

  const getDisplayValue = value => {
    const numValue = Number(value) || 0;

    if (userSkillsData?.deployment) {
      return numValue * 2; // Scale 1-5 to 2-10 for display
    }
    return numValue; 
  }

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
            <span className={getColorClass(skill.value)}>{skill.value || 0}</span>
            <span className={`${styles.skillLabel}`}>{skill.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SoftwarePractices;
