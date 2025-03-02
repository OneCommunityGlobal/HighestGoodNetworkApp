import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./Feedbackform.css";

const Feedbackform = () => {
  const { email } = useParams();
  const [name, setName] = useState(""); // Fixed: Start with empty state
  const [userEmail, setUserEmail] = useState(email || ""); // Fixed: Separate email state
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload

    console.log({ name, userEmail, rating, feedback });

    // ✅ Reset all form fields
    setName("");
    setUserEmail("");
    setRating(0);
    setFeedback("");
  };

  // ✅ Reset form fields when Cancel is clicked
  const handleCancel = () => {
    setName("");
    setUserEmail(email || "");
    setFeedback("");
    setRating(0);
  };

  return (
    <div className="Feedback-form-container">
      <h2>Event Feedback</h2>
      <p>We appreciate your participation in our event. Please provide your feedback to help us improve.</p>
      <form onSubmit={handleSubmit}>

        <label>
          <span className="required">Name</span>
          <input 
            type="text" 
            placeholder="Enter full name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </label>

        <label>
          <span className="required">Email Address</span>
          <input 
            type="email" 
            placeholder="abc@gmail.com" 
            value={userEmail} 
            onChange={(e) => setUserEmail(e.target.value)} 
            required 
          />
        </label>
        
        <label>
          <span className="required">Rate your experience </span>
        </label>
      
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              className={star <= rating ? "star selected" : "star"}
              style={{ cursor: "pointer" }} // Ensure it remains clickable
            >
              ★
            </span>
          ))}
        </div>

        <label>
          Comments
          <textarea 
            placeholder="Add your extra thoughts.." 
            value={feedback} 
            onChange={(e) => setFeedback(e.target.value)} 
          />
        </label>
        
        <div className="button-group">
          <button type="submit" className="submit-button">Submit Feedback</button>
          <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
        </div>

      </form>
    </div>
  );
};

export default Feedbackform;
