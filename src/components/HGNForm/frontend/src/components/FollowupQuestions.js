import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/FollowupQuestions.css";
import { useFormContext } from "../components/FormContext";
import { FaEdit, FaRegSave } from "react-icons/fa";
import axios from "axios";

const FollowupQuestions = () => {
  const navigate = useNavigate();
  const { formData, setFormData } = useFormContext();
  const [questions, setQuestions] = useState([]);

  const isOwner = true; // Set to `true` if the user is the owner

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
            page: 5,
            title: "followup",
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

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditedText(questions[index]?.text || "");
  };

  const handleSaveClick = async (index) => {
    try {
      const updatedQuestions = [...questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        text: editedText,
      };

      // Update the backend
      await axios.put(
        `${API_BASE_URL}/questions/${updatedQuestions[index]._id}`,
        {
          text: editedText,
        }
      );

      setQuestions(updatedQuestions);
      setEditingIndex(null);
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const formatAvailability = (availability) => {
    const result = {};
    const weekdaysOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ];

    for (const [day, times] of Object.entries(availability)) {
      // If the user has selected "N/A" for this day, skip it
      if (Object.keys(times).length === 1 && times["N/A"]) {
        continue;
      }

      // Filter selected times
      const selectedTimes = Object.keys(times)
        .filter((time) => times[time])
        .map((time) => time.replace(/\s+/g, "")); // Remove spaces from time strings

      if (selectedTimes.length === 0) {
        result[day] = "N/A";
        continue;
      }

      // Sort times in ascending order
      selectedTimes.sort((a, b) => {
        const [aStart] = a.split("-");
        const [bStart] = b.split("-");
        return parseInt(aStart) - parseInt(bStart);
      });

      // Group consecutive times
      const groupedTimes = [];
      let rangeStart = selectedTimes[0];
      let previousTime = rangeStart;

      for (let i = 1; i <= selectedTimes.length; i++) {
        const currentTime = selectedTimes[i];
        const [prevEnd] = previousTime.split("-");
        const [currStart] = currentTime ? currentTime.split("-") : [null];

        // Check if current time is consecutive to the previous time
        if (currentTime && parseInt(prevEnd) === parseInt(currStart) - 1) {
          previousTime = currentTime;
        } else {
          const formattedRange = `${rangeStart.split("-")[0]}-${
            previousTime.split("-")[1]
          }`;
          groupedTimes.push(formattedRange);
          rangeStart = currentTime;
          previousTime = currentTime;
        }
      }

      result[day] = groupedTimes.join(", ");
    }

    // Sort result by weekdays order
    const sortedResult = weekdaysOrder.reduce((acc, day) => {
      if (result[day]) {
        acc[day] = result[day];
      }
      return acc;
    }, {});

    return sortedResult;
  };

  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Helper function to group form data by page
  const groupFormDataByPage = (formData) => {
    return {
      // Page 1
      USER_INFO: {
        name: capitalizeWords(formData.name),
        email: formData.email,
        github: formData.github,
        slack: capitalizeWords(formData.slack),
      },
      // Page 2
      GENERAL: {
        hours: formData.hours,
        period: formData.period,
        standup: formData.standup,
        location: formData.location,
        manager: formData.manager,
        combined_frontend_backend: formData.combined_frontend_backend,
        combined_skills: formData.combined_skills,
        mern_skills: formData.mern_skills,
        leadership_skills: formData.leadership_skills,
        leadership_experience: formData.leadership_experience,
        preferences: formData.preferences,
        availability: formatAvailability(formData.availability),
      },
      // Page 3
      FRONTEND: {
        overall: formData.frontend_Overall,
        HTML: formData.frontend_HTML,
        Bootstrap: formData.frontend_Bootstrap,
        CSS: formData.frontend_CSS,
        React: formData.frontend_React,
        Redux: formData.frontend_Redux,
        WebSocketCom: formData.frontend_WebSocketCom,
        ResponsiveUI: formData.frontend_ResponsiveUI,
        UnitTest: formData.frontend_UnitTest,
        Documentation: formData.frontend_Documentation,
        UIUXTools: formData.frontend_UIUXTools,
      },
      // Page 4
      BACKEND: {
        Overall: formData.backend_Overall,
        Database: formData.backend_Database,
        MongoDB: formData.backend_MongoDB,
        MongoDB_Advanced: formData.backend_MongoDB_Advanced,
        TestDrivenDev: formData.backend_TestDrivenDev,
        Deployment: formData.backend_Deployment,
        VersionControl: formData.backend_VersionControl,
        CodeReview: formData.backend_CodeReview,
        EnvironmentSetup: formData.backend_EnvironmentSetup,
        AdvancedCoding: formData.backend_AdvancedCoding,
        AgileDevelopment: formData.backend_AgileDevelopment,
      },
      // Page 5
      FOLLOWUP: {
        platform: formData.followup_platform,
        other_skills: formData.followup_other_skills,
        suggestion: formData.followup_suggestion,
        additional_info: formData.followup_additional_info,
      },
    };
  };

  const groupedData = groupFormDataByPage(formData);

  // TODO: Add logic to send groupedData to backend
  const handleFormSubmission = (e) => {
    e.preventDefault();
    console.log(
      formData.name.trim(),
      "'s data sent to backend for processing: ",
      groupedData
    );
    navigate("/page6");
  };

  const handleBack = () => {
    navigate("/page4");
  };

  const handleEdit = () => {
    navigate("/");
  };

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <p>Loading Questions...</p>;
  }

  return (
    <div className="followup-questions">
      <h3 className="blue-strip">Follow-up Questions</h3>
      <form onSubmit={handleFormSubmission}>
        {questions.map((question, index) => {
          // Dynamically map formData field names to questions
          const fieldName =
            index === 0
              ? "followup_platform"
              : index === 1
              ? "followup_other_skills"
              : index === 2
              ? "followup_suggestion"
              : "followup_additional_info";

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
                    {question.text}
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
                value={formData[fieldName] || ""}
                onChange={handleTextChange}
                required={index === 0} // Only the first field is required
              />
            </div>
          );
        })}

        <div className="button-container">
          <button type="button" className="cancel-button" onClick={handleBack}>
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
};

export default FollowupQuestions;
