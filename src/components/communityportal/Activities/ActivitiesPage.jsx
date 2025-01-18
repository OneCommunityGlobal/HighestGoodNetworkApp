import React from "react";
import RegistrationForm from "./RegistrationForm";
import ResourceMonitoring from "./ResourceMonitoring";
import LatestRegistration from "./LatestRegistration";
import MyEvent from "./MyEvent";
import "./styles.css";

const ActivitiesPage = () => {
    return (
        <div className="activities-page">
            <header className="header">
                <h1>Event Registrations</h1>
            </header>

            <ResourceMonitoring />

            <div className="middle-section">
                <RegistrationForm />
            </div>

            <div className="main-content">
                <LatestRegistration />
                <MyEvent />
            </div>
        </div>
    );
};

export default ActivitiesPage;
