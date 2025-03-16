import { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import '../styles/FollowupQuestions.css';
import { FaEdit, FaRegSave } from 'react-icons/fa';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { setformData } from 'actions/hgnFormAction';
import { Spinner } from 'reactstrap';

function FollowupQuestions() {
  const navigate = useHistory();
  const [questions, setQuestions] = useState([]);
  const formData = useSelector(state => state.hgnForm);
  const user = useSelector(state => state.auth.user);
  const [newVolunteer, setNewVolunteer] = useState(formData);
  const dispatch = useDispatch();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { isOwner } = location.state;
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

  const handleEditClick = index => {
    setEditingIndex(index);
    setEditedText(questions[index]?.text || '');
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

  const processTimes = sortedTimes => {
    return sortedTimes.reduce((groupedTimes, time) => {
      const [prevStart, prevEnd] = groupedTimes.length
        ? groupedTimes[groupedTimes.length - 1].split('-')
        : [];
      const [currStart, currEnd] = time.split('-');

      // Check if the current time is consecutive to the previous time
      if (groupedTimes.length && parseInt(prevEnd, 10) === parseInt(currStart, 10) - 1) {
        const updatedGroup = `${prevStart}-${currEnd}`;
        return [...groupedTimes.slice(0, -1), updatedGroup];
      }

      // Add the current time as a new group
      return [...groupedTimes, time];
    }, []);
  };

  const formatAvailability = availability => {
    const weekdaysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const result = Object.entries(availability).reduce((acc, [day, times]) => {
      if (Object.keys(times).length === 1 && times['N/A']) {
        return { ...acc, [day]: 'N/A' };
      }

      const selectedTimes = Object.keys(times)
        .filter(time => times[time])
        .map(time => time.replace(/\s+/g, ''));

      if (selectedTimes.length === 0) {
        return { ...acc, [day]: 'N/A' };
      }

      const sortedTimes = selectedTimes.sort((a, b) => {
        const [aStart] = a.split('-');
        const [bStart] = b.split('-');
        return parseInt(aStart, 10) - parseInt(bStart, 10);
      });

      const groupedTimes = processTimes(sortedTimes);

      return { ...acc, [day]: groupedTimes.join(', ') };
    }, {});

    return weekdaysOrder.reduce((sortedAcc, day) => {
      if (result[day]) {
        return { ...sortedAcc, [day]: result[day] };
      }
      return sortedAcc;
    }, {});
  };

  const capitalizeWords = str => {
    if (!str) return '';
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Helper function to group form data by page
  const groupFormDataByPage = (finalData, userid) => {
    return {
      // userid
      user_id: userid,
      // Page 1
      userInfo: {
        name: capitalizeWords(finalData.name),
        email: finalData.email,
        github: finalData.github,
        slack: capitalizeWords(finalData.slack),
      },
      // Page 2
      general: {
        hours: finalData.hours,
        period: finalData.period,
        standup: finalData.standup,
        location: finalData.location,
        manager: finalData.manager,
        combined_frontend_backend: finalData.combined_frontend_backend,
        mern_skills: finalData.mern_skills,
        leadership_skills: finalData.leadership_skills,
        leadership_experience: finalData.leadership_experience,
        preferences: finalData.preferences,
        availability: formatAvailability(finalData.availability),
      },
      // Page 3
      frontend: {
        overall: finalData.frontend_Overall,
        HTML: finalData.frontend_HTML,
        Bootstrap: finalData.frontend_Bootstrap,
        CSS: finalData.frontend_CSS,
        React: finalData.frontend_React,
        Redux: finalData.frontend_Redux,
        WebSocketCom: finalData.frontend_WebSocketCom,
        ResponsiveUI: finalData.frontend_ResponsiveUI,
        UnitTest: finalData.frontend_UnitTest,
        Documentation: finalData.frontend_Documentation,
        UIUXTools: finalData.frontend_UIUXTools,
      },
      // Page 4
      backend: {
        Overall: finalData.backend_Overall,
        Database: finalData.backend_Database,
        MongoDB: finalData.backend_MongoDB,
        MongoDB_Advanced: finalData.backend_MongoDB_Advanced,
        TestDrivenDev: finalData.backend_TestDrivenDev,
        Deployment: finalData.backend_Deployment,
        VersionControl: finalData.backend_VersionControl,
        CodeReview: finalData.backend_CodeReview,
        EnvironmentSetup: finalData.backend_EnvironmentSetup,
        AdvancedCoding: finalData.backend_AdvancedCoding,
        AgileDevelopment: finalData.backend_AgileDevelopment,
      },
      // Page 5
      followUp: {
        platform: finalData.followup_platform,
        other_skills: finalData.followup_other_skills,
        suggestion: finalData.followup_suggestion,
        additional_info: finalData.followup_additional_info,
      },
    };
  };

  const groupedData = groupFormDataByPage(newVolunteer, user.userid);

  // TODO: Add logic to send groupedData to backend
  const handleFormSubmission = e => {
    e.preventDefault();
    dispatch(setformData(newVolunteer));
    axios
      .post(ENDPOINTS.HGN_FORM_SUBMIT, groupedData)
      .then(res => {
        if (res.status === 201) toast.success('Form submitted successfully!');
      })
      .catch(error => {
        if (error.response.status === 500) toast.error('Error submitting form. Please try again.');
      });
    navigate.push('/hgnform/page6');
  };

  const handleBack = () => {
    dispatch(setformData(newVolunteer));
    navigate.goBack('/hgnform/page4');
  };

  const handleEdit = () => {
    dispatch(setformData(newVolunteer));
    navigate.push('/hgnform');
  };

  const handleTextChange = e => {
    setNewVolunteer({ ...newVolunteer, [e.target.name]: e.target.value });
  };

  const searchQuestion = (page, qno) => {
    const questiontext = questions.find(question => question.page === page && question.qno === qno);
    return questiontext.text;
  };

  if (loading) {
    return (
      <div>
        <Spinner color="primary" className="spinner-hgnform" />;
      </div>
    );
  }

  return (
    <div className="followup-questions">
      <h3 className="blue-strip">Follow-up Questions</h3>
      <form onSubmit={handleFormSubmission}>
        {questions.map((question, index) => {
          // Dynamically map formData field names to questions
          // const fieldName =
          //   index === 0
          //     ? 'followup_platform'
          //     : index === 1
          //     ? 'followup_other_skills'
          //     : index === 2
          //     ? 'followup_suggestion'
          //     : 'followup_additional_info';
          const fieldNames = [
            'followup_platform',
            'followup_other_skills',
            'followup_suggestion',
            'followup_additional_info',
          ];

          const fieldName = fieldNames[index] || 'followup_additional_info';

          return (
            <div className="follow-up" key={question._id || index}>
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
                    {searchQuestion(5, index + 1)}
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

              <input
                type="text"
                name={fieldName}
                value={newVolunteer[fieldName] || ''}
                onChange={handleTextChange}
                required={index === 0} // Only the first field is required
              />
            </div>
          );
        })}

        <div className="final-button-container">
          <button type="button" className="hgn-return-button" onClick={handleBack}>
            Back
          </button>
          <button type="button" className="edit-button" onClick={handleEdit}>
            Edit My Response
          </button>
          <button type="submit" className="submit-button">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default FollowupQuestions;
