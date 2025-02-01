import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Register.css";

function Register() {
  const { activityId } = useParams(); 
  const [activity, setActivity] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [availability, setAvailability] = useState(0);
  const [activeTab, setActiveTab] = useState("description"); 
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    
    const fetchedActivities = [
      {
        id: 1,
        name: "Yoga Class",
        rating: 4,
        type: "Fitness",
        date: "03-10-2025",
        time: "10:00 AM",
        organizer:"Alex Brian",
        location: "Community Center",
        capacity: 10,
        image: "https://cdn.pixabay.com/photo/2024/06/21/07/46/yoga-8843808_1280.jpg",
        description: "A relaxing yoga session to improve flexibility and mindfulness.",
        faqs: [
          { question: "What should I bring?", answer: "A yoga mat and a water bottle." },
          { question: "Is it beginner-friendly?", answer: "Yes, it is suitable for all levels." },
        ],
        participants: ["John Doe", "Jane Smith", "Alice Brown"],
        comments: ["Looking forward to this!", "This will be my first yoga session!"],
      },
      {
        id: 2,
        name: "Book Club",
        rating: 5,
        type: "Social",
        date: "03-15-2025",
        time: "5:00 PM",
        organizer:"Bob",
        location: "Library",
        capacity: 5,
        image: "https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_1280.jpg",
        description: "A book club discussion on the latest bestsellers.",
        faqs: [
          { question: "Do I need to read the book beforehand?", answer: "Yes, it's recommended." },
          { question: "Are snacks provided?", answer: "Yes, light refreshments will be available." },
        ],
        participants: ["Emily White", "Michael Green"],
        comments: ["Excited to discuss my favorite book!", "What book are we reading?"],
      },
    ];

    const selectedActivity = fetchedActivities.find(
      (activity) => activity.id === parseInt(activityId)
    );
    if (selectedActivity) {
      setActivity(selectedActivity);
      setAvailability(selectedActivity.capacity);
      setComments(selectedActivity.comments || []);
    }
  }, [activityId]);

  const handleRegister = () => {
    if (availability > 0) {
      setAvailability((prev) => prev - 1);
      setFeedbackMessage({
        type: "success",
        text: "Registration successful! See you at the event.",
      });
    } else {
      setFeedbackMessage({
        type: "error",
        text: "Registration failed. No spots available.",
      });
    }
  };

  const handleCommentSubmit = () => {
    if (newComment.trim() !== "") {
      setComments((prev) => [...prev, newComment]);
      setNewComment("");
    }
  };

  if (!activity) return <p>Loading activity details...</p>;

  return (
    <div className="main-container">
    <div className="register-container">
      {/* Left Column: Image + Register Button */}
      <div className="left-column">
        <img src={activity.image} alt={activity.name} className="event-image" />
        <button
          className="register-button"
          onClick={handleRegister}
          disabled={availability === 0}
        >
          Register
        </button>
        {feedbackMessage && (
          <div
            className={`feedback-message ${
              feedbackMessage.type === "success" ? "success" : "error"
            }`}
          >
            {feedbackMessage.text}
          </div>
        )}
      </div>

<div className="middle-column">
  <h1>{activity.name}</h1>
  <div className="details-grid">
    <div className="details-row">
     
      <p>
        <strong>Date:</strong> {activity.date}
      </p>
      <p>
        <strong>Time:</strong> {activity.time}
      </p>
      <p>
        <strong>Organizer:</strong> {activity.organizer || "Not Available"}
      </p>
    </div>

<div className="details-row">
  <p>
    <strong>Availability:</strong> {availability} spots left
  </p>     

  <p className="rating-container">
    <strong>Overall Rating:</strong>
    <span className="star-rating">
      {activity.rating ? (
        [...Array(5)].map((_, index) => (
          <span
            key={index}
            className={index < activity.rating ? 'filled-star' : 'empty-star'}
          >
            {index < activity.rating ? '★' : '☆'}
          </span>
        ))
      ) : (
        ' Not Rated'
      )}
    </span>
  </p>

  <p>
    <strong>Status:</strong> {availability > 0 ? "Available" : "Full"}
  </p>
</div>


  </div>
</div>


    
      <div className="right-column">
        <Calendar onChange={setSelectedDate} value={selectedDate} />
        <p className="selected-date">
          Selected Date: {selectedDate.toDateString()}
        </p>
      </div>

    </div>
  
</div>
  );
}

export default Register;

