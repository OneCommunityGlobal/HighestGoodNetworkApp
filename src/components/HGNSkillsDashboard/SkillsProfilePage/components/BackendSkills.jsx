import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Spinner } from 'reactstrap';
import { ENDPOINTS } from '~/utils/URL';
import styles from '../styles/SkillsSection.module.css';

function BackendSkills() {
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

  const getSkillsArray = () => {
    if (!userSkillsData) return [];

    const backend = userSkillsData.backend || {};
    const frontend = userSkillsData.frontend || {};
    const general = userSkillsData.general || {};

    return [
      { value: general.mern_skills, label: 'MERN Stack' },
      { value: backend.TestDrivenDev, label: 'Test-Driven Development' },
      { value: backend.Database, label: 'Database Setup' },
      { value: backend.Overall, label: 'Overall Backend' },
      { value: frontend.UnitTest, label: 'Unit Testing' },
      { value: backend.MongoDB, label: 'MongoDB' },
    ];
  };

  const getColorClass = value => {
    const numValue = Number(value) || 0;
    if (numValue <= 4) return `${styles.skillValue} ${styles.red}`;
    if (numValue <= 7) return `${styles.skillValue} ${styles.orange}`;
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

export default BackendSkills;
