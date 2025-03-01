import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import '../styles/GeneralQuestions.css';
import { FaEdit, FaRegSave } from 'react-icons/fa';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setformData } from 'actions/hgnFormAction';
import { ENDPOINTS } from '../../utils/URL';

function GeneralQuestions() {
  const navigate = useHistory();
  const dispatch = useDispatch();
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const formData = useSelector(state => state.hgnForm);
  const [newVolunteer, setNewVolunteer] = useState(formData);

  const { isOwner } = location.state; // Set to `true` if the user is the owner

  const [preferenceWarning, setPreferenceWarning] = useState('');
  const [availabilityWarning, setAvailabilityWarning] = useState('');

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch data from database
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${ENDPOINTS.HGN_FORM_GET_QUESTION}`, {
          params: {
            page: 2,
            title: 'general',
          },
        });
        setQuestions(response.data);
      } catch (error) {
        toast.error('Error fetching questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [ENDPOINTS.HGN_FORM_GET_QUESTION]);

  useEffect(() => {
    if (!newVolunteer.availability) {
      setNewVolunteer({
        ...newVolunteer,
        availability: {
          Monday: {},
          Tuesday: {},
          Wednesday: {},
          Thursday: {},
          Friday: {},
        },
      });
    }

    if (!newVolunteer.preferences) {
      setNewVolunteer({
        ...newVolunteer,
        preferences: [],
      });
    }
  }, [formData, setNewVolunteer]);

  const handleBack = () => {
    navigate.goBack('/hgnform');
  };

  const handleNext = e => {
    e.preventDefault();
    // Check if at least one preference is selected
    if (!newVolunteer.preferences || newVolunteer.preferences.length === 0) {
      setPreferenceWarning(
        "Please choose at least one preference. If you don’t have any specific preferences, select 'No Preference'.",
      );
      return;
    }
    setPreferenceWarning('');

    // Check if availability data exists and is not empty
    if (
      !newVolunteer.availability ||
      Object.keys(newVolunteer.availability).length === 0 ||
      Object.values(newVolunteer.availability).every(times =>
        Object.values(times).every(time => time === 'N/A' || time === false),
      )
    ) {
      setAvailabilityWarning(
        "Please select your availability for all days. If you're unavailable on any day, choose 'N/A'.",
      );
      return;
    }
    setAvailabilityWarning('');
    dispatch(setformData(newVolunteer));

    navigate.push('/hgnform/page3', { isOwner });
  };

  const handleRadioChange = e => {
    const { name, value } = e.target;
    setNewVolunteer({ ...newVolunteer, [name]: value });
  };

  const handlePreferenceChange = event => {
    const { value, checked } = event.target;
    let updatedPreferences = newVolunteer.preferences ? [...newVolunteer.preferences] : [];

    if (value === 'No Preference') {
      // If "no-preference" is selected, clear other preferences
      updatedPreferences = checked ? ['No Preference'] : [];
    } else {
      // If any other option is selected, remove "no-preference"
      updatedPreferences = updatedPreferences.filter(pref => pref !== 'No Preference');
      if (checked) {
        updatedPreferences.push(value);
      } else {
        updatedPreferences = updatedPreferences.filter(pref => pref !== value);
      }
    }

    setNewVolunteer({ ...newVolunteer, preferences: updatedPreferences });

    // Update or clear the warning based on the selection
    if (updatedPreferences.length === 0) {
      setPreferenceWarning(
        "Please choose at least one preference. If you don’t have any specific preferences, select 'No Preference'.",
      );
    } else {
      setPreferenceWarning('');
    }
  };

  const handleTextChange = e => {
    setNewVolunteer({ ...newVolunteer, [e.target.name]: e.target.value });
  };

  const handleAvailabilityChange = (day, time, checked) => {
    const updatedAvailability = { ...newVolunteer.availability };

    if (!updatedAvailability[day]) {
      updatedAvailability[day] = {};
    }

    // If "N/A" is checked, disable other times for the day
    if (time === 'N/A' && checked) {
      updatedAvailability[day] = { 'N/A': true };
    } else {
      // Uncheck "N/A" if other times are selected
      updatedAvailability[day][time] = checked;
      if (time !== 'N/A') {
        delete updatedAvailability[day]['N/A'];
      } else {
        // If "N/A" is unchecked, keep the state but allow other times to be selected
        delete updatedAvailability[day]['N/A'];
      }
    }

    setNewVolunteer({ ...newVolunteer, availability: updatedAvailability });

    if (
      !updatedAvailability ||
      Object.keys(updatedAvailability).length === 0 ||
      Object.values(updatedAvailability).every(times =>
        Object.values(times).every(t => t === 'N/A' || t === false),
      )
    ) {
      setAvailabilityWarning(
        "Please select your availability for all days. If you're unavailable on any day, choose 'N/A'.",
      );
      return;
    }
    setAvailabilityWarning('');
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = [
    'N/A',
    ' 5AM- 6AM',
    ' 6AM- 7AM',
    ' 7AM- 8AM',
    ' 8AM- 9AM',
    '9AM-10AM',
    '10AM-11AM',
    '11AM-12PM',
    '12PM-1PM',
  ];

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
        page: '2',
        title: 'general',
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

  const renderEditableQuestion = index => {
    return (
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
            {questions[index]?.text}
            {isOwner && (
              <FaEdit className="edit-icon" onClick={() => handleEditClick(index)} title="Edit" />
            )}
          </p>
        )}
      </div>
    );
  };
  if (loading) {
    return <div>Loading Questions...</div>;
  }

  return (
    <div className="general-questions">
      <h3 className="blue-strip">General Questions</h3>
      <form onSubmit={handleNext}>
        <div className="hours">
          {renderEditableQuestion(0)}
          <div className="hours-radio">
            <input
              type="radio"
              name="hours"
              id="10-19"
              value="10-19"
              checked={newVolunteer.hours === '10-19'}
              onChange={handleRadioChange}
              required
            />
            <label htmlFor="10-19">10-19 Hour Team</label>

            <input
              type="radio"
              name="hours"
              id="20-29"
              value="20-29"
              checked={newVolunteer.hours === '20-29'}
              onChange={handleRadioChange}
            />
            <label htmlFor="20-29">20-29 Hour Team</label>

            <input
              type="radio"
              name="hours"
              id="30+"
              value="30+"
              checked={newVolunteer.hours === '30+'}
              onChange={handleRadioChange}
            />
            <label htmlFor="30+">30+ Hour Team</label>
          </div>
        </div>

        <div className="period">
          {renderEditableQuestion(1)}
          <div className="period-radio">
            <div>
              <input
                type="radio"
                name="period"
                id="1"
                value=">2"
                checked={newVolunteer.period === '>2'}
                onChange={handleRadioChange}
                required
              />
              <label htmlFor="1">Less than 2 months</label>
            </div>
            <div>
              <input
                type="radio"
                name="period"
                id="2"
                value="2"
                checked={newVolunteer.period === '2'}
                onChange={handleRadioChange}
              />
              <label htmlFor="2">2 months</label>
            </div>
            <div>
              <input
                type="radio"
                name="period"
                id="3"
                value="3-6"
                checked={newVolunteer.period === '3-6'}
                onChange={handleRadioChange}
              />
              <label htmlFor="3">3-6 months</label>
            </div>
            <div>
              <input
                type="radio"
                name="period"
                id="4"
                value="7-12"
                checked={newVolunteer.period === '7-12'}
                onChange={handleRadioChange}
              />
              <label htmlFor="4">7-12 months</label>
            </div>
            <div>
              <input
                type="radio"
                name="period"
                id="5"
                value="<1"
                checked={newVolunteer.period === '<1'}
                onChange={handleRadioChange}
              />
              <label htmlFor="5">More than 1 year</label>
            </div>
          </div>
        </div>

        <div className="standup">
          {renderEditableQuestion(2)}
          <div className="standup-radio">
            <input
              type="radio"
              name="standup"
              id="yes"
              value="yes"
              checked={newVolunteer.standup === 'yes'}
              onChange={handleRadioChange}
              required
            />
            <label htmlFor="yes">Yes</label>

            <input
              type="radio"
              name="standup"
              id="no"
              value="no"
              checked={newVolunteer.standup === 'no'}
              onChange={handleRadioChange}
            />
            <label htmlFor="no">No</label>

            <input
              type="radio"
              name="standup"
              id="maybe"
              value="maybe"
              checked={newVolunteer.standup === 'maybe'}
              onChange={handleRadioChange}
            />
            <label htmlFor="maybe">Maybe</label>
          </div>
        </div>

        <div className="locations">
          {renderEditableQuestion(3)}
          <input
            type="text"
            name="location"
            id="location"
            value={newVolunteer.location || ''}
            onChange={handleTextChange}
            required
          />
        </div>

        <div className="manager">
          {renderEditableQuestion(4)}
          <div className="standup-radio">
            <input
              type="radio"
              name="manager"
              id="yes_m"
              value="yes"
              checked={newVolunteer.manager === 'yes'}
              onChange={handleRadioChange}
              required
            />
            <label htmlFor="yes_m">Yes</label>

            <input
              type="radio"
              name="manager"
              id="no_m"
              value="no"
              checked={newVolunteer.manager === 'no'}
              onChange={handleRadioChange}
            />
            <label htmlFor="no_m">No</label>

            <input
              type="radio"
              name="manager"
              id="maybe_m"
              value="maybe"
              checked={newVolunteer.manager === 'maybe'}
              onChange={handleRadioChange}
            />
            <label htmlFor="maybe_m">Maybe</label>
          </div>
        </div>

        <div className="combined_frontend_backend">
          {renderEditableQuestion(5)}
          <div className="radio-rating">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i}>
                <label htmlFor={`f${i + 1}`}>{i + 1}</label>
                <input
                  type="radio"
                  name="combined_frontend_backend"
                  id={`f${i + 1}`}
                  value={i + 1}
                  onChange={handleRadioChange}
                  checked={newVolunteer.combined_frontend_backend === (i + 1).toString()}
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div className="combined_skills">
          {renderEditableQuestion(6)}
          <div className="radio-rating">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i}>
                <label htmlFor={`b${i + 1}`}>{i + 1}</label>
                <input
                  type="radio"
                  name="combined_skills"
                  id={`b${i + 1}`}
                  value={i + 1}
                  onChange={handleRadioChange}
                  checked={newVolunteer.combined_skills === (i + 1).toString()}
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mern_skills">
          {renderEditableQuestion(7)}
          <div className="radio-rating">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i}>
                <label htmlFor={`b${i + 1}`}>{i + 1}</label>
                <input
                  type="radio"
                  name="mern_skills"
                  id={`b${i + 1}`}
                  value={i + 1}
                  onChange={handleRadioChange}
                  checked={newVolunteer.mern_skills === (i + 1).toString()}
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div className="leadership_skills">
          {renderEditableQuestion(8)}
          <div className="radio-rating">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i}>
                <label htmlFor={`b${i + 1}`}>{i + 1}</label>
                <input
                  type="radio"
                  name="leadership_skills"
                  id={`b${i + 1}`}
                  value={i + 1}
                  onChange={handleRadioChange}
                  checked={newVolunteer.leadership_skills === (i + 1).toString()}
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div className="leadership_experience">
          {renderEditableQuestion(9)}
          <div className="radio-rating">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i}>
                <label htmlFor={`b${i + 1}`}>{i + 1}</label>
                <input
                  type="radio"
                  name="leadership_experience"
                  id={`b${i + 1}`}
                  value={i + 1}
                  onChange={handleRadioChange}
                  checked={newVolunteer.leadership_experience === (i + 1).toString()}
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div className="preferences">
          {renderEditableQuestion(10)}
          <div className="preferences-checkbox">
            {[
              'frontend',
              'backend',
              'design',
              'testing',
              'deployment',
              'management',
              'No Preference',
            ].map(pref => (
              <div key={pref}>
                <input
                  type="checkbox"
                  name="preferences"
                  value={pref}
                  onChange={handlePreferenceChange}
                  checked={newVolunteer.preferences && newVolunteer.preferences.includes(pref)}
                />
                <label>{pref.charAt(0).toUpperCase() + pref.slice(1)}</label>
              </div>
            ))}
          </div>
          {preferenceWarning && (
            <p style={{ color: 'red', fontSize: '0.9em' }}>{preferenceWarning}</p>
          )}
        </div>

        <div className="availability">
          {renderEditableQuestion(11)}
          <div className="availability-selector">
            <div className="availability-grid">
              <div className="corner-cell" />
              {times.map(time => (
                <div key={`time-${time}`} className="time-cell">
                  {time}
                </div>
              ))}
              {days.map(day => (
                <React.Fragment key={`day-${day}`}>
                  <div className="day-label">{day}</div>
                  {times.map((time, timeIndex) => (
                    <input
                      key={`${day}-${time}`}
                      type="checkbox"
                      checked={
                        (newVolunteer.availability && newVolunteer.availability[day]?.[time]) ||
                        false
                      }
                      name={`${day.toLowerCase()}-${timeIndex}`}
                      className="availability-checkbox"
                      onChange={e => handleAvailabilityChange(day, time, e.target.checked)}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          {availabilityWarning && (
            <p style={{ color: 'red', fontSize: '0.9em' }}>{availabilityWarning}</p>
          )}
        </div>

        <div className="button-container">
          <button type="button" className="hgn-return-button" onClick={handleBack}>
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

export default GeneralQuestions;
