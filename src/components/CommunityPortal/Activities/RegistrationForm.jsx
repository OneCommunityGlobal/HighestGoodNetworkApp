import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Activitiesstyles.module.css';

function RegistrationForm() {
  const darkMode = useSelector(state => state.theme?.darkMode);
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const isFormComplete = Boolean(name && eventType && location && eventDate);

  const handleSubmit = e => {
    e.preventDefault();
    if (!isFormComplete) {
      setShowValidation(true);
      return;
    }
    toast(
      `Name of Register: ${name}, Event Type: ${eventType}, Location: ${location}, Event Date: ${eventDate}`,
      {
        className: `${styles.registrationToast} ${darkMode ? styles.darkmode : ''}`,
        progressClassName: `${styles.registrationToastProgress} ${darkMode ? styles.darkmode : ''}`,
      },
    );
  };

  return (
    <form
      className={`${styles.registrationForm} ${darkMode ? styles.darkmode : ''}`}
      onSubmit={handleSubmit}
    >
      <h3>Event Registrations</h3>

      <div className={`${styles.formFields}`}>
        <input
          type="text"
          placeholder="Registrant name"
          value={name}
          onChange={e => setName(e.target.value)}
          className={`${showValidation && !name ? styles.inputError : ''}`}
          aria-invalid={showValidation && !name}
        />

        <div className={`${styles.inlineRow}`}>
          <select
            value={eventType}
            onChange={e => setEventType(e.target.value)}
            className={`${showValidation && !eventType ? styles.inputError : ''}`}
            aria-invalid={showValidation && !eventType}
          >
            <option value="">Event type</option>
            <option value="conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="webinar">Webinar</option>
          </select>

          <select
            value={location}
            onChange={e => setLocation(e.target.value)}
            className={`${showValidation && !location ? styles.inputError : ''}`}
            aria-invalid={showValidation && !location}
          >
            <option value="">Location</option>
            <option value="ny">New York</option>
            <option value="sf">San Francisco</option>
            <option value="la">Los Angeles</option>
          </select>
        </div>

        <div className={`${styles.bottomRow}`}>
          <input
            type="date"
            value={eventDate}
            onChange={e => setEventDate(e.target.value)}
            className={`${showValidation && !eventDate ? styles.inputError : ''}`}
            aria-invalid={showValidation && !eventDate}
          />

          <button type="submit" className={`${styles.submitbtn}`}>
            Register
          </button>
        </div>
      </div>
    </form>
  );
}

export default RegistrationForm;
