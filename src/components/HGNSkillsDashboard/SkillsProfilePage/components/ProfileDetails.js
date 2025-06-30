import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Spinner } from 'reactstrap';
import { ENDPOINTS } from 'utils/URL';
import styles from '../styles/ProfileDetails.module.css';

function ProfileDetails({ profileData }) {
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
      console.log("response: ", response.data);
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

  const renderSkillsList = (skills) => {
    if (!skills || (Array.isArray(skills) && skills.length === 0)) {
      return <span className={`${styles.value}`}>No skills data available</span>;
    }

    if (Array.isArray(skills)) {
      return (
        <div className={`${styles.skillsList}`}>
          {skills.map((skill, index) => (
            <div key={index} className={`${styles.skillItem}`}>
              <strong>{skill.name}</strong>
              {skill.description && <p className={`${styles.skillDescription}`}>{skill.description}</p>}
            </div>
          ))}
        </div>
      );
    }

    return <span className={`${styles.value}`}>Skills data format not supported</span>;
  };

  const renderSkillsSection = () => {
    if (skillsLoading) {
      return (
        <div className={`${styles.skillsLoading}`}>
          <Spinner size="sm" color="primary" />
          <span>Loading skills...</span>
        </div>
      );
    }

    if (!userSkillsData) {
      return (
        <div className={`${styles.skillsInfo}`}>
          <span>
            <strong>Skills:</strong>{' '}
            <span className={`${styles.value}`}>Complete the skills survey to view your skills</span>
          </span>
        </div>
      );
    }

    const skills = userSkillsData.skills || userSkillsData.formData?.skills || {};

    return (
      <div className={`${styles.skillsInfo}`}>
        {skills.technical && (
          <div className={`${styles.skillCategory}`}>
            <strong>Technical Skills:</strong>
            {renderSkillsList(skills.technical || skills.technicalSkills)}
          </div>
        )}
        
        {skills.programming && (
          <div className={`${styles.skillCategory}`}>
            <strong>Programming Languages:</strong>
            {renderSkillsList(skills.programming || skills.programmingLanguages)}
          </div>
        )}

        {!skills.technical && !skills.programming && (
          <span>
            <strong>Skills:</strong>{' '}
            <span className={`${styles.value}`}>No skills data available</span>
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`${styles.profileDetails}`}>
      <h3>User Profile</h3>
      <hr className={`${styles.horizontalSeparator}`} />
      
      <div className={`${styles.teamInfo}`}>
        <span>
          <strong>Team Name:</strong>{' '}
          <span className={`${styles.value}`}>
            {profileData.teams?.length > 0
              ? profileData.teams[profileData.teams.length - 1].name
              : 'Not Assigned'}
          </span>
        </span>
        <span>
          <strong>Years of Experience:</strong>{' '}
          <span className={`${styles.value}`}>
            {userSkillsData?.general?.period || profileData.skillInfo?.general?.yearsOfExperience || 'N/A'}
          </span>
        </span>
      </div>

      {/* Skills Section */}
      <h3>Skills</h3>
      <hr className={`${styles.horizontalSeparator}`} />
      {renderSkillsSection()}

      <h3>Contact Information</h3>
      <hr className={`${styles.horizontalSeparator}`} />
      
      <div className={`${styles.contactsInfo}`}>
        <span>
          <strong>Email:</strong>{' '}
          <span className={`${styles.value}`}>{userSkillsData?.userInfo?.email || profileData.contactInfo.email || '🔒'}</span>
        </span>
        <span>
          <strong>Phone Number:</strong>{' '}
          <span className={`${styles.value}`}>{userSkillsData?.userInfo?.phone || profileData.contactInfo.phone || '🔒'}</span>
        </span>
        <span>
          <strong>Slack:</strong>{' '}
          <span className={`${styles.value}`}>{userSkillsData?.userInfo?.slack || profileData.socialHandles.slack || 'N/A'}</span>
        </span>
        <span>
          <strong>GitHub:</strong>{' '}
          <span className={`${styles.value}`}>
            {(userSkillsData?.userInfo?.github || profileData.socialHandles.github) ? (
              <a
                href={
                  (userSkillsData?.userInfo?.github || profileData.socialHandles.github).includes('http')
                    ? (userSkillsData?.userInfo?.github || profileData.socialHandles.github)
                    : `https://github.com/${userSkillsData?.userInfo?.github || profileData.socialHandles.github}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.githubLink}`}
              >
                {(userSkillsData?.userInfo?.github || profileData.socialHandles.github).includes('http')
                  ? (userSkillsData?.userInfo?.github || profileData.socialHandles.github).split('/').pop()
                  : (userSkillsData?.userInfo?.github || profileData.socialHandles.github)}
              </a>
            ) : (
              'N/A'
            )}
          </span>
        </span>
      </div>
      
      <hr className={`${styles.horizontalSeparator}`} />
    </div>
  );
}

export default ProfileDetails;
