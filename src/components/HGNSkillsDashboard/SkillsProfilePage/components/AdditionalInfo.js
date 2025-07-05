import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import '../styles/AdditionalInfo.css';
import { useSelector, useDispatch } from 'react-redux';
import { ENDPOINTS } from 'utils/URL';
import { toast } from 'react-toastify';
import { updateFollowUpFields } from '../../../../actions/userSkillsActions';

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

  const handleEditSave = () => {
    if (isEditing) {
      const wordCount = formData.mern_work_experience
        .trim()
        .split(' ') // split by space
        .filter(word => word !== '' && word !== '\n' && word !== '\t').length; // remove empty strings and tabs/newlines
      if (wordCount < 20) {
        // eslint-disable-next-line no-alert
        alert('Please enter at least 20 words.');
        // Re-focus the textarea
        textareaRef.current?.focus();
        return;
      }

      dispatch(updateFollowUpFields(profileData?.userId, formData));
    }
    setIsEditing(!isEditing);
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
  if (loading) return <div>Loading...</div>;
  return (
    <div className="AdditionalInfoBox">
      <div className="workExpInfoBox">
        <h3> Work Experience and Additional Info: </h3>
        <button type="button" className="edit-button" onClick={handleEditSave}>
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>
      <hr className="horizontal-separator" />
      {!!questions &&
        questions.slice(0, 3).map((question, index) => {
          const field = fields[index];

          return (
            <div className="question-and-response-box" key={field.key}>
              <div className="question-box">
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
