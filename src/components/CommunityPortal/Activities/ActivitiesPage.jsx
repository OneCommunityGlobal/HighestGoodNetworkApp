import React, { useState } from "react";
import RegistrationForm from "./RegistrationForm";
import ResourceMonitoring from "./ResourceMonitoring";
import LatestRegistration from "./LatestRegistration";
import MyEvent from "./MyEvent";
import ActivityFeedbackModal from "../ActivityFeedbackForm";
import "./styles.css";

function ActivitiesPage() {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="activities-page">
      <header className="header">
        <h1>Event Registrations</h1>

        <button className="feedback-btn" onClick={() => setShowFeedback(true)}>
          Give Feedback
        </button>
      </header>

      <ResourceMonitoring />

      <div className="middle-section">
        <RegistrationForm />
      </div>

      <div className="main-content">
        <LatestRegistration />
        <MyEvent />
      </div>

      {showFeedback && (
        <ActivityFeedbackModal onClose={() => setShowFeedback(false)} />
      )}
    </div>
  );
}

export default ActivitiesPage;
