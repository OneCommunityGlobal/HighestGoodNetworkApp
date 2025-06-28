import axios from 'axios';
import { useState, useEffect, useLocation } from 'react';
import '../styles/AdditionalInfo.css';
import { useSelector } from 'react-redux';
import { ENDPOINTS } from 'utils/URL';
import { toast } from 'react-toastify';
import { FaEdit, FaRegSave } from 'react-icons/fa';

// function AdditionalInfo({ profileData }) {
function AdditionalInfo() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedText, setEditedText] = useState('');
  //  const location = useLocation();
  //  const { isOwner } = location.state;

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
  }, [ENDPOINTS.HGN_FORM_GET_QUESTION]);

  const handleEditClick = () => {
    // setEditingIndex(index);
    //  setEditedText(questions[index]?.text || '');
  };

  const handleSaveClick = async index => {
    try {
      const updatedQuestions = [...questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        text: editedText,
      };

      // Update the backend
      await axios.put(ENDPOINTS.HGN_FORM_UPDATE_QUESTION(questions[index]._id), {
        text: editedText,
        page: 5,
        title: 'followup',
      });

      setQuestions(updatedQuestions);
      setEditingIndex(null);
      toast.success('Question saved successfully.');
    } catch (error) {
      toast.error('Error saving question. Please try again.');
    }
  };

  const profileData = useSelector(state => state.userSkills.profileData);

  // eslint-disable-next-line no-console
  console.log(profileData);
  // eslint-disable-next-line no-console
  console.log(profileData?.skillInfo);
  // eslint-disable-next-line no-console
  console.log(profileData?.skillInfo?.followUp);
  // eslint-disable-next-line no-console
  console.log(profileData?.skillInfo?.followUp?.additional_info);
  // eslint-disable-next-line no-console
  console.log(questions);

  const fields = [
    {
      name: 'followup_platform',
      type: 'input',
      value: profileData?.skillInfo?.followUp?.platform,
      key: 'platform',
    },
    {
      name: 'followup_mern_work_experience',
      type: 'textarea',
      value: profileData?.skillInfo?.followUp?.mern_work_experience,
      key: 'mern_work_experience',
    },
    {
      name: 'followup_other_skills',
      type: 'input',
      value: profileData?.skillInfo?.followUp?.other_skills,
      key: 'other_skills',
    },
  ];

  return (
    <div className="AdditionalInfoBox">
      <div className="workExpInfoBox">
        <h3> Work Experience and Additional Info: </h3>
        <button type="button" className="edit-button" onClick={handleEditClick}>
          Edit
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
                  value={field.value}
                  onChange={e => setEditedText(e.target.value)}
                  required
                />
              ) : (
                <input
                  type="text"
                  name={field.name}
                  value={field.value}
                  onChange={e => setEditedText(e.target.value)}
                  required
                />
              )}
            </div>
          );
        })}
    </div>
  );
}
export default AdditionalInfo;
