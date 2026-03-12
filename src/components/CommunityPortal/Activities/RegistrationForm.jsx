import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './styles.module.css';

function RegistrationForm() {
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [eventDate, setEventDate] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    toast(
      `Name of Register: ${name}, Event Type: ${eventType}, Location: ${location}, Event Date: ${eventDate}`,
    );
  };

  return (
    <form className={`${styles.registrationForm}`} onSubmit={handleSubmit}>
      <h2 className={`${styles.headerTitle}`}>Event Registrations</h2>

      <div className={`${styles.registrationformField}`}>
        <label htmlFor="name">Name of Registrant</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>

      <div className={`${styles.registrationformField}`}>
        <label htmlFor="eventType">Event Type</label>
        <select id="eventType" value={eventType} onChange={e => setEventType(e.target.value)}>
          <option value="">Select Event Type</option>
          <option value="conference">Conference</option>
          <option value="workshop">Workshop</option>
          <option value="webinar">Webinar</option>
        </select>
      </div>

      <div className={`${styles.registrationformField}`}>
        <label htmlFor="location">Location</label>
        <select id="location" value={location} onChange={e => setLocation(e.target.value)}>
          <option value="">Select Location</option>
          <option value="ny">New York</option>
          <option value="sf">San Francisco</option>
          <option value="la">Los Angeles</option>
        </select>
      </div>

      <div className={`${styles.registrationformField}`}>
        <label htmlFor="eventDate">Event Date</label>
        <input
          id="eventDate"
          type="date"
          value={eventDate}
          onChange={e => setEventDate(e.target.value)}
          placeholder="Select Event Date"
        />
      </div>

      <button type="submit" className={`${styles.submitbtn}`}>
        Submit
      </button>
    </form>
  );
}

export default RegistrationForm;
