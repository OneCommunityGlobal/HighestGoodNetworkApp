import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GeneralQuestions.css";
import { useFormContext } from "../components/FormContext";
import { FaEdit, FaRegSave } from "react-icons/fa";
import axios from "axios";

const GeneralQuestions = () => {
  const navigate = useNavigate();
  const { formData, setFormData } = useFormContext();
  const [questions, setQuestions] = useState([]);

  const isOwner = true; // Set to `true` if the user is the owner

  const [preferenceWarning, setPreferenceWarning] = useState("");
  const [availabilityWarning, setAvailabilityWarning] = useState("");

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [loading, setLoading] = useState(true);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

  // Fetch data from database
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/questions`, {
          params: {
            page: 2,
            title: "general",
          },
        });
        // console.log("Fetched questions:", response.data);
        setQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [API_BASE_URL]);

  useEffect(() => {
    if (!formData.availability) {
      setFormData({
        ...formData,
        availability: {
          Monday: {},
          Tuesday: {},
          Wednesday: {},
          Thursday: {},
          Friday: {},
        },
      });
    }

    if (!formData.preferences) {
      setFormData({
        ...formData,
        preferences: [],
      });
    }
  }, [formData, setFormData]);

  const handleBack = () => {
    navigate("/");
  };

  const handleNext = (e) => {
    e.preventDefault();

    // Check if at least one preference is selected
    if (!formData.preferences || formData.preferences.length === 0) {
      setPreferenceWarning(
        "Please choose at least one preference. If you don’t have any specific preferences, select 'No Preference'."
      );
      return;
    }
    setPreferenceWarning("");

    // Check if availability data exists and is not empty
    if (
      !formData.availability ||
      Object.keys(formData.availability).length === 0 ||
      Object.values(formData.availability).every((times) =>
        Object.values(times).every((time) => time === "N/A" || time === false)
      )
    ) {
      setAvailabilityWarning(
        "Please select your availability for all days. If you're unavailable on any day, choose 'N/A'."
      );
      return;
    }
    setAvailabilityWarning("");

    navigate("/page3");
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePreferenceChange = (event) => {
    const { value, checked } = event.target;
    let updatedPreferences = formData.preferences
      ? [...formData.preferences]
      : [];

    if (value === "No Preference") {
      // If "no-preference" is selected, clear other preferences
      updatedPreferences = checked ? ["No Preference"] : [];
    } else {
      // If any other option is selected, remove "no-preference"
      if (checked) {
        updatedPreferences = updatedPreferences.filter(
          (pref) => pref !== "No Preference"
        );
        updatedPreferences.push(value);
      } else {
        updatedPreferences = updatedPreferences.filter(
          (pref) => pref !== value
        );
      }
    }

    setFormData({ ...formData, preferences: updatedPreferences });

    // Update or clear the warning based on the selection
    if (updatedPreferences.length === 0) {
      setPreferenceWarning(
        "Please choose at least one preference. If you don’t have any specific preferences, select 'No Preference'."
      );
    } else {
      setPreferenceWarning("");
    }
  };

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvailabilityChange = (day, time, checked) => {
    const updatedAvailability = { ...formData.availability };

    if (!updatedAvailability[day]) {
      updatedAvailability[day] = {};
    }

    // If "N/A" is checked, disable other times for the day
    if (time === "N/A" && checked) {
      updatedAvailability[day] = { "N/A": true };
    } else {
      // Uncheck "N/A" if other times are selected
      if (time !== "N/A") {
        updatedAvailability[day][time] = checked;
        delete updatedAvailability[day]["N/A"];
      } else {
        // If "N/A" is unchecked, keep the state but allow other times to be selected
        delete updatedAvailability[day]["N/A"];
      }
    }

    setFormData({ ...formData, availability: updatedAvailability });

    if (
      !updatedAvailability ||
      Object.keys(updatedAvailability).length === 0 ||
      Object.values(updatedAvailability).every((times) =>
        Object.values(times).every((time) => time === "N/A" || time === false)
      )
    ) {
      setAvailabilityWarning(
        "Please select your availability for all days. If you're unavailable on any day, choose 'N/A'."
      );
      return;
    }
    setAvailabilityWarning("");
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = [
    "N/A",
    " 5AM- 6AM",
    " 6AM- 7AM",
    " 7AM- 8AM",
    " 8AM- 9AM",
    "9AM-10AM",
    "10AM-11AM",
    "11AM-12PM",
    "12PM-1PM",
  ];

  // Handle edit button click to start editing a question
  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditedText(questions[index].text); // Set the current question text to be edited
  };

  console.log("Questions:", questions);

  // Save edited question
  const handleSaveClick = async (index) => {
    try {
      // Save the updated question to the database
      const response = await axios.put(
        `${API_BASE_URL}/questions/${questions[index]._id}`,
        {
          text: editedText,
        }
      );
      setQuestions((prevQuestions) => {
        const updatedQuestions = [...prevQuestions];
        updatedQuestions[index].text = editedText; // Update the question text locally
        return updatedQuestions;
      });
      setEditingIndex(null); // Exit editing mode
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const renderEditableQuestion = (index) => {
    return (
      <div className="question-container">
        {editingIndex === index && isOwner ? (
          <div className="edit-question-container">
            <p className="edit-title">Edit Question</p>
            <div className="edit-question">
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
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
              <FaEdit
                className="edit-icon"
                onClick={() => handleEditClick(index)}
                title="Edit"
              />
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
              checked={formData.hours === "10-19"}
              onChange={handleRadioChange}
              required
            />
            <label htmlFor="10-19">10-19 Hour Team</label>

            <input
              type="radio"
              name="hours"
              id="20-29"
              value="20-29"
              checked={formData.hours === "20-29"}
              onChange={handleRadioChange}
            />
            <label htmlFor="20-29">20-29 Hour Team</label>

            <input
              type="radio"
              name="hours"
              id="30+"
              value="30+"
              checked={formData.hours === "30+"}
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
                checked={formData.period === ">2"}
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
                checked={formData.period === "2"}
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
                checked={formData.period === "3-6"}
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
                checked={formData.period === "7-12"}
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
                checked={formData.period === "<1"}
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
              checked={formData.standup === "yes"}
              onChange={handleRadioChange}
              required
            />
            <label htmlFor="yes">Yes</label>

            <input
              type="radio"
              name="standup"
              id="no"
              value="no"
              checked={formData.standup === "no"}
              onChange={handleRadioChange}
            />
            <label htmlFor="no">No</label>

            <input
              type="radio"
              name="standup"
              id="maybe"
              value="maybe"
              checked={formData.standup === "maybe"}
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
            value={formData.location || ""}
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
              checked={formData.manager === "yes"}
              onChange={handleRadioChange}
              required
            />
            <label htmlFor="yes_m">Yes</label>

            <input
              type="radio"
              name="manager"
              id="no_m"
              value="no"
              checked={formData.manager === "no"}
              onChange={handleRadioChange}
            />
            <label htmlFor="no_m">No</label>

            <input
              type="radio"
              name="manager"
              id="maybe_m"
              value="maybe"
              checked={formData.manager === "maybe"}
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
                  checked={
                    formData.combined_frontend_backend === (i + 1).toString()
                  }
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
                  checked={formData.combined_skills === (i + 1).toString()}
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
                  checked={formData.mern_skills === (i + 1).toString()}
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
                  checked={formData.leadership_skills === (i + 1).toString()}
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
                  checked={
                    formData.leadership_experience === (i + 1).toString()
                  }
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
              "frontend",
              "backend",
              "design",
              "testing",
              "deployment",
              "management",
              "No Preference",
            ].map((pref) => (
              <div key={pref}>
                <input
                  type="checkbox"
                  name="preferences"
                  value={pref}
                  onChange={handlePreferenceChange}
                  checked={
                    formData.preferences && formData.preferences.includes(pref)
                  }
                />
                <label>{pref.charAt(0).toUpperCase() + pref.slice(1)}</label>
              </div>
            ))}
          </div>
          {preferenceWarning && (
            <p style={{ color: "red", fontSize: "0.9em" }}>
              {preferenceWarning}
            </p>
          )}
        </div>

        <div className="availability">
          {renderEditableQuestion(11)}
          <div className="availability-selector">
            <div className="availability-grid">
              <div className="corner-cell"></div>
              {times.map((time, index) => (
                <div key={index} className="time-cell">
                  {time}
                </div>
              ))}
              {days.map((day, dayIndex) => (
                <React.Fragment key={dayIndex}>
                  <div className="day-label">{day}</div>
                  {times.map((time, timeIndex) => (
                    <input
                      key={timeIndex}
                      type="checkbox"
                      checked={
                        (formData.availability &&
                          formData.availability[day]?.[time]) ||
                        false
                      }
                      name={`${day.toLowerCase()}-${timeIndex}`}
                      className="availability-checkbox"
                      onChange={(e) =>
                        handleAvailabilityChange(day, time, e.target.checked)
                      }
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          {availabilityWarning && (
            <p style={{ color: "red", fontSize: "0.9em" }}>
              {availabilityWarning}
            </p>
          )}
        </div>

        <div className="button-container">
          <button type="button" className="cancel-button" onClick={handleBack}>
            Back
          </button>
          <button type="submit" className="next-button">
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneralQuestions;
