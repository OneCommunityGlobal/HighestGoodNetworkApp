import { useState } from 'react';

function TestEventRegistration() {
  // State to store the event name and error message
  const [formValues, setFormValues] = useState({
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
  });
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
  const [formSubmitted, setFormSubmitted] = useState(false);
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
    if (formValues.howDidYouHear.includes('Others') && !formValues.otherHowDidYouHear.trim()) {
      newErrors.howDidYouHear = 'Please specify how you heard about us.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setFormSubmitted(true);
      // Clear the form on successful submission
      setFormValues({
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
      });
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    setFormValues({
      eventName: '',
      firstName: '',
      lastName: '',
      countryCode: '',
      phoneNumber: '',
      emailAddress: '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipcode: '',
      howDidYouHear: '',
      otherHowDidYouHear: '',
    });
    setErrors({});
  };
  const closeModal = () => {
    setFormSubmitted(false); // Close the popup
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="eventName" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Event Name: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={formValues.eventName}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {errors.eventName && (
            <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.eventName}</span>
          )}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="firstName" style={{ display: 'block', marginBottom: '0.5rem' }}>
            First Name: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formValues.firstName}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {errors.firstName && (
            <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.firstName}</span>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="lastName" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Last Name: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formValues.lastName}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {errors.lastName && (
            <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.lastName}</span>
          )}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="phoneNumber" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Phone Number: <span style={{ color: 'red' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              name="countryCode"
              value={formValues.countryCode}
              onChange={handleChange}
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '30%',
              }}
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
              style={{
                flex: 1,
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>
          {errors.countryCode && (
            <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.countryCode}</span>
          )}
          {errors.phoneNumber && (
            <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.phoneNumber}</span>
          )}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="emailAddress" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Email Address: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="emailAddress"
            name="emailAddress"
            value={formValues.emailAddress}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {errors.emailAddress && (
            <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.emailAddress}</span>
          )}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="dateOfBirth" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Date of Birth: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formValues.dateOfBirth}
            onChange={handleChange}
            max={
              new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                .toISOString()
                .split('T')[0]
            } // Set max to today's date minus 18 years
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {errors.dateOfBirth && (
            <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.dateOfBirth}</span>
          )}
        </div>
        {/* Gender Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="gender" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Gender: <span style={{ color: 'red' }}>*</span>
          </label>
          <div>
            <label>
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={formValues.gender === 'Male'}
                onChange={handleChange}
              />
              Male
            </label>
            <label style={{ marginLeft: '1rem' }}>
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={formValues.gender === 'Female'}
                onChange={handleChange}
              />
              Female
            </label>
            <label style={{ marginLeft: '1rem' }}>
              <input
                type="radio"
                name="gender"
                value="Binary/Non-Binary"
                checked={formValues.gender === 'Binary/Non-Binary'}
                onChange={handleChange}
              />
              Binary/Non-Binary
            </label>
            <label style={{ marginLeft: '1rem' }}>
              <input
                type="radio"
                name="gender"
                value="Prefer Not to Say"
                checked={formValues.gender === 'Prefer Not to Say'}
                onChange={handleChange}
              />
              Prefer Not to Say
            </label>
            <label style={{ marginLeft: '1rem' }}>
              <input
                type="radio"
                name="gender"
                value="Others"
                checked={formValues.gender === 'Others'}
                onChange={handleChange}
              />
              Others
            </label>
          </div>

          {/* Conditional Text Box for "Others" */}
          {formValues.gender === 'Others' && (
            <div style={{ marginTop: '0.5rem' }}>
              <label htmlFor="otherGender" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Please Specify: <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                id="otherGender"
                name="otherGender"
                value={formValues.otherGender || ''}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              {errors.otherGender && (
                <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.otherGender}</span>
              )}
            </div>
          )}

          {errors.gender && (
            <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.gender}</span>
          )}
        </div>

        {/* Address Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="address" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Address: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formValues.address}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {errors.address && (
            <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.address}</span>
          )}
        </div>

        {/* City Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="city" style={{ display: 'block', marginBottom: '0.5rem' }}>
            City: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formValues.city}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {errors.city && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.city}</span>}
        </div>

        {/* State Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="state" style={{ display: 'block', marginBottom: '0.5rem' }}>
            State: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formValues.state}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {errors.state && (
            <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.state}</span>
          )}
        </div>

        {/* Country Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="country" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Country: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formValues.country}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {errors.country && (
            <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.country}</span>
          )}
        </div>

        {/* ZIP Code Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="zipcode" style={{ display: 'block', marginBottom: '0.5rem' }}>
            ZIP Code: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="zipcode"
            name="zipcode"
            value={formValues.zipcode}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {errors.zipcode && (
            <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.zipcode}</span>
          )}
        </div>
        {/* How Did You Hear About Us Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="howDidYouHear" style={{ display: 'block', marginBottom: '0.5rem' }}>
            How did you hear about us? <span style={{ color: 'red' }}>*</span>
          </label>
          {[
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
          ].map(option => (
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
                  style={{
                    marginLeft: '1rem',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
              )}
            </div>
          ))}
          {errors.howDidYouHear && (
            <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.howDidYouHear}</span>
          )}
        </div>

        {/* buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Submit
          </button>
        </div>
      </form>
      {formSubmitted && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h2 style={{ marginBottom: '1rem' }}>Form Submitted</h2>
            <p>Your form has been successfully submitted!</p>
            <button
              type="button"
              onClick={closeModal}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestEventRegistration;
