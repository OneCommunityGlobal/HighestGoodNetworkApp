import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import styles from '../styles/AdditionalInfo.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { ENDPOINTS } from '../../../../utils/URL';
import { toast } from 'react-toastify';
import getWordCount from '../../../../utils/getWordCount';
import { updateFollowUpFields } from '../../../../actions/userSkillsActions';

function checkIfupdateUserSkillsProfileFollowUp(permissions, role, requestorId, userid) {
  if (role === 'Administrator' || role === 'Owner' || requestorId === userid) return true;
  // eslint-disable-next-line no-console
  console.log(permissions?.frontPermissions.includes('updateUserSkillsProfileFollowUp'));
  return permissions?.frontPermissions.includes('updateUserSkillsProfileFollowUp');
}

function AdditionalInfo() {
  const [questions, setQuestions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const profileData = useSelector(state => state.userSkills.profileData);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    mern_work_experience: profileData?.skillInfo?.followUp?.mern_work_experience || '',
    platform: profileData?.skillInfo?.followUp?.platform || '',
    other_skills: profileData?.skillInfo?.followUp?.other_skills || '',
  });
  const textareaRef = useRef(null);

  const role = useSelector(state => state.auth.user.role);

  const permissions = useSelector(state => state.auth.user.permissions);

  const requestorId = useSelector(state => state.auth.user.userid);

  const darkMode = useSelector(state => state.theme.darkMode);

  // Fetch data from database
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${ENDPOINTS.HGN_FORM_GET_QUESTION}`, {
          params: {
            page: 5,
            title: 'followup',
          },
        });
        setQuestions(response.data);
      } catch (error) {
        toast.error('Error fetching questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleChange = field => e => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const fields = [
    {
      name: 'followup_platform',
      type: 'input',
      value: formData.platform,
      key: 'platform',
    },
    {
      name: 'followup_mern_work_experience',
      type: 'textarea',
      value: formData.mern_work_experience,
      key: 'mern_work_experience',
    },
    {
      name: 'followup_other_skills',
      type: 'input',
      value: formData.other_skills,
      key: 'other_skills',
    },
  ];

  const handleEditSave = () => {
    if (
      !checkIfupdateUserSkillsProfileFollowUp(permissions, role, requestorId, profileData?.userId)
    )
      // eslint-disable-next-line no-alert
      alert('Edit Not allowed');

    if (isEditing) {
      const isMissingRequiredField = fields.some(field => {
        // eslint-disable-next-line no-console
        console.log(field.key);
        if (!formData[field.key]?.trim()) {
          toast.error(`"${field.key}" is required`);
          return true;
        }
        return false;
      });

      if (isMissingRequiredField) return;

      const mernWorkExp = formData.mern_work_experience;
      const mernWorkExpWordCount = getWordCount(mernWorkExp);

      if (mernWorkExpWordCount < 20) {
        toast.error('Mern Work Experience : Please enter at least 20 words.');
        // Re-focus the textarea
        textareaRef.current?.focus();
        return;
      }
      dispatch(updateFollowUpFields(profileData?.userId, formData));
    }
    setIsEditing(!isEditing);
  };

  if (loading) return <div>Loading...</div>;
  return (
    <div className={`${styles.AdditionalInfoBox} ${darkMode ? 'dark-mode' : ''}`}>
      <div className={styles.workExpInfoBox}>
        <h3> Work Experience and Additional Info: </h3>
        <button type="button" className="edit-button" onClick={handleEditSave}>
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>
      <hr className="horizontal-separator" />
      {!!questions &&
        questions
          .slice(0, 3)
          .sort((a, b) => a.qno - b.qno)
          .map((question, index) => {
            const field = fields[index];
            return (
              <div className={styles['question-and-response-box']} key={field.key}>
                <div className={styles['question-box']}>
                  <p>{question.text}</p>
                </div>
                {field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    value={formData[field.key]}
                    onChange={handleChange(field.key)}
                    placeholder="mern work experience in 2 to 5 sentences"
                    readOnly={!isEditing}
                    ref={textareaRef}
                    required
                  />
                ) : (
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.key]}
                    onChange={handleChange(field.key)}
                    required
                    readOnly={!isEditing}
                  />
                )}
              </div>
            );
          })}
    </div>
  );
}
export default AdditionalInfo;
