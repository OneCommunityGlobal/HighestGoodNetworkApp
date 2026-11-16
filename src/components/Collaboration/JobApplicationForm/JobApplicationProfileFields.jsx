import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import styles from './JobApplicationForm.module.css';

function clearFieldError(setFieldErrors, key) {
  setFieldErrors(prev => {
    if (!prev[key]) return prev;
    const next = { ...prev };
    delete next[key];
    return next;
  });
}

function FieldErrorMessage({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className={styles.fieldError} role="alert">
      {message}
    </p>
  );
}

FieldErrorMessage.propTypes = {
  id: PropTypes.string,
  message: PropTypes.string,
};

FieldErrorMessage.defaultProps = {
  id: undefined,
  message: '',
};

function PersonalInfoFields({
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
}) {
  const emailDescribedBy =
    [
      fieldErrors.applicantEmail ? 'jaf-applicant-email-error' : null,
      emailSuggestion ? 'jaf-applicant-email-suggestion' : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
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
          className={`${styles.inputField} ${fieldErrors.firstName ? styles.inputFieldError : ''}`}
          value={firstName}
          onChange={e => {
            setFirstName(e.target.value);
            clearFieldError(setFieldErrors, 'firstName');
          }}
          minLength={2}
          maxLength={100}
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.firstName)}
          autoComplete="given-name"
        />
        <FieldErrorMessage message={fieldErrors.firstName} />
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
          className={`${styles.inputField} ${fieldErrors.lastName ? styles.inputFieldError : ''}`}
          value={lastName}
          onChange={e => {
            setLastName(e.target.value);
            clearFieldError(setFieldErrors, 'lastName');
          }}
          minLength={2}
          maxLength={100}
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.lastName)}
          autoComplete="family-name"
        />
        <FieldErrorMessage message={fieldErrors.lastName} />
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
            clearFieldError(setFieldErrors, 'applicantEmail');
          }}
          onBlur={handleEmailBlur}
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.applicantEmail)}
          aria-describedby={emailDescribedBy}
          autoComplete="email"
        />
        <FieldErrorMessage id="jaf-applicant-email-error" message={fieldErrors.applicantEmail} />
        {emailSuggestion ? (
          <p id="jaf-applicant-email-suggestion" className={styles.fieldHint} aria-live="polite">
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
        ) : null}
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
  );
}

PersonalInfoFields.propTypes = {
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
};

PersonalInfoFields.defaultProps = {
  emailSuggestion: null,
  emailInputRef: undefined,
};

function BasicInfoFields({
  applicantLocation,
  setApplicantLocation,
  timeZone,
  setTimeZone,
  phone,
  setPhone,
  websiteSocial,
  setWebsiteSocial,
  fieldErrors,
  setFieldErrors,
  resumeRequired,
  resumeFile,
  resumeFileError,
  resumeInputRef,
  handleResumeChange,
  clearResumeFile,
  FileUploadField,
}) {
  return (
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
          className={`${styles.inputField} ${fieldErrors.location ? styles.inputFieldError : ''}`}
          value={applicantLocation}
          onChange={e => {
            setApplicantLocation(e.target.value);
            clearFieldError(setFieldErrors, 'location');
          }}
          maxLength={100}
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.location)}
          autoComplete="address-level2"
        />
        <FieldErrorMessage message={fieldErrors.location} />
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
          className={`${styles.inputField} ${fieldErrors.timeZone ? styles.inputFieldError : ''}`}
          value={timeZone}
          onChange={e => {
            setTimeZone(e.target.value);
            clearFieldError(setFieldErrors, 'timeZone');
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
        <FieldErrorMessage message={fieldErrors.timeZone} />
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
            clearFieldError(setFieldErrors, 'phone');
          }}
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.phone)}
          autoComplete="tel"
        />
        <FieldErrorMessage message={fieldErrors.phone} />
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
  );
}

BasicInfoFields.propTypes = {
  applicantLocation: PropTypes.string.isRequired,
  setApplicantLocation: PropTypes.func.isRequired,
  timeZone: PropTypes.string.isRequired,
  setTimeZone: PropTypes.func.isRequired,
  phone: PropTypes.string.isRequired,
  setPhone: PropTypes.func.isRequired,
  websiteSocial: PropTypes.string.isRequired,
  setWebsiteSocial: PropTypes.func.isRequired,
  fieldErrors: PropTypes.shape({}).isRequired,
  setFieldErrors: PropTypes.func.isRequired,
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

BasicInfoFields.defaultProps = {
  resumeFile: null,
  resumeFileError: '',
  resumeInputRef: undefined,
};

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
        <PersonalInfoFields
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          applicantEmail={applicantEmail}
          setApplicantEmail={setApplicantEmail}
          emailInputRef={emailInputRef}
          emailSuggestion={emailSuggestion}
          setEmailSuggestion={setEmailSuggestion}
          fieldErrors={fieldErrors}
          setFieldErrors={setFieldErrors}
          handleEmailBlur={handleEmailBlur}
          applyEmailSuggestion={applyEmailSuggestion}
          companyPosition={companyPosition}
          setCompanyPosition={setCompanyPosition}
        />
      ) : null}
      {showBasicInfo ? (
        <BasicInfoFields
          applicantLocation={applicantLocation}
          setApplicantLocation={setApplicantLocation}
          timeZone={timeZone}
          setTimeZone={setTimeZone}
          phone={phone}
          setPhone={setPhone}
          websiteSocial={websiteSocial}
          setWebsiteSocial={setWebsiteSocial}
          fieldErrors={fieldErrors}
          setFieldErrors={setFieldErrors}
          resumeRequired={resumeRequired}
          resumeFile={resumeFile}
          resumeFileError={resumeFileError}
          resumeInputRef={resumeInputRef}
          handleResumeChange={handleResumeChange}
          clearResumeFile={clearResumeFile}
          FileUploadField={FileUploadField}
        />
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
