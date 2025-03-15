import { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import '../styles/FrontendBackendQuestions.css';
import { FaEdit, FaRegSave } from 'react-icons/fa';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { ENDPOINTS } from 'utils/URL';
import { toast } from 'react-toastify';
import { setformData } from 'actions/hgnFormAction';

function FrontendQuestions() {
  const navigate = useHistory();
  const [questions, setQuestions] = useState([]);
  const formData = useSelector(state => state.hgnForm);
  const [newVolunteer, setNewVolunteer] = useState(formData);
  const dispatch = useDispatch();
  const location = useLocation();
  const { isOwner } = location.state;

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch data from database
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${ENDPOINTS.HGN_FORM_GET_QUESTION}`, {
          params: {
            page: 3,
            title: 'frontend',
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

  const handleNext = e => {
    e.preventDefault();
    dispatch(setformData(newVolunteer));
    navigate.push('/hgnform/page4', { isOwner });
  };

  const handleBack = () => {
    navigate.goBack('/hgnform/page2');
  };

  const handleRadioChange = e => {
    const { name, value } = e.target;
    setNewVolunteer({ ...newVolunteer, [name]: value });
  };

  // Handle edit button click to start editing a question
  const handleEditClick = index => {
    setEditingIndex(index);
    setEditedText(questions[index].text); // Set the current question text to be edited
  };

  // Save edited question
  const handleSaveClick = async index => {
    try {
      // Save the updated question to the database
      await axios.put(ENDPOINTS.HGN_FORM_UPDATE_QUESTION(questions[index]._id), {
        text: editedText,
        page: '3',
        title: 'frontend',
      });
      setQuestions(prevQuestions => {
        const updatedQuestions = [...prevQuestions];
        updatedQuestions[index].text = editedText; // Update the question text locally
        return updatedQuestions;
      });
      setEditingIndex(null); // Exit editing mode
      toast.success('Question saved successfully.');
    } catch (error) {
      toast.error('Error saving question. Please try again.');
    }
  };

  const searchQuestion = (page,qno) => {
    let question= questions.find(question => question.page === page && question.qno === qno);
    return question.text;
   }

  // Mapping question keys to structured field names
  const fieldNameMap = [
    'frontend_Overall',
    'frontend_HTML',
    'frontend_Bootstrap',
    'frontend_CSS',
    'frontend_React',
    'frontend_Redux',
    'frontend_WebSocketCom',
    'frontend_ResponsiveUI',
    'frontend_UnitTest',
    'frontend_Documentation',
    'frontend_UIUXTools',
  ];

  if (loading) {
    return <div>Loading Questions...</div>;
  }

  return (
    <div className="frontend-backend-questions">
      <h3 className="blue-strip">Frontend Questions</h3>
      <form onSubmit={handleNext}>
        {questions.map((question, index) => {
          const fieldName = fieldNameMap[index] || `frontend_Question_${index}`;

          return (
            <div className="frontend-backend" key={question._id || index}>
              <div className="question-container">
                {editingIndex === index && isOwner ? (
                  <div className="edit-question-container">
                    <p className="edit-title">Edit Question</p>
                    <div className="edit-question">
                      <input
                        type="text"
                        value={editedText}
                        onChange={e => setEditedText(e.target.value)}
                        className="edit-input"
                      />
                      <FaRegSave
                        title="Save"
                        className="save-icon"
                        onClick={() => handleSaveClick(index)}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="question">
                    {searchQuestion(3,index+1)}
                    {isOwner && (
                      <FaEdit
                        className="edit-icon"
                        onClick={() => handleEditClick(index)}
                        title="Edit"
                      />
                    )}
                  </p>
                )}
              </div>

              <div className="frontend-backend-rating">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i}>
                    <label htmlFor={`${fieldName}_${i + 1}`}>{i + 1}</label>
                    <input
                      type="radio"
                      name={fieldName}
                      id={`${fieldName}_${i + 1}`}
                      value={i + 1}
                      onChange={handleRadioChange}
                      checked={newVolunteer[fieldName] === (i + 1).toString()}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="button-container">
          <button
            type="button"
            className="hgn-return-button"
            style={{ borderRadius: '10px' }}
            onClick={handleBack}
          >
            Back
          </button>
          <button type="submit" className="next-button">
            Next
          </button>
        </div>
      </form>
    </div>
  );
}

export default FrontendQuestions;
