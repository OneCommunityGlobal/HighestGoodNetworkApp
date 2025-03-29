import './RegistrationPopup.css';

function Popup({ onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup">
        <div className="popup-header">
          <span>✅ Registration Successful!</span>
          <button type="button" className="close-btn" onClick={onClose}>
            ✖
          </button>
        </div>
        <h2>Thank you for Registering!</h2>
        <p>
          You have successfully registered for the event. We have reserved your space. See you
          there!
        </p>
        <div className="popup-content">
          <strong>Event Name</strong>
          <p className="event-details">(Click for more details)</p>

          <div className="event-info">
            <span>📅 Tuesday, January 7th, 2025</span>
            <span>📍 7:00 PM CST</span>
          </div>

          <button type="button" className="calendar-btn">
            Add to my calendar
          </button>

          <div className="popup-footer">
            <button type="button" className="email-btn">
              View details in Email
            </button>
            <button type="button" className="download-btn">
              Download Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Popup;
