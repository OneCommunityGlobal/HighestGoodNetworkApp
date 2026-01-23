import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Activitiesstyles.module.css';

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
      <h3>Event Registrations</h3>

      <div className={`${styles.formFields}`}>
        <input
          type="text"
          placeholder="Registrant name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <div className={`${styles.inlineRow}`}>
          <select value={eventType} onChange={e => setEventType(e.target.value)}>
            <option value="">Event type</option>
            <option value="conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="webinar">Webinar</option>
          </select>

          <select value={location} onChange={e => setLocation(e.target.value)}>
            <option value="">Location</option>
            <option value="ny">New York</option>
            <option value="sf">San Francisco</option>
            <option value="la">Los Angeles</option>
          </select>
        </div>

        <div className={`${styles.bottomRow}`}>
          <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />

          <button type="submit" className={`${styles.submitbtn}`}>
            Register
          </button>
        </div>
      </div>
    </form>
  );
}

export default RegistrationForm;
