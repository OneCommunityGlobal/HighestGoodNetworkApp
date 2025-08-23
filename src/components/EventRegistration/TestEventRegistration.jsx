import { useState } from 'react';
import styles from './TestEventRegistration.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import mockEvents from '../CommunityPortal/Reports/Participation/mockData';


function TestEventRegistration() {
  // State to store the event name and error message
  const eventDetails = {
    eventName: '',
    firstName: '',
    lastName: '',
    countryCode: '',
    phoneNumber: '',
    emailAddress: '',
    dateOfBirth: '',
    gender: '',
    otherGender: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    howDidYouHear: '',
    otherHowDidYouHear: '',
  };
  const howDidYouHearOptions = [
    'Search Engine (Google, Bing, etc.)',
    'Social Media',
    'Radio',
    'Television',
    'Streaming Service Ad',
    'Newspaper/Online Newspaper',
    'Billboard',
    'Word of Mouth',
    'Referral',
    'Others',
  ];
  const [formValues, setFormValues] = useState(eventDetails);
  const [errors, setErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function normalizeDigits(v = '') {
    return v.replace(/\D/g, '');
  }

  function isAdult(dob) {
    if (!dob) return false;
    const d = new Date(dob);
    const eighteen = new Date();
    eighteen.setFullYear(eighteen.getFullYear() - 18);
    return d <= eighteen;
  }

  function validate(values, selectedEvent) {
    const errs = {};
    const phoneDigits = normalizeDigits(values.phoneNumber);
    const isUS =
      values.country?.toLowerCase().includes('united states') ||
      values.country === 'United States' ||
      values.country === 'USA';

    // Event
    if (!values.eventName.trim()) {
      errs.eventName = 'Event Name is required.';
    } else if (selectedEvent) {
      const seatsLeft =
        typeof selectedEvent.availableSeats === 'number'
          ? selectedEvent.availableSeats
          : (selectedEvent.capacity ?? 0) - (selectedEvent.attendees ?? 0);
      if (Number.isFinite(seatsLeft) && seatsLeft <= 0) {
        errs.eventName = 'This event is full.';
      }
    }

    // Names
    if (!values.firstName.trim()) errs.firstName = 'First Name is required.';
    if (!values.lastName.trim()) errs.lastName = 'Last Name is required.';

    // Phone
    if (!values.countryCode.trim()) errs.countryCode = 'Country Code is required.';
    if (!phoneDigits || phoneDigits.length !== 10) {
      errs.phoneNumber = 'Enter a valid 10-digit phone number.';
    }

    // Email
    if (!values.emailAddress.trim()) {
      errs.emailAddress = 'Email Address is required.';
    } else if (!emailRegex.test(values.emailAddress)) {
      errs.emailAddress = 'Please enter a valid email address.';
    }

    // DOB
    if (!values.dateOfBirth.trim()) {
      errs.dateOfBirth = 'Date of Birth is required.';
    } else if (!isAdult(values.dateOfBirth)) {
      errs.dateOfBirth = 'You must be at least 18 years old.';
    }

    // Gender
    if (!values.gender.trim()) errs.gender = 'Gender is required.';
    if (values.gender === 'Others' && !values.otherGender.trim()) {
      errs.otherGender = 'Please specify your gender.';
    }

    // Address
    if (!values.address.trim()) errs.address = 'Address is required.';
    if (!values.city.trim()) errs.city = 'City is required.';
    if (!values.state.trim()) errs.state = 'State is required.';
    if (!values.country.trim()) errs.country = 'Country is required.';

    // ZIP
    if (!values.zipcode.trim()) {
      errs.zipcode = 'ZIP/Postal code is required.';
    } else if (isUS && !/^\d{5}$/.test(values.zipcode)) {
      errs.zipcode = 'Enter a valid 5-digit US ZIP code.';
    }

    // How did you hear
    if (!values.howDidYouHear.trim()) {
      errs.howDidYouHear = 'Please select at least one option.';
    } else if (values.howDidYouHear === 'Others' && !values.otherHowDidYouHear.trim()) {
      errs.howDidYouHear = 'Please specify how you heard about us.';
    }

    return errs;
  }


  // Handle changes in the input field
  const handleChange = e => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));
    setErrors(prev => ({
      ...prev,
      [name]: '',
    })); // Clear error when user starts typing
  };
  // const [formSubmitted, setFormSubmitted] = useState(false);
  // Handle form submission
  const handleSubmit = e => {
    e.preventDefault();
    const selectedEvent = mockEvents.find(ev => ev.eventName === formValues.eventName);

    const newErrors = validate(formValues, selectedEvent);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the highlighted fields.');
      const first = Object.keys(newErrors)[0];
      document.getElementById(first)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    toast.success(
      `Registration confirmed for "${formValues.eventName}" at ${formValues.city}, ${formValues.state}, ${formValues.country}.`
    );
    setFormValues(eventDetails);
  };



  // Handle cancel button
  const handleCancel = () => {
    setFormValues(eventDetails);
    setErrors({});
  };
  // const closeModal = () => {
  //   setFormSubmitted(false); // Close the popup
  // };

  const maxDob = new Date(new Date().setFullYear(new Date().getFullYear() - 18))
    .toISOString()
    .split('T')[0];

  return (
    <div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="eventName" className={styles.label}>
            Event Name: <span style={{ color: 'red' }}>*</span>
          </label>
          <select
            id="eventName"
            name="eventName"
            value={formValues.eventName}
            onChange={e => {
              const selected = mockEvents.find(ev => ev.eventName === e.target.value);
              setFormValues(prev => ({
                ...prev,
                eventName: e.target.value,
              }));
              setErrors(prev => ({ ...prev, eventName: '' }));
            }}
            className={styles.input}
          >
            <option value="">-- Select an event --</option>
            {mockEvents.map(ev => (
              <option key={ev.id} value={ev.eventName}>
                {ev.eventName} {ev.capacity === 0 ? '(Full)' : `(Seats: ${ev.capacity})`}
              </option>
            ))}
          </select>
          {errors.eventName && <span className={styles.error}>{errors.eventName}</span>}

        </div>
        <div className={styles.formGroup}>
          <label htmlFor="firstName" className={styles.label}>
            First Name: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formValues.firstName}
            onChange={handleChange}
            className={styles.input}
          />
          {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lastName" className={styles.label}>
            Last Name: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formValues.lastName}
            onChange={handleChange}
            className={styles.input}
          />
          {errors.lastName && <span className={styles.error}>{errors.lastName}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phone" className={styles.label}>
            Phone Number: <span style={{ color: 'red' }}>*</span>
          </label>

          <PhoneInput
            country="us"                 // default, user can change
            enableSearch                 // searchable country list
            countryCodeEditable={false}  // lock dial code editing
            inputProps={{ id: 'phone', name: 'phone' }}
            // Build a single E.164-like value for the widget:
            value={`${formValues.countryCode || ''}${formValues.phoneNumber ? formValues.phoneNumber.replace(/\D/g, '') : ''}`}
            onChange={(value, country) => {
              const dial = `+${country?.dialCode || ''}`;
              // strip the dial code from the full value to get national number
              const national = value.replace(/^\+?/, '').replace(new RegExp(`^${country?.dialCode || ''}`), '');
              setFormValues(prev => ({
                ...prev,
                countryCode: dial,
                phoneNumber: national.replace(/\D/g, ''), // keep only digits
              }));
              setErrors(prev => ({ ...prev, countryCode: '', phoneNumber: '' }));
            }}
            // optional styling hooks
            inputClass={styles.input}
            containerClass={styles.phoneContainer}
            buttonClass={styles.phoneButton}
            dropdownClass={styles.phoneDropdown}
          />

          {errors.countryCode && <span className={styles.error}>{errors.countryCode}</span>}
          {errors.phoneNumber && <span className={styles.error}>{errors.phoneNumber}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="emailAddress" className={styles.label}>
            Email Address: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="emailAddress"
            name="emailAddress"
            value={formValues.emailAddress}
            onChange={handleChange}
            className={styles.input}
          />
          {errors.emailAddress && <span className={styles.error}>{errors.emailAddress}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="dateOfBirth" className={styles.label}>
            Date of Birth: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formValues.dateOfBirth}
            onChange={handleChange}
            max={maxDob} // Set max to today's date minus 18 years
            className={styles.input}
          />
          {errors.dateOfBirth && <span className={styles.error}>{errors.dateOfBirth}</span>}
        </div>
        {/* Gender Field */}
        <div className={styles.formGroup}>
          <label htmlFor="gender" className={styles.label}>
            Gender: <span style={{ color: 'red' }}>*</span>
          </label>
          <div className={styles.radioGroup}>
            {['Male', 'Female', 'Binary/Non-Binary', 'Prefer Not to Say', 'Others'].map(option => (
              <label key={option}>
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={formValues.gender === option}
                  onChange={handleChange}
                />
                {option}
              </label>
            ))}
          </div>

          {/* Conditional Text Box for "Others" */}
          {formValues.gender === 'Others' && (
            <div className={styles.othersInput}>
              <label htmlFor="otherGender" className={styles.label}>
                Please Specify: <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                id="otherGender"
                name="otherGender"
                value={formValues.otherGender || ''}
                onChange={handleChange}
                className={styles.otherText}
              />
              {errors.otherGender && <span className={styles.error}>{errors.otherGender}</span>}
            </div>
          )}

          {errors.gender && <span className={styles.error}>{errors.gender}</span>}
        </div>

        {/* Address Field */}
        {['address', 'city', 'state', 'country', 'zipcode'].map(field => (
          <div key={field} className={styles.formGroup}>
            <label htmlFor={field} className={styles.label}>
              {field.charAt(0).toUpperCase() + field.slice(1)}:{' '}
              <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              id={field}
              name={field}
              value={formValues[field]}
              onChange={handleChange}
              className={styles.input}
            />
            {errors[field] && <span className={styles.error}>{errors[field]}</span>}
          </div>
        ))}

        {/* How Did You Hear About Us Field */}
        <div className={styles.formGroup}>
          <label htmlFor="howDidYouHear" className={styles.label}>
            How did you hear about us? <span style={{ color: 'red' }}>*</span>
          </label>
          {howDidYouHearOptions.map(option => (
            <div key={option} style={{ marginBottom: '0.5rem' }}>
              <label>
                <input
                  type="radio"
                  name="howDidYouHear" // Shared name for all radio buttons
                  value={option}
                  onChange={handleChange}
                  checked={formValues.howDidYouHear === option} // Ensures correct selection
                />
                {option}
              </label>
              {option === 'Others' && formValues.howDidYouHear === 'Others' && (
                <input
                  type="text"
                  name="otherHowDidYouHear"
                  placeholder="Please specify"
                  value={formValues.otherHowDidYouHear}
                  onChange={handleChange}
                  className={styles.hearOtherInput}
                />
              )}
            </div>
          ))}
          {errors.howDidYouHear && <span className={styles.error}>{errors.howDidYouHear}</span>}
        </div>

        {/* buttons */}
        <div className={styles.buttons}>
          <button type="button" onClick={handleCancel} className={styles.cancelBtn}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn}>
            Submit
          </button>
        </div>
      </form>
      {/* {formSubmitted && (
        <div
          className={styles.modalOverlay}
        >
          <div
            className={styles.modalContent}
          >
            <h2 className={styles.modalTitle}>Form Submitted</h2>
            <p>Your form has been successfully submitted!</p>
            <button
              type="button"
              onClick={closeModal}
              className={styles.modalBtn}
            >
              Close
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
}

export default TestEventRegistration;
