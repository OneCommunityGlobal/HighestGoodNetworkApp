import React, { useState } from "react";

const RegistrationForm = () => {
    const [eventType, setEventType] = useState("");
    const [location, setLocation] = useState("");
    const [name, setName] = useState("");  
    const [eventDate, setEventDate] = useState(""); 

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Name of Register: ${name}, Event Type: ${eventType}, Location: ${location}, Event Date: ${eventDate}`);
    };

    return (
        <form className="registrationForm" onSubmit={handleSubmit}>
            <h3>Event Registrations</h3>

            <div className="RegistrationformField">
                <label>Name of Registrant</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name"/>
            </div>

            <div className="RegistrationformField">
                <label>Event Type</label>
                <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
                    <option value="">Select Event Type</option>
                    <option value="conference">Conference</option>
                    <option value="workshop">Workshop</option>
                    <option value="webinar">Webinar</option>
                    <option value="webinar">Meeting</option>
                </select>
            </div>

            <div className="RegistrationformField">
                <label>Location</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)}>
                    <option value="">Select Location</option>
                    <option value="ny">New York</option>
                    <option value="sf">San Francisco</option>
                    <option value="la">Los Angeles</option>
                </select>
            </div>
            <div className="RegistrationformField">
                <label>Event Date</label>
                <input 
                    type="date" 
                    value={eventDate} 
                    onChange={(e) => setEventDate(e.target.value)} 
                    placeholder="Select Event Date"
                />
            </div>
            <button type="submit" className="submitbtn">Submit</button>
        </form>
    );
};

export default RegistrationForm;
