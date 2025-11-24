import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './TestEventRegistration.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import mockEvents from '../CommunityPortal/Reports/Participation/mockData';

function TestEventRegistration() {
  // Safe Redux selector with fallback
  const darkMode = useSelector(state => state?.theme?.darkMode) || false;

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

  // Filter states
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Enhanced email regex validation following RFC 5322 standards
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

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

  // Helper function to extract date from eventTime
  function extractDate(eventTime) {
    if (!eventTime) return '';
    const dateMatch = eventTime.match(/(\w{3} \d{1,2}, \d{4})/);
    return dateMatch ? dateMatch[1] : '';
  }

  // Filter events based on current filter criteria
  function getFilteredEvents() {
    return mockEvents.filter(event => {
      const matchesType =
        !typeFilter || event.eventType.toLowerCase().includes(typeFilter.toLowerCase());
      const matchesLocation =
        !locationFilter || event.location.toLowerCase().includes(locationFilter.toLowerCase());

      let matchesDate = true;
      if (dateFilter) {
        const eventDate = extractDate(event.eventTime);
        matchesDate = eventDate.toLowerCase().includes(dateFilter.toLowerCase());
      }

      return matchesType && matchesLocation && matchesDate;
    });
  }

  // Get unique values for filter dropdowns
  const uniqueTypes = [...new Set(mockEvents.map(event => event.eventType))];
  const uniqueLocations = [...new Set(mockEvents.map(event => event.location))];
  const uniqueDates = [
    ...new Set(mockEvents.map(event => extractDate(event.eventTime)).filter(Boolean)),
  ];

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
    } else {
      const email = values.emailAddress.trim().toLowerCase();

      // Check length constraints
      if (email.length > 254) {
        errs.emailAddress = 'Email address is too long (maximum 254 characters).';
      } else if (!emailRegex.test(email)) {
        // Provide specific feedback based on common email format issues
        if (!email.includes('@')) {
          errs.emailAddress = 'Email address must contain an @ symbol.';
        } else if (email.startsWith('@') || email.endsWith('@')) {
          errs.emailAddress = 'Email address cannot start or end with @.';
        } else if (!email.includes('.')) {
          errs.emailAddress = 'Email address must contain a domain (e.g., .com, .org).';
        } else if (email.includes('..')) {
          errs.emailAddress = 'Email address cannot contain consecutive dots.';
        } else {
          errs.emailAddress = 'Please enter a valid email address (e.g., user@example.com).';
        }
      }
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

  // Filter handlers
  const handleTypeFilter = e => {
    setTypeFilter(e.target.value);
  };

  const handleLocationFilter = e => {
    setLocationFilter(e.target.value);
  };

  const handleDateFilter = e => {
    setDateFilter(e.target.value);
  };

  const clearFilters = () => {
    setTypeFilter('');
    setLocationFilter('');
    setDateFilter('');
  };

  // Submit
  const handleSubmit = e => {
    e.preventDefault();
    const currentEvent = filteredEvents.find(x => x.eventName === formValues.eventName) || null;
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

  const filteredEvents = getFilteredEvents();
  const noResults = filteredEvents.length === 0 && (typeFilter || locationFilter || dateFilter);

  return (
    <div className={`${styles.page} ${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.banner} ${darkMode ? styles.bannerDark : ''}`}>
        <h1>Register Now!</h1>
        <p>to be a part of the event.</p>
      </div>

      {/* Card */}
      <div className={`${styles.card} ${darkMode ? styles.cardDark : ''}`}>
        {/* Filter Section */}
        <div className={styles.filterSection}>
          <h3 className={`${styles.filterTitle} ${darkMode ? styles.textLight : ''}`}>
            Find Events
          </h3>
          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label
                htmlFor="typeFilter"
                className={`${styles.filterLabel} ${darkMode ? styles.textLight : ''}`}
              >
                Event Type
              </label>
              <select
                id="typeFilter"
                value={typeFilter}
                onChange={handleTypeFilter}
                className={`${styles.filterInput} ${darkMode ? styles.inputDark : ''}`}
              >
                <option value="">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label
                htmlFor="locationFilter"
                className={`${styles.filterLabel} ${darkMode ? styles.textLight : ''}`}
              >
                Location
              </label>
              <select
                id="locationFilter"
                value={locationFilter}
                onChange={handleLocationFilter}
                className={`${styles.filterInput} ${darkMode ? styles.inputDark : ''}`}
              >
                <option value="">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label
                htmlFor="dateFilter"
                className={`${styles.filterLabel} ${darkMode ? styles.textLight : ''}`}
              >
                Date
              </label>
              <select
                id="dateFilter"
                value={dateFilter}
                onChange={handleDateFilter}
                className={`${styles.filterInput} ${darkMode ? styles.inputDark : ''}`}
              >
                <option value="">All Dates</option>
                {uniqueDates.map(date => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterActions}>
              <button
                type="button"
                onClick={clearFilters}
                className={`${styles.clearBtn} ${darkMode ? styles.clearBtnDark : ''}`}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {noResults && (
            <div className={`${styles.noResults} ${darkMode ? styles.noResultsDark : ''}`}>
              <p>No events found matching your search criteria. Try adjusting your filters.</p>
            </div>
          )}
        </div>

        <p className={`${styles.subheading} ${darkMode ? styles.textLight : ''}`}>
          Please fill the information carefully!
        </p>
        <p className={styles.sectionLink} id="personal-info">
          Personal Information
        </p>
        <p className={`${styles.requiredNote} ${darkMode ? styles.textLight : ''}`}>
          * Indicates required question
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Event */}
          <div className={styles.formGroup}>
            <label
              htmlFor="eventName"
              className={`${styles.label} ${darkMode ? styles.textLight : ''}`}
            >
              Event Name <span className={styles.req}>*</span>
            </label>
            <select
              id="eventName"
              name="eventName"
              value={formValues.eventName}
              onChange={handleEventChange}
              className={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
            >
              <option value="">Select the event name</option>
              {filteredEvents.map(ev => (
                <option key={ev.id} value={ev.eventName}>
                  {ev.eventName} - {ev.eventType} ({ev.location}) - {extractDate(ev.eventTime)}{' '}
                  {ev.capacity === 0 ? '(Full)' : `(Seats: ${ev.capacity})`}
                </option>
              ))}
            </select>
            {filteredEvents.length === 0 && (typeFilter || locationFilter || dateFilter) && (
              <div
                className={`${styles.noEventsMessage} ${
                  darkMode ? styles.noEventsMessageDark : ''
                }`}
              >
                No events match your current filters. Please adjust the filters above.
              </div>
            )}
            {errors.eventName && <span className={styles.error}>{errors.eventName}</span>}
          </div>

          {/* Name */}
          <div className={styles.formGroup}>
            <label
              htmlFor="firstName"
              className={`${styles.label} ${darkMode ? styles.textLight : ''}`}
            >
              First Name <span className={styles.req}>*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="Enter your first name"
              value={formValues.firstName}
              onChange={handleChange}
              className={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
            />
            {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
          </div>

          <div className={styles.formGroup}>
            <label
              htmlFor="lastName"
              className={`${styles.label} ${darkMode ? styles.textLight : ''}`}
            >
              Last Name <span className={styles.req}>*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Enter your last name"
              value={formValues.lastName}
              onChange={handleChange}
              className={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
            />
            {errors.lastName && <span className={styles.error}>{errors.lastName}</span>}
          </div>

          {/* Phone */}
          <div className={styles.formGroup}>
            <label
              htmlFor="phone"
              className={`${styles.label} ${darkMode ? styles.textLight : ''}`}
            >
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
              inputClass={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
              containerClass={styles.phoneContainer}
              buttonClass={styles.phoneButton}
              dropdownClass={styles.phoneDropdown}
            />
            {errors.countryCode && <span className={styles.error}>{errors.countryCode}</span>}
            {errors.phoneNumber && <span className={styles.error}>{errors.phoneNumber}</span>}
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label
              htmlFor="emailAddress"
              className={`${styles.label} ${darkMode ? styles.textLight : ''}`}
            >
              Email Address <span className={styles.req}>*</span>
            </label>
            <input
              type="text"
              id="emailAddress"
              name="emailAddress"
              placeholder="Enter your email address"
              value={formValues.emailAddress}
              onChange={handleChange}
              className={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
            />
            {errors.emailAddress && <span className={styles.error}>{errors.emailAddress}</span>}
          </div>

          {/* DOB */}
          <div className={styles.formGroup}>
            <label
              htmlFor="dateOfBirth"
              className={`${styles.label} ${darkMode ? styles.textLight : ''}`}
            >
              Date of Birth <span className={styles.req}>*</span>
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formValues.dateOfBirth}
              onChange={handleChange}
              max={maxDob}
              className={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
            />
            {errors.dateOfBirth && <span className={styles.error}>{errors.dateOfBirth}</span>}
          </div>

          {/* Gender */}
          <div className={styles.formGroup}>
            <span className={`${styles.label} ${darkMode ? styles.textLight : ''}`}>
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
                <label
                  htmlFor="otherGender"
                  className={`${styles.label} ${darkMode ? styles.textLight : ''}`}
                >
                  Please Specify <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  id="otherGender"
                  name="otherGender"
                  value={formValues.otherGender || ''}
                  onChange={handleChange}
                  className={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
                />
                {errors.otherGender && <span className={styles.error}>{errors.otherGender}</span>}
              </div>
            )}
            {errors.gender && <span className={styles.error}>{errors.gender}</span>}
          </div>

          {/* Address */}
          <fieldset className={styles.formGroup} aria-describedby="addressHelp">
            <legend className={`${styles.label} ${darkMode ? styles.textLight : ''}`}>
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
                className={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
              />
              <input
                type="text"
                id="city"
                name="city"
                placeholder="City"
                value={formValues.city}
                onChange={handleChange}
                className={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
              />
              <input
                type="text"
                id="state"
                name="state"
                placeholder="State/Province"
                value={formValues.state}
                onChange={handleChange}
                className={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
              />
              <input
                type="text"
                id="zipcode"
                name="zipcode"
                placeholder="Postal/zip code"
                value={formValues.zipcode}
                onChange={handleChange}
                className={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
              />
              <input
                type="text"
                id="country"
                name="country"
                placeholder="Country"
                value={formValues.country}
                onChange={handleChange}
                className={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
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
            <legend
              id="howLegend"
              className={`${styles.label} ${darkMode ? styles.textLight : ''}`}
            >
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
                className={`${styles.input} ${darkMode ? styles.inputDark : ''}`}
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
            className={`${styles.modalContent} ${darkMode ? styles.modalContentDark : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmTitle"
            tabIndex={-1}
          >
            <h2
              id="confirmTitle"
              className={`${styles.modalTitle} ${darkMode ? styles.textLight : ''}`}
            >
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
