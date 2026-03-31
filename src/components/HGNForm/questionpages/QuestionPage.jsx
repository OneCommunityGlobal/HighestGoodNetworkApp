import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { FaEdit, FaRegSave } from 'react-icons/fa';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { ENDPOINTS } from '~/utils/URL';
import { toast } from 'react-toastify';
import { setformData } from '~/actions/hgnFormAction';
import { Spinner } from 'reactstrap';
import styles from '../styles/FrontendBackendQuestions.module.css';
import { getBoxStyling, getFontColor } from '../../../styles';

function QuestionPage({ pageNumber, title, fieldNameMap, nextPage }) {
  const navigate = useHistory();
  const dispatch = useDispatch();
  const location = useLocation();
  const { isOwner } = location.state || {};
  const formData = useSelector(state => state.hgnForm);
  const darkMode = useSelector(state => state.theme.darkMode);

  const [questions, setQuestions] = useState([]);
  const [newVolunteer, setNewVolunteer] = useState(formData);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${ENDPOINTS.HGN_FORM_GET_QUESTION}`, {
          params: {
            page: pageNumber,
            title,
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
  }, [pageNumber, title]);

  const handleNext = e => {
    e.preventDefault();
    dispatch(setformData(newVolunteer));
    navigate.push(nextPage, { isOwner });
  };

  const handleBack = () => navigate.goBack();

  const handleRadioChange = e => {
    const { name, value } = e.target;
    setNewVolunteer({ ...newVolunteer, [name]: value });
  };

  const handleEditClick = index => {
    setEditingIndex(index);
    setEditedText(questions[index].text); // Set the current question text to be edited
  };

  const handleSaveClick = async index => {
    try {
      await axios.put(ENDPOINTS.HGN_FORM_UPDATE_QUESTION(questions[index]._id), {
        text: editedText,
        page: 'pageNumber',
        title,
      });

      setQuestions(prev => {
        const updated = [...prev];
        updated[index].text = editedText; // Update the question text locally
        return updated;
      });

      setEditingIndex(null);
      toast.success('Question saved successfully.');
    } catch (error) {
      toast.error('Error saving question. Please try again.');
    }
  };

  const searchQuestion = (page, qno) => {
    const question = questions.find(q => q.page === page && q.qno === qno);
    return question ? question.text : '';
  };

  if (loading) {
    return (
      <div>
        <Spinner color="primary" className={`${styles.spinnerHgnform}`} />;
      </div>
    );
  }

  return (
    <div
      className={`${styles.frontendBackendQuestions} ${darkMode ? styles.bgSpaceCadet : ''}`}
      style={getBoxStyling(darkMode)}
    >
      <h3 className={`${styles.blueStrip}`}>{title}</h3>
      <form onSubmit={handleNext}>
        {questions.map((question, index) => {
          const fieldName = fieldNameMap[index] || `${title}_Question${index}`;
          return (
            <div className={`${styles.frontendBackend}`} key={question._id || index}>
              <div className={`${styles.questionContainer} `}>
                {editingIndex === index && isOwner ? (
                  <div
                    className={`${styles.editQuestionContainer}  ${
                      darkMode ? 'bg-yinmn-blue' : ''
                    }`}
                  >
                    <p className={`${styles.editTitle} ${getFontColor(darkMode)}`}>Edit Question</p>
                    <div className={`${styles.editQuestion}`}>
                      <input
                        type="text"
                        value={editedText}
                        onChange={e => setEditedText(e.target.value)}
                        className={`${styles.editInput} ${getFontColor(darkMode)} ${
                          darkMode ? 'bg-space-cadet' : ''
                        }`}
                      />
                      <FaRegSave
                        title="Save"
                        className={`${styles.saveIcon}`}
                        onClick={() => handleSaveClick(index)}
                      />
                    </div>
                  </div>
                ) : (
                  <p className={`${styles.question} ${getFontColor(darkMode)}`}>
                    {searchQuestion(4, index + 1)}
                    {isOwner && (
                      <FaEdit
                        className={`${styles.editIcon}`}
                        onClick={() => handleEditClick(index)}
                        title="Edit"
                      />
                    )}
                  </p>
                )}
              </div>

              <div className={`${styles.frontendBackendRating}`}>
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i}>
                    <label
                      htmlFor={`${fieldName}_${i + 1}`}
                      className={`${getFontColor(darkMode)}`}
                    >
                      {i + 1}
                    </label>
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

        <div className={`${styles.buttonContainer}`}>
          <button type="button" className={`${styles.hgnReturnButton}`} onClick={handleBack}>
            Back
          </button>
          <button type="submit" className={`${styles.nextButton}`}>
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
export default QuestionPage;
