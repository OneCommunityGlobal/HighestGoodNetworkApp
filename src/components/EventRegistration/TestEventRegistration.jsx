import { useState } from 'react';
import styles from './TestEventRegistration.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import mockEvents from '../CommunityPortal/Reports/Participation/mockData';

function TestEventRegistration() {
  const eventDetails = {
    eventName: '',
    firstName: '',
    lastName: '',
    countryCode: '+1',
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
    howDidYouHear: [],
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
  const [confirmation, setConfirmation] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

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

  function getSeatsLeft(ev) {
    if (!ev) return undefined;
    return ev.capacity;
  }

  function validate(values, currentEvent) {
    const errs = {};
    const phoneDigits = normalizeDigits(values.phoneNumber);
    const isUS =
      values.country?.toLowerCase().includes('united states') ||
      values.country === 'United States' ||
      values.country === 'USA';

    // Event
    if (!values.eventName.trim()) {
      errs.eventName = 'Event Name is required.';
    } else if (currentEvent) {
      const seatsLeft = getSeatsLeft(currentEvent);
      if (typeof seatsLeft === 'number' && seatsLeft <= 0) {
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
    if (!values.address.trim()) errs.address = 'Street Address is required.';
    if (!values.city.trim()) errs.city = 'City is required.';
    if (!values.state.trim()) errs.state = 'State/Province is required.';
    if (!values.zipcode.trim()) errs.zipcode = 'Postal/ZIP code is required.';
    if (!values.country.trim()) errs.country = 'Country is required.';

    // How did you hear
    if (!values.howDidYouHear || values.howDidYouHear.length === 0) {
      errs.howDidYouHear = 'Please select at least one option.';
    }
    if (values.howDidYouHear?.includes('Others') && !values.otherHowDidYouHear?.trim()) {
      errs.howDidYouHear = 'Please specify how you heard about us.';
    }

    return errs;
  }

  // Generic input change
  const handleChange = e => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Checkboxes: how did you hear
  const handleHearChange = option => {
    setFormValues(prev => {
      const selected = new Set(prev.howDidYouHear || []);
      if (selected.has(option)) selected.delete(option);
      else selected.add(option);
      return { ...prev, howDidYouHear: Array.from(selected) };
    });
    setErrors(prev => ({ ...prev, howDidYouHear: '' }));
  };

  // Event dropdown
  const handleEventChange = e => {
    const value = e.target.value;
    setFormValues(prev => ({ ...prev, eventName: value }));
    setErrors(prev => ({ ...prev, eventName: '' }));
    setConfirmation(null);
  };

  // Submit
  const handleSubmit = e => {
    e.preventDefault();
    const currentEvent = mockEvents.find(x => x.eventName === formValues.eventName) || null;
    const newErrors = validate(formValues, currentEvent);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the highlighted fields.');
      const first = Object.keys(newErrors)[0];
      const el = document.getElementById(first);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
      return;
    }

    const eventDate = currentEvent?.date || 'TBD';
    const eventLocation =
      currentEvent?.location ||
      [formValues.city, formValues.state, formValues.country].filter(Boolean).join(', ');

    toast.success(`Registration confirmed for "${formValues.eventName}".`);
    setConfirmation({
      name: `${formValues.firstName} ${formValues.lastName}`.trim(),
      eventName: formValues.eventName,
      date: eventDate,
      location: eventLocation,
      email: formValues.emailAddress,
      phone: `${formValues.countryCode}${formValues.phoneNumber}`,
    });
    setShowConfirm(true);

    setFormValues(eventDetails);
  };

  const handleCancel = () => {
    setFormValues(eventDetails);
    setErrors({});
  };

  const handleCloseConfirm = () => setShowConfirm(false);

  const maxDob = new Date(new Date().setFullYear(new Date().getFullYear() - 18))
    .toISOString()
    .split('T')[0];

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <h1>Register Now!</h1>
        <p>to be a part of the event.</p>
      </div>

      {/* Card */}
      <div className={styles.card}>
        <p className={styles.subheading}>Please fill the information carefully!</p>
        <p className={styles.sectionLink} id="personal-info">
          Personal Information
        </p>
        <p className={styles.requiredNote}>* Indicates required question</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Event */}
          <div className={styles.formGroup}>
            <label htmlFor="eventName" className={styles.label}>
              Event Name <span className={styles.req}>*</span>
            </label>
            <select
              id="eventName"
              name="eventName"
              value={formValues.eventName}
              onChange={handleEventChange}
              className={styles.input}
            >
              <option value="">Select the event name</option>
              {mockEvents.map(ev => (
                <option key={ev.id} value={ev.eventName}>
                  {ev.eventName} {ev.capacity === 0 ? '(Full)' : `(Seats: ${ev.capacity})`}
                </option>
              ))}
            </select>
            {errors.eventName && <span className={styles.error}>{errors.eventName}</span>}
          </div>

          {/* Name */}
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.label}>
              First Name <span className={styles.req}>*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="Enter your first name"
              value={formValues.firstName}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.label}>
              Last Name <span className={styles.req}>*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Enter your last name"
              value={formValues.lastName}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.lastName && <span className={styles.error}>{errors.lastName}</span>}
          </div>

          {/* Phone */}
          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              Phone Number <span className={styles.req}>*</span>
            </label>
            <PhoneInput
              country="us"
              enableSearch
              countryCodeEditable={false}
              inputProps={{ id: 'phone', name: 'phone' }}
              value={`${formValues.countryCode || ''}${
                formValues.phoneNumber ? formValues.phoneNumber.replace(/\D/g, '') : ''
              }`}
              onChange={(value, country) => {
                const dial = `+${country?.dialCode || ''}`;
                const national = value
                  .replace(/^\+?/, '')
                  .replace(new RegExp(`^${country?.dialCode || ''}`), '');
                setFormValues(prev => ({
                  ...prev,
                  countryCode: dial,
                  phoneNumber: national.replace(/\D/g, ''),
                }));
                setErrors(prev => ({ ...prev, countryCode: '', phoneNumber: '' }));
              }}
              inputClass={styles.input}
              containerClass={styles.phoneContainer}
              buttonClass={styles.phoneButton}
              dropdownClass={styles.phoneDropdown}
            />
            {errors.countryCode && <span className={styles.error}>{errors.countryCode}</span>}
            {errors.phoneNumber && <span className={styles.error}>{errors.phoneNumber}</span>}
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label htmlFor="emailAddress" className={styles.label}>
              Email Address <span className={styles.req}>*</span>
            </label>
            <input
              type="text"
              id="emailAddress"
              name="emailAddress"
              placeholder="Enter your email address"
              value={formValues.emailAddress}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.emailAddress && <span className={styles.error}>{errors.emailAddress}</span>}
          </div>

          {/* DOB */}
          <div className={styles.formGroup}>
            <label htmlFor="dateOfBirth" className={styles.label}>
              Date of Birth <span className={styles.req}>*</span>
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formValues.dateOfBirth}
              onChange={handleChange}
              max={maxDob}
              className={styles.input}
            />
            {errors.dateOfBirth && <span className={styles.error}>{errors.dateOfBirth}</span>}
          </div>

          {/* Gender */}
          <div className={styles.formGroup}>
            <span className={styles.label}>
              Gender <span className={styles.req}>*</span>
            </span>
            <div className={styles.radioGroup}>
              {['Female', 'Male', 'Non-binary', 'Prefer not to say', 'Others'].map(option => (
                <label key={option} className={styles.radioLabel}>
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
            {formValues.gender === 'Others' && (
              <div className={styles.othersInput}>
                <label htmlFor="otherGender" className={styles.label}>
                  Please Specify <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  id="otherGender"
                  name="otherGender"
                  value={formValues.otherGender || ''}
                  onChange={handleChange}
                  className={styles.input}
                />
                {errors.otherGender && <span className={styles.error}>{errors.otherGender}</span>}
              </div>
            )}
            {errors.gender && <span className={styles.error}>{errors.gender}</span>}
          </div>

          {/* Address */}
          {/* Address */}
          <fieldset className={styles.formGroup} aria-describedby="addressHelp">
            <legend className={styles.label}>
              Address <span className={styles.req}>*</span>
            </legend>

            <div className={styles.addrGrid}>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Street Address"
                value={formValues.address}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                type="text"
                id="city"
                name="city"
                placeholder="City"
                value={formValues.city}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                type="text"
                id="state"
                name="state"
                placeholder="State/Province"
                value={formValues.state}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                type="text"
                id="zipcode"
                name="zipcode"
                placeholder="Postal/zip code"
                value={formValues.zipcode}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                type="text"
                id="country"
                name="country"
                placeholder="Country"
                value={formValues.country}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            {['address', 'city', 'state', 'zipcode', 'country'].some(k => errors[k]) && (
              <span id="addressHelp" className={styles.error}>
                {errors.address || errors.city || errors.state || errors.zipcode || errors.country}
              </span>
            )}
          </fieldset>

          {/* How did you hear */}
          <fieldset className={styles.formGroup} aria-describedby="howHelp">
            <legend id="howLegend" className={styles.label}>
              How did you hear about us? (Select all that apply){' '}
              <span className={styles.req}>*</span>
            </legend>

            <div className={styles.checkboxGroup} role="group" aria-labelledby="howLegend">
              {howDidYouHearOptions.map(option => (
                <label key={option} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formValues.howDidYouHear.includes(option)}
                    onChange={() => handleHearChange(option)}
                    aria-checked={formValues.howDidYouHear.includes(option)}
                  />
                  {option}
                </label>
              ))}
            </div>

            {formValues.howDidYouHear.includes('Others') && (
              <input
                type="text"
                id="otherHowDidYouHear"
                name="otherHowDidYouHear"
                placeholder="Other (please specify)"
                value={formValues.otherHowDidYouHear}
                onChange={handleChange}
                className={styles.input}
                aria-describedby="howHelp"
              />
            )}

            {errors.howDidYouHear && (
              <span id="howHelp" className={styles.error}>
                {errors.howDidYouHear}
              </span>
            )}
          </fieldset>

          {/* Buttons */}
          <div className={styles.buttonsRow}>
            <button type="button" onClick={handleCancel} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={4000} />

      {/* Modal */}
      {showConfirm && confirmation && (
        <div
          className={styles.modalOverlay}
          role="button"
          tabIndex={0}
          aria-label="Close confirmation"
          onClick={handleCloseConfirm}
          onKeyDown={e => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') handleCloseConfirm();
          }}
        >
          <div
            className={styles.modalContent}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmTitle"
            tabIndex={-1}
          >
            <h2 id="confirmTitle" className={styles.modalTitle}>
              Registration Successful
            </h2>
            <div className={styles.modalBody}>
              <p>
                <strong>Event:</strong> {confirmation.eventName}
              </p>
              <p>
                <strong>Date:</strong> {confirmation.date}
              </p>
              <p>
                <strong>Location:</strong> {confirmation.location}
              </p>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalBtn} onClick={handleCloseConfirm}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestEventRegistration;
