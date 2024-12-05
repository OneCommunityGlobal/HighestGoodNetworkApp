import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/FrontendBackendQuestions.css";
import { useFormContext } from "../components/FormContext";
import { FaEdit, FaRegSave } from "react-icons/fa";
import axios from "axios";

const BackendQuestions = () => {
  const navigate = useNavigate();
  const { formData, setFormData } = useFormContext();
  const [questions, setQuestions] = useState([]);

  const isOwner = true; // Set to `true` if the user is the owner

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [loading, setLoading] = useState(true);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

  // Fetch questions from database
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/questions`, {
          params: {
            page: 4,
            title: "backend",
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

  const handleNext = (e) => {
    e.preventDefault();
    navigate("/page5");
  };

  const handleBack = () => {
    navigate("/page3");
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle edit button click to start editing a question in "Owner" mode
  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditedText(questions[index].text); // Set the current question text to be edited
  };

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

  // Mapping question keys to structured field names
  const fieldNameMap = [
    "backend_Overall",
    "backend_Database",
    "backend_MongoDB",
    "backend_MongoDB_Advanced",
    "backend_TestDrivenDev",
    "backend_Deployment",
    "backend_VersionControl",
    "backend_CodeReview",
    "backend_EnvironmentSetup",
    "backend_AdvancedCoding",
    "backend_AgileDevelopment",
  ];

  if (loading) {
    return <div>Loading Questions...</div>;
  }

  return (
    <div className="frontend-backend-questions">
      <h3 className="blue-strip">Backend Questions</h3>
      <form onSubmit={handleNext}>
        {questions.map((question, index) => {
          const fieldName = fieldNameMap[index] || `backend_Question_${index}`;

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
                      checked={formData[fieldName] === (i + 1).toString()}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

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

export default BackendQuestions;
