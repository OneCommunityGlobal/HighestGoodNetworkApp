import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import styles from './JobApplicationForm.module.css';

function JobApplicationProfileFields({
  showPersonalInfo,
  showBasicInfo,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  applicantEmail,
  setApplicantEmail,
  emailInputRef,
  emailSuggestion,
  setEmailSuggestion,
  fieldErrors,
  setFieldErrors,
  handleEmailBlur,
  applyEmailSuggestion,
  companyPosition,
  setCompanyPosition,
  applicantLocation,
  setApplicantLocation,
  timeZone,
  setTimeZone,
  phone,
  setPhone,
  websiteSocial,
  setWebsiteSocial,
  resumeRequired,
  resumeFile,
  resumeFileError,
  resumeInputRef,
  handleResumeChange,
  clearResumeFile,
  FileUploadField,
}) {
  return (
    <div className={styles.formProfileDetailGroup}>
      {showPersonalInfo ? (
        <>
          <div className={styles.profileField}>
            <label htmlFor="jaf-applicant-first-name" className={styles.fieldLabel}>
              <span>First Name</span>
              <span className={styles.requiredMark} aria-hidden="true">
                *
              </span>
            </label>

            <input
              id="jaf-applicant-first-name"
              type="text"
              placeholder="First Name"
              className={`${styles.inputField} ${
                fieldErrors.firstName ? styles.inputFieldError : ''
              }`}
              value={firstName}
              onChange={e => {
                setFirstName(e.target.value);

                if (fieldErrors.firstName) {
                  setFieldErrors(prev => {
                    const next = { ...prev };
                    delete next.firstName;
                    return next;
                  });
                }
              }}
              minLength={2}
              maxLength={100}
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.firstName)}
              autoComplete="given-name"
            />

            {fieldErrors.firstName && (
              <p className={styles.fieldError} role="alert">
                {fieldErrors.firstName}
              </p>
            )}
          </div>

          <div className={styles.profileField}>
            <label htmlFor="jaf-applicant-last-name" className={styles.fieldLabel}>
              <span>Last Name</span>
              <span className={styles.requiredMark} aria-hidden="true">
                *
              </span>
            </label>

            <input
              id="jaf-applicant-last-name"
              type="text"
              placeholder="Last Name"
              className={`${styles.inputField} ${
                fieldErrors.lastName ? styles.inputFieldError : ''
              }`}
              value={lastName}
              onChange={e => {
                setLastName(e.target.value);

                if (fieldErrors.lastName) {
                  setFieldErrors(prev => {
                    const next = { ...prev };
                    delete next.lastName;
                    return next;
                  });
                }
              }}
              minLength={2}
              maxLength={100}
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.lastName)}
              autoComplete="family-name"
            />

            {fieldErrors.lastName && (
              <p className={styles.fieldError} role="alert">
                {fieldErrors.lastName}
              </p>
            )}
          </div>

          <div className={styles.profileField}>
            <label htmlFor="jaf-applicant-email" className={styles.fieldLabel}>
              <span>Email</span>
              <span className={styles.requiredMark} aria-hidden="true">
                *
              </span>
            </label>

            <input
              id="jaf-applicant-email"
              ref={emailInputRef}
              maxLength={254}
              type="email"
              placeholder="Email"
              className={`${styles.inputField} ${
                fieldErrors.applicantEmail ? styles.inputFieldError : ''
              }`}
              value={applicantEmail}
              onChange={e => {
                setApplicantEmail(e.target.value);
                setEmailSuggestion(null);

                if (fieldErrors.applicantEmail) {
                  setFieldErrors(prev => {
                    const next = { ...prev };
                    delete next.applicantEmail;
                    return next;
                  });
                }
              }}
              onBlur={handleEmailBlur}
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.applicantEmail)}
              aria-describedby={
                [
                  fieldErrors.applicantEmail && 'jaf-applicant-email-error',
                  emailSuggestion && 'jaf-applicant-email-suggestion',
                ]
                  .filter(Boolean)
                  .join(' ') || undefined
              }
              autoComplete="email"
            />

            {fieldErrors.applicantEmail && (
              <p id="jaf-applicant-email-error" className={styles.fieldError} role="alert">
                {fieldErrors.applicantEmail}
              </p>
            )}

            {emailSuggestion && (
              <p
                id="jaf-applicant-email-suggestion"
                className={styles.fieldHint}
                aria-live="polite"
              >
                <span>
                  Did you mean <strong>{emailSuggestion}</strong>?
                </span>
                <button
                  type="button"
                  className={styles.clearFileBtn}
                  onClick={applyEmailSuggestion}
                  aria-label={`Use this email: ${emailSuggestion}`}
                >
                  Use this
                </button>
              </p>
            )}
          </div>

          <div className={styles.profileField}>
            <label htmlFor="jaf-company" className={styles.fieldLabel}>
              Company &amp; position
            </label>
            <input
              id="jaf-company"
              type="text"
              placeholder="Company & Position"
              className={styles.inputField}
              value={companyPosition}
              onChange={e => setCompanyPosition(e.target.value)}
              autoComplete="organization-title"
            />
          </div>
        </>
      ) : null}

      {showBasicInfo ? (
        <>
          <div className={styles.profileField}>
            <label htmlFor="jaf-location" className={styles.fieldLabel}>
              <span>Location</span>
              <span className={styles.requiredMark} aria-hidden="true">
                *
              </span>
            </label>

            <input
              id="jaf-location"
              type="text"
              placeholder="Location (e.g., Charlotte, NC)"
              className={`${styles.inputField} ${
                fieldErrors.location ? styles.inputFieldError : ''
              }`}
              value={applicantLocation}
              onChange={e => {
                setApplicantLocation(e.target.value);

                if (fieldErrors.location) {
                  setFieldErrors(prev => {
                    const next = { ...prev };
                    delete next.location;
                    return next;
                  });
                }
              }}
              maxLength={100}
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.location)}
              autoComplete="address-level2"
            />

            {fieldErrors.location && (
              <p className={styles.fieldError} role="alert">
                {fieldErrors.location}
              </p>
            )}
          </div>

          <div className={styles.profileField}>
            <label htmlFor="jaf-timezone" className={styles.fieldLabel}>
              <span>Time Zone</span>
              <span className={styles.requiredMark} aria-hidden="true">
                *
              </span>
            </label>

            <select
              id="jaf-timezone"
              className={`${styles.inputField} ${
                fieldErrors.timeZone ? styles.inputFieldError : ''
              }`}
              value={timeZone}
              onChange={e => {
                setTimeZone(e.target.value);

                if (fieldErrors.timeZone) {
                  setFieldErrors(prev => {
                    const next = { ...prev };
                    delete next.timeZone;
                    return next;
                  });
                }
              }}
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.timeZone)}
            >
              <option value="">Select Time Zone</option>

              {moment.tz.names().map(tz => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>

            {fieldErrors.timeZone && (
              <p className={styles.fieldError} role="alert">
                {fieldErrors.timeZone}
              </p>
            )}
          </div>

          <div className={styles.profileField}>
            <label htmlFor="jaf-phone" className={styles.fieldLabel}>
              <span>Phone number</span>
              <span className={styles.requiredMark} aria-hidden="true">
                *
              </span>
            </label>

            <input
              id="jaf-phone"
              type="tel"
              placeholder="+1 213-456-7890"
              className={`${styles.inputField} ${fieldErrors.phone ? styles.inputFieldError : ''}`}
              value={phone}
              onChange={e => {
                setPhone(e.target.value);

                if (fieldErrors.phone) {
                  setFieldErrors(prev => {
                    const next = { ...prev };
                    delete next.phone;
                    return next;
                  });
                }
              }}
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.phone)}
              autoComplete="tel"
            />

            {fieldErrors.phone && (
              <p className={styles.fieldError} role="alert">
                {fieldErrors.phone}
              </p>
            )}
          </div>

          <div className={styles.profileField}>
            <label htmlFor="jaf-social" className={styles.fieldLabel}>
              Primary website / social
            </label>
            <input
              id="jaf-social"
              type="text"
              placeholder="Primary Website/Social"
              className={styles.inputField}
              value={websiteSocial}
              onChange={e => setWebsiteSocial(e.target.value)}
              autoComplete="url"
            />
          </div>

          <FileUploadField
            id="jaf-resume-upload"
            label={resumeRequired ? 'Upload Resume' : 'Upload Resume (optional)'}
            accept=".pdf,.doc,.docx"
            file={resumeFile}
            onChange={handleResumeChange}
            onClear={clearResumeFile}
            inputRef={resumeInputRef}
            optional={!resumeRequired}
            required={resumeRequired}
            error={resumeFileError}
          />
        </>
      ) : null}
    </div>
  );
}

