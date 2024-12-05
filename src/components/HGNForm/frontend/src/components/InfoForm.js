import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "../components/FormContext";
import "../styles/InfoForm.css";

const InfoForm = () => {
  const { formData, setFormData } = useFormContext();
  const [touched, setTouched] = useState(false);
  const [isSlackNameWarning, setIsSlackNameWarning] = useState(false);

  const isValid = formData.name.length >= 2;
  const showError = touched && !isValid;

  const navigate = useNavigate();

  useEffect(() => {
    const trimmedSlack = formData.slack.trim().toLowerCase();
    const trimmedName = formData.name.trim().toLowerCase();

    if (trimmedSlack === trimmedName) {
      setIsSlackNameWarning(false);
    } else if (formData.slack && formData.name) {
      setIsSlackNameWarning(true);
    }
  }, [formData.name, formData.slack]);

  const handleSlackChange = (e) => {
    const { checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      isSlackSameAsName: checked,
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!isValid) {
      setTouched(true);
      return;
    }

    if (
      formData.isSlackSameAsName &&
      formData.name.trim().toLowerCase() !== formData.slack.trim().toLowerCase()
    ) {
      setIsSlackNameWarning(true);
      return;
    }

    navigate("/page2");
  };

  const handleCancel = (e) => {
    e.preventDefault();
    setTouched(false);

    setFormData({
      // Rest all the pages when "Cancel" button is clicked

      // PAGE 1: General form fields
      name: "",
      email: "",
      github: "",
      slack: "",

      // PAGE 2: Fields from GeneralQuestions component
      hours: "",
      period: "",
      standup: "",
      location: "",
      manager: "",
      combined_frontend_backend: "",
      combined_skills: "",
      mern_skills: "",
      leadership_skills: "",
      leadership_experience: "",
      preferences: [],
      availability: {},

      // PAGE 3: Frontend form fields
      frontend_Overall: "",
      frontend_HTML: "",
      frontend_Bootstrap: "",
      frontend_CSS: "",
      frontend_React: "",
      frontend_Redux: "",
      frontend_WebSocketCom: "",
      frontend_ResponsiveUI: "",
      frontend_UnitTest: "",
      frontend_Documentation: "",
      frontend_UIUXTools: "",

      // PAGE 4: Backend form fields
      backend_Overall: "",
      backend_Database: "",
      backend_MongoDB: "",
      backend_MongoDB_Advanced: "",
      backend_TestDrivenDev: "",
      backend_Deployment: "",
      backend_VersionControl: "",
      backend_CodeReview: "",
      backend_EnvironmentSetup: "",
      backend_AdvancedCoding: "",
      backend_AgileDevelopment: "",

      // PAGE 5: Follow-up form fields
      followup_platform: "",
      followup_other_skills: "",
      followup_suggestion: "",
      followup_additional_info: "",

      isSlackNameWarning: "",
    });
  };

  return (
    <div className="info-form-container">
      <form onSubmit={handleNext}>
        <div className="form-inputs">
          <label htmlFor="name">
            Name <span style={{ color: "red" }}>*</span>
          </label>
          <input
            className={`info-input ${showError ? "error" : ""}`}
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onBlur={() => setTouched(true)}
            required
            minLength={2}
            pattern=".{2,}"
            title="Name must be at least 2 characters long"
            placeholder="Your First and Last Name"
          />
          {showError && (
            <span className="error-message">
              Name must be at least 2 characters long
            </span>
          )}
        </div>
        <div className="form-inputs">
          <label htmlFor="email">
            Email <span style={{ color: "red" }}>*</span>
          </label>
          <input
            className="info-input"
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            placeholder="Your Email"
          />
        </div>
        <div className="form-inputs">
          <label htmlFor="github">
            GitHub <span style={{ color: "red" }}>*</span>
          </label>
          <input
            className="info-input"
            type="text"
            id="github"
            value={formData.github}
            onChange={(e) =>
              setFormData({ ...formData, github: e.target.value })
            }
            required
            placeholder="Your GitHub"
          />
        </div>
        <div className="form-inputs">
          <label htmlFor="slack">
            Slack <span style={{ color: "red" }}>*</span>
          </label>
          <input
            className="info-input"
            type="text"
            id="slack"
            value={formData.slack}
            onChange={(e) =>
              setFormData({ ...formData, slack: e.target.value })
            }
            required
            placeholder="Your Slack"
          />
        </div>
        {isSlackNameWarning && (
          <span
            className="error-message"
            style={{ color: "red", margin: "20px 20px" }}
          >
            Kindly ensure your Slack name matches your full name as entered
            above. If it does not, please go to your Slack account to update
            your name, then return to this form to continue.
          </span>
        )}
        <div className="form-inputs-slack">
          <input
            className="slack-checkbox"
            type="checkbox"
            id="sameAsName"
            checked={formData.isSlackSameAsName}
            onChange={handleSlackChange}
            required
          />

          <label
            style={{ color: "#2f5061", margin: "0 5px" }}
            htmlFor="sameAsName"
          >
            Yes, my Slack handle is my first and last name{" "}
            <span style={{ color: "red" }}>*</span>
          </label>
        </div>

        <span
          className="error-message"
          style={{ color: "#2e5163", margin: "20px 20px" }}
        >
          <strong>NOTE:</strong> Your name and email need to match what is on
          your DropBox and Google Doc. Please edit them on your Profile Page if
          they don’t.{" "}
        </span>

        <div className="button-container">
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button type="submit" className="next-button">
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default InfoForm;
