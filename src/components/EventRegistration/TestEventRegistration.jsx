import { useState } from 'react';
import styles from './TestEventRegistration.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function TestEventRegistration() {
  // State to store the event name and error message
  const eventDetails =  {
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
  }
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
    const newErrors = {};
    const emailRegex = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
    if (!formValues.eventName.trim()) {
      newErrors.eventName = 'Event Name is required.';
    }
    if (!formValues.firstName.trim()) {
      newErrors.firstName = 'First Name is required.';
    }
    if (!formValues.lastName.trim()) {
      newErrors.lastName = 'Last Name is required.';
    }
    if (!formValues.countryCode.trim()) {
      newErrors.countryCode = 'Country Code is required.';
    }
    if (!formValues.phoneNumber.trim() || !/^[0-9]{10}$/.test(formValues.phoneNumber)) {
      newErrors.phoneNumber = 'A valid 10-digit phone number is required.';
    }
    if (!formValues.emailAddress.trim()) {
      newErrors.emailAddress = 'Email Address is required.';
    }
    if (!emailRegex.test(formValues.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address';
    }
    if (!formValues.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of Birth is required.';
    }
    if (!formValues.gender.trim()) {
      newErrors.gender = 'Gender is required.';
    }
    if (formValues.gender === 'Others' && !formValues.otherGender.trim()) {
      newErrors.otherGender = 'Please specify your gender.';
    }
    if (!formValues.address.trim()) {
      newErrors.address = 'Address is required.';
    }
    if (!formValues.city.trim()) {
      newErrors.city = 'City is required.';
    }
    if (!formValues.state.trim()) {
      newErrors.state = 'State is required.';
    }
    if (!formValues.country.trim()) {
      newErrors.country = 'Country is required.';
    }
    if (!formValues.zipcode.trim() || !/^[0-9]{5}$/.test(formValues.zipcode)) {
      newErrors.zipcode = 'A valid 5-digit ZIP code is required.';
    }
    if (!formValues.howDidYouHear.trim()) {
      newErrors.howDidYouHear = 'Please select at least one option.';
    }
    if (formValues.howDidYouHear === 'Others' && !formValues.otherHowDidYouHear.trim()) {
      newErrors.howDidYouHear = 'Please specify how you heard about us.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all the mandatory details.");
    } else {
      toast.success('Your form has been successfully submitted!');
      // setFormSubmitted(true);
      // Clear the form on successful submission
      setFormValues(eventDetails);
    }
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
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={formValues.eventName}
            onChange={handleChange}
            className={styles.input}
          />
          {errors.eventName && (
            <span className={styles.error}>{errors.eventName}</span>
          )}
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
          {errors.firstName && (
            <span className={styles.error}>{errors.firstName}</span>
          )}
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
          {errors.lastName && (
            <span className={styles.error}>{errors.lastName}</span>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber" className={styles.label}>
            Phone Number: <span style={{ color: 'red' }}>*</span>
          </label>
          <div className={styles.flexRow}>
            <select
              name="countryCode"
              value={formValues.countryCode}
              onChange={handleChange}
              className={styles.selectCode}
            >
              <option value="">Select Code</option>
              <option value="+1">+1 (US)</option>
              <option value="+91">+91 (India)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+61">+61 (Australia)</option>
            </select>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formValues.phoneNumber}
              onChange={handleChange}
              placeholder="XXX-XXX-XXXX"
              className={styles.input}
            />
          </div>
          {errors.countryCode && (
            <span className={styles.error}>{errors.countryCode}</span>
          )}
          {errors.phoneNumber && (
            <span className={styles.error}>{errors.phoneNumber}</span>
          )}
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
          {errors.emailAddress && (
            <span className={styles.error}>{errors.emailAddress}</span>
          )}
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
          {errors.dateOfBirth && (
            <span className={styles.error}>{errors.dateOfBirth}</span>
          )}
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
              {errors.otherGender && (
                <span className={styles.error}>{errors.otherGender}</span>
              )}
            </div>
          )}

          {errors.gender && (
            <span className={styles.error}>{errors.gender}</span>
          )}
        </div>

        {/* Address Field */}
        {['address', 'city', 'state', 'country', 'zipcode'].map(field => (
          <div key={field} className={styles.formGroup}>
            <label htmlFor={field} className={styles.label}>
              {field.charAt(0).toUpperCase() + field.slice(1)}: <span style={{ color: 'red' }}>*</span>
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
          {errors.howDidYouHear && (
            <span className={styles.error}>{errors.howDidYouHear}</span>
          )}
        </div>

        {/* buttons */}
        <div className={styles.buttons}>
          <button
            type="button"
            onClick={handleCancel}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
          >
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
