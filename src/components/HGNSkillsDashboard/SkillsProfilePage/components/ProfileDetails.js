import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Spinner } from 'reactstrap';
import { ENDPOINTS } from 'utils/URL';
import styles from '../styles/ProfileDetails.module.css';

function ProfileDetails({ profileData }) {
  const [userSkillsData, setUserSkillsData] = useState(null);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const currentUser = useSelector(state => state.auth.user);
  const userProfile = useSelector(state => state.userProfile);

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

  // privacy detection
  const getPrivacySettings = () => {
    const profileSource = userProfile || profileData;
    if (!profileSource || !profileSource.privacySettings) {
      return { emailPrivate: false, phonePrivate: false, source: 'no-data' };
    }
    const settings = {
      emailPrivate: profileSource.privacySettings.email === false,
      phonePrivate:
        profileSource.privacySettings.phoneNumber === false ||
        profileSource.privacySettings.phone === false,
      source: 'privacySettings',
    };
    return settings;
  };

  const isOwnProfile = () => {
    const profileSource = userProfile || profileData;
    const targetUserId = profileSource?._id || profileSource?.userId;
    const currentUserId = currentUser?._id;
    const isOwn = currentUserId === targetUserId;
    return isOwn;
  };

  // should contact info be private?
  const getContactValue = (value, isPrivate) => {
    if (isOwnProfile()) {
      return value || 'N/A';
    }
    // Hide if private
    if (isPrivate) {
      return '🔒 Private';
    }
    return value || 'N/A';
  };

  const privacySettings = getPrivacySettings();

  const renderSkillsList = skills => {
    if (!skills || (Array.isArray(skills) && skills.length === 0)) {
      return <span className={`${styles.value}`}>No skills data available</span>;
    }
    if (Array.isArray(skills)) {
      return (
        <div className={`${styles.skillsList}`}>
          {skills.map((skill, index) => {
            // Create a unique key using skill properties or fallback to index
            const key = skill.id || skill.name || `skill-${index}`;
            return (
              <div key={key} className={`${styles.skillItem}`}>
                <strong>{skill.name}</strong>
                {skill.description && (
                  <p className={`${styles.skillDescription}`}>{skill.description}</p>
                )}
              </div>
            );
          })}
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
            <span className={`${styles.value}`}>
              Complete the skills survey to view your skills
            </span>
          </span>
        </div>
      );
    }
    const skills = userSkillsData.followUp || {};
    return (
      <div className={`${styles.skillsInfo}`}>
        {skills.programming && (
          <div className={`${styles.teamInfo}`}>
            <strong>Programming Languages:</strong>
            {renderSkillsList(skills.programming || skills.programmingLanguages)}
          </div>
        )}
        {skills.other_skills && (
          <div className={`${styles.skillCategory}`}>
            <strong className={styles.otherSkills}>Other Skills: </strong>
            <span className={styles.value}>{skills.other_skills}</span>
          </div>
        )}
        {!skills.other_skills && !skills.programming && (
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
            {(userProfile || profileData)?.teams?.length > 0
              ? (userProfile || profileData).teams[(userProfile || profileData).teams.length - 1]
                  .name
              : 'Not Assigned'}
          </span>
        </span>
        <span>
          <strong>Years of Experience:</strong>{' '}
          <span className={`${styles.value}`}>
            {userSkillsData?.general?.period ||
              (userProfile || profileData)?.skillInfo?.general?.yearsOfExperience ||
              'N/A'}
          </span>
        </span>
      </div>
      <h3>Skills</h3>
      <hr className={`${styles.horizontalSeparator}`} />
      {renderSkillsSection()}
      <h3>Contact Information</h3>
      <hr className={`${styles.horizontalSeparator}`} />
      <div className={`${styles.contactsInfo}`}>
        <span>
          <strong>Email:</strong>{' '}
          <span className={`${styles.value}`}>
            {getContactValue(
              userSkillsData?.userInfo?.email ||
                (userProfile || profileData)?.contactInfo?.email ||
                (userProfile || profileData)?.email,
              privacySettings.emailPrivate,
              'email',
            )}
          </span>
        </span>
        <span>
          <strong>Phone Number:</strong>{' '}
          <span className={`${styles.value}`}>
            {getContactValue(
              userSkillsData?.userInfo?.phone ||
                (userProfile || profileData)?.contactInfo?.phone ||
                (userProfile || profileData)?.phoneNumber,
              privacySettings.phonePrivate,
              'phone',
            )}
          </span>
        </span>
        <span>
          <strong>Slack:</strong>{' '}
          <span className={`${styles.value}`}>
            {userSkillsData?.userInfo?.slack ||
              (userProfile || profileData)?.socialHandles?.slack ||
              'N/A'}
          </span>
        </span>
        <span>
          <strong>GitHub:</strong>{' '}
          <span className={`${styles.value}`}>
            {userSkillsData?.userInfo?.github ||
            (userProfile || profileData)?.socialHandles?.github ? (
              <a
                href={
                  (
                    userSkillsData?.userInfo?.github ||
                    (userProfile || profileData).socialHandles.github
                  ).includes('http')
                    ? userSkillsData?.userInfo?.github ||
                      (userProfile || profileData).socialHandles.github
                    : `https://github.com/${userSkillsData?.userInfo?.github ||
                        (userProfile || profileData).socialHandles.github}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.githubLink}`}
              >
                {(
                  userSkillsData?.userInfo?.github ||
                  (userProfile || profileData).socialHandles.github
                ).includes('http')
                  ? (
                      userSkillsData?.userInfo?.github ||
                      (userProfile || profileData).socialHandles.github
                    )
                      .split('/')
                      .pop()
                  : userSkillsData?.userInfo?.github ||
                    (userProfile || profileData).socialHandles.github}
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