JobApplicationProfileFields.propTypes = {
  showPersonalInfo: PropTypes.bool.isRequired,
  showBasicInfo: PropTypes.bool.isRequired,
  firstName: PropTypes.string.isRequired,
  setFirstName: PropTypes.func.isRequired,
  lastName: PropTypes.string.isRequired,
  setLastName: PropTypes.func.isRequired,
  applicantEmail: PropTypes.string.isRequired,
  setApplicantEmail: PropTypes.func.isRequired,
  emailInputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
  emailSuggestion: PropTypes.string,
  setEmailSuggestion: PropTypes.func.isRequired,
  fieldErrors: PropTypes.shape({}).isRequired,
  setFieldErrors: PropTypes.func.isRequired,
  handleEmailBlur: PropTypes.func.isRequired,
  applyEmailSuggestion: PropTypes.func.isRequired,
  companyPosition: PropTypes.string.isRequired,
  setCompanyPosition: PropTypes.func.isRequired,
  applicantLocation: PropTypes.string.isRequired,
  setApplicantLocation: PropTypes.func.isRequired,
  timeZone: PropTypes.string.isRequired,
  setTimeZone: PropTypes.func.isRequired,
  phone: PropTypes.string.isRequired,
  setPhone: PropTypes.func.isRequired,
  websiteSocial: PropTypes.string.isRequired,
  setWebsiteSocial: PropTypes.func.isRequired,
  resumeRequired: PropTypes.bool.isRequired,
  resumeFile: PropTypes.oneOfType([PropTypes.object, PropTypes.oneOf([null])]),
  resumeFileError: PropTypes.string,
  resumeInputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  handleResumeChange: PropTypes.func.isRequired,
  clearResumeFile: PropTypes.func.isRequired,
  FileUploadField: PropTypes.elementType.isRequired,
};

JobApplicationProfileFields.defaultProps = {
  emailSuggestion: null,
  resumeFile: null,
  resumeFileError: '',
  emailInputRef: undefined,
  resumeInputRef: undefined,
};

export default JobApplicationProfileFields;
