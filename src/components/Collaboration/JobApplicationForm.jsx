import React, { useMemo, useState, useEffect } from 'react';
import './JobApplicationForm.css';

export default function JobApplicationForm({
  jobTitle = 'Job',
  jobDescription = '',
  requirements = [],
  referralToken = '',
  darkMode = false,
}) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    locationTz: '',
    monthsVolunteer: '',
    hoursPerWeek: '',
    reason: '',
    highestDegree: '',
    fullTimeYears: '',
    startDate: '',
    referral: '',
    applicantType: 'individual',
    orgName: '',
    roleSkills: '',
    agreeOpenSource: '',
    expertQ1: '',
    availabilityWeek: '',
    expertQ2: '',
    resume: null,
    additionalDocs: null,
    roleQ1: '',
    roleQ2: '',
    roleQ3: '',
    roleQ4: '',
    anythingElse: '',
    termsAccepted: false,
  });
  const [errors, setErrors] = useState({});
  const [requirementStatus, setRequirementStatus] = useState({});

  const degreeOptions = useMemo(
    () => ['High School / GED', 'Associate', "Bachelor's", "Master's", 'Ph.D.', 'Other'],
    [],
  );
  const resumeAcceptMimes = useMemo(() => ['application/pdf', 'image/jpeg', 'image/jpg'], []);

  // Check requirement satisfaction (placeholder - can be enhanced with actual user data)
  useEffect(() => {
    if (requirements && requirements.length > 0) {
      const status = {};
      requirements.forEach(req => {
        // TODO: Replace with actual logic to check if user satisfies requirement
        // For now, all are unchecked (user view - requirements not satisfied)
        status[req] = false;
      });
      setRequirementStatus(status);
    }
  }, [requirements]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.hoursPerWeek) e.hoursPerWeek = 'Please specify weekly hours';
    if (!form.highestDegree) e.highestDegree = 'Select your highest degree';
    if (form.fullTimeYears === '' || form.fullTimeYears === null)
      e.fullTimeYears = 'Enter years of full-time experience';
    if (!form.agreeOpenSource) e.agreeOpenSource = 'Please choose yes/no';
    if (!form.resume) e.resume = 'Resume is required (PDF or JPG)';
    if (form.resume && !resumeAcceptMimes.includes(form.resume.type))
      e.resume = 'Only PDF or JPG files allowed';
    if (!form.termsAccepted) e.termsAccepted = 'You must agree to continue';
    setErrors(e);
    return e;
  };

  const submit = ev => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) return;
    console.log('Form OK →', form);
    alert('Application validated (mock submit).');
  };

  return (
    <main className={`ja-wrap ${darkMode ? 'bg-oxford-blue text-light' : ''}`}>
      <header className="ja-header">
        <h1 className="ja-title" style={{ color: darkMode ? '#ffffff' : undefined }}>
          Job Application – {jobTitle}
        </h1>
        {jobDescription && (
          <p className="ja-desc" style={{ color: darkMode ? '#b0b7c3' : undefined }}>
            {jobDescription}
          </p>
        )}
      </header>

      <form
        className={`ja-form ${darkMode ? 'bg-yinmn-blue boxStyleDark' : ''}`}
        onSubmit={submit}
        noValidate
      >
        {/* Requirements Section */}
        {requirements && requirements.length > 0 && (
          <div className="ja-requirements-section">
            <h3
              className="ja-requirements-title"
              style={{ color: darkMode ? '#ffffff' : undefined }}
            >
              Requirements:
            </h3>
            <div className="ja-requirements-list">
              {requirements.map((requirement, index) => (
                <div key={index} className="ja-requirement-item">
                  <label className="ja-requirement-checkbox">
                    <input
                      type="checkbox"
                      checked={requirementStatus[requirement] || false}
                      disabled
                      readOnly
                      className="ja-requirement-checkbox-input"
                    />
                    <span
                      className={`ja-requirement-checkbox-custom ${
                        requirementStatus[requirement] ? 'checked' : ''
                      }`}
                    >
                      {requirementStatus[requirement] && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span style={{ color: darkMode ? '#ffffff' : undefined }}>{requirement}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="ja-row-2">
          <Field
            id="firstName"
            label="First Name"
            required
            value={form.firstName}
            onChange={v => update('firstName', v)}
            error={errors.firstName}
            darkMode={darkMode}
          />
          <Field
            id="lastName"
            label="Last Name"
            required
            value={form.lastName}
            onChange={v => update('lastName', v)}
            error={errors.lastName}
            darkMode={darkMode}
          />
        </div>

        <Field
          id="locationTz"
          label="Location and Time Zone"
          value={form.locationTz}
          onChange={v => update('locationTz', v)}
          darkMode={darkMode}
        />

        <Field
          id="monthsVolunteer"
          type="number"
          min="0"
          label="How long are you willing to volunteer for us? (Enter your answer in months)"
          value={form.monthsVolunteer}
          onChange={v => update('monthsVolunteer', v)}
          darkMode={darkMode}
        />

        <Field
          id="hoursPerWeek"
          type="number"
          min="0"
          required
          label="How many hours in a week can you give to One Community?"
          value={form.hoursPerWeek}
          onChange={v => update('hoursPerWeek', v)}
          error={errors.hoursPerWeek}
          darkMode={darkMode}
        />

        <TextArea
          id="reason"
          label="What is your reason for volunteering?"
          value={form.reason}
          onChange={v => update('reason', v)}
          darkMode={darkMode}
        />

        <Select
          id="highestDegree"
          required
          label="What is the Highest degree you have attained or are in the process of attaining?"
          options={degreeOptions}
          value={form.highestDegree}
          onChange={v => update('highestDegree', v)}
          placeholder="Value"
          error={errors.highestDegree}
          darkMode={darkMode}
        />

        <Field
          id="fullTimeYears"
          type="number"
          min="0"
          required
          label="How Many Years of FULL TIME experience do you have?"
          value={form.fullTimeYears}
          onChange={v => update('fullTimeYears', v)}
          error={errors.fullTimeYears}
          darkMode={darkMode}
        />

        <Field
          id="startDate"
          type="date"
          label="When can you start working?"
          value={form.startDate}
          onChange={v => update('startDate', v)}
          darkMode={darkMode}
        />

        <Field
          id="referral"
          label="How did you find us?"
          value={form.referral}
          onChange={v => update('referral', v)}
          darkMode={darkMode}
        />

        <fieldset className="ja-fieldset">
          <legend style={{ color: darkMode ? '#ffffff' : undefined }}>
            Are you applying as an individual or an organization?
          </legend>
          <div className="ja-radio-row">
            <Radio
              name="applicantType"
              value="individual"
              label="Individual"
              checked={form.applicantType === 'individual'}
              onChange={() => update('applicantType', 'individual')}
              darkMode={darkMode}
            />
            <Radio
              name="applicantType"
              value="organization"
              label="Organization"
              checked={form.applicantType === 'organization'}
              onChange={() => update('applicantType', 'organization')}
              darkMode={darkMode}
            />
          </div>
          {form.applicantType === 'organization' && (
            <Field
              id="orgName"
              label="If an organization, please name it."
              value={form.orgName}
              onChange={v => update('orgName', v)}
              darkMode={darkMode}
            />
          )}
        </fieldset>

        <TextArea
          id="roleSkills"
          label="List skills/experience you think you have regarding the role you are applying for"
          value={form.roleSkills}
          onChange={v => update('roleSkills', v)}
          darkMode={darkMode}
        />

        <fieldset className="ja-fieldset">
          <legend style={{ color: darkMode ? '#ffffff' : undefined }}>
            Do you understand and agree that everything you contribute to One Community will be used
            as part of our open source goals?<span className="req">*</span>
          </legend>
          <div className="ja-radio-row">
            <Radio
              name="agreeOpenSource"
              value="yes"
              label="Yes"
              checked={form.agreeOpenSource === 'yes'}
              onChange={() => update('agreeOpenSource', 'yes')}
              darkMode={darkMode}
            />
            <Radio
              name="agreeOpenSource"
              value="no"
              label="No"
              checked={form.agreeOpenSource === 'no'}
              onChange={() => update('agreeOpenSource', 'no')}
              darkMode={darkMode}
            />
          </div>
          {errors.agreeOpenSource && <div className="ja-error">{errors.agreeOpenSource}</div>}
        </fieldset>

        <Field
          id="expertQ1"
          label="If there were one question we should ask you as an expert in your field, what would that be?"
          value={form.expertQ1}
          onChange={v => update('expertQ1', v)}
          darkMode={darkMode}
        />

        <TextArea
          id="availabilityWeek"
          label="What is your availability (remember to include your timezone) over the next week for a video interview?"
          value={form.availabilityWeek}
          onChange={v => update('availabilityWeek', v)}
          darkMode={darkMode}
        />

        <Field
          id="expertQ2"
          label="If there were one question we should ask you as an expert in your field, what question would that be?"
          value={form.expertQ2}
          onChange={v => update('expertQ2', v)}
          darkMode={darkMode}
        />

        <FileField
          id="resume"
          required
          label="If you have one, please attach your Résumé, CV, Brochure, etc., in PDF or JPG format."
          accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
          onChange={file => update('resume', file)}
          error={errors.resume}
          darkMode={darkMode}
        />

        <FileField
          id="additionalDocs"
          label="If needed, upload any additional documents"
          onChange={file => update('additionalDocs', file)}
          darkMode={darkMode}
        />

        <Field
          id="roleQ1"
          label="Role Specific Question #1"
          value={form.roleQ1}
          onChange={v => update('roleQ1', v)}
          darkMode={darkMode}
        />
        <Field
          id="roleQ2"
          label="Role Specific Question #2"
          value={form.roleQ2}
          onChange={v => update('roleQ2', v)}
          darkMode={darkMode}
        />
        <Field
          id="roleQ3"
          label="Role Specific Question #3"
          value={form.roleQ3}
          onChange={v => update('roleQ3', v)}
          darkMode={darkMode}
        />
        <Field
          id="roleQ4"
          label="Role Specific Question #4"
          value={form.roleQ4}
          onChange={v => update('roleQ4', v)}
          darkMode={darkMode}
        />

        <TextArea
          id="anythingElse"
          label="Anything else you would like us to know?"
          value={form.anythingElse}
          onChange={v => update('anythingElse', v)}
          darkMode={darkMode}
        />

        <div className={`ja-consent ${darkMode ? 'bg-space-cadet boxStyleDark' : ''}`}>
          <label className="ja-checkbox">
            <input
              type="checkbox"
              checked={form.termsAccepted}
              onChange={e => update('termsAccepted', e.target.checked)}
            />
            <span style={{ color: darkMode ? '#ffffff' : undefined }}>
              I agree to the Terms and Conditions (and Captcha)
            </span>
          </label>
          {errors.termsAccepted && <div className="ja-error">{errors.termsAccepted}</div>}
        </div>

        <div className="ja-actions">
          <button type="submit" className="btn-primary">
            Submit your Application
          </button>
        </div>
      </form>
    </main>
  );
}

/* Helper functions */
function Field({
  id,
  label,
  type = 'text',
  required = false,
  error,
  onChange,
  value,
  min,
  darkMode,
}) {
  return (
    <div className="ja-field">
      <label htmlFor={id} style={{ color: darkMode ? '#ffffff' : undefined }}>
        {label}
        {required && <span className="req">*</span>}
      </label>
      <input
        id={id}
        type={type}
        min={min}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={darkMode ? 'bg-space-cadet text-light dark-mode-placeholder' : ''}
        style={{
          backgroundColor: darkMode ? '#1C2541' : undefined,
          color: darkMode ? '#ffffff' : undefined,
          borderColor: darkMode ? '#4a5a6b' : undefined,
        }}
      />
      {error && <div className="ja-error">{error}</div>}
    </div>
  );
}

function TextArea({ id, label, rows = 3, value, onChange, darkMode }) {
  return (
    <div className="ja-field">
      <label htmlFor={id} style={{ color: darkMode ? '#ffffff' : undefined }}>
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={darkMode ? 'bg-space-cadet text-light dark-mode-placeholder' : ''}
        style={{
          backgroundColor: darkMode ? '#1C2541' : undefined,
          color: darkMode ? '#ffffff' : undefined,
          borderColor: darkMode ? '#4a5a6b' : undefined,
        }}
      />
    </div>
  );
}

function Select({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select',
  required,
  error,
  darkMode,
}) {
  return (
    <div className="ja-field">
      <label htmlFor={id} style={{ color: darkMode ? '#ffffff' : undefined }}>
        {label}
        {required && <span className="req">*</span>}
      </label>
      <select
        id={id}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={darkMode ? 'bg-space-cadet text-light' : ''}
        style={{
          backgroundColor: darkMode ? '#1C2541' : undefined,
          color: darkMode ? '#ffffff' : undefined,
          borderColor: darkMode ? '#4a5a6b' : undefined,
        }}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <div className="ja-error">{error}</div>}
    </div>
  );
}

function Radio({ name, value, label, checked, onChange, darkMode }) {
  return (
    <label className="ja-radio" style={{ color: darkMode ? '#ffffff' : undefined }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function FileField({ id, label, required, accept, onChange, error, darkMode }) {
  return (
    <div className="ja-field">
      <label htmlFor={id} style={{ color: darkMode ? '#ffffff' : undefined }}>
        {label}
        {required && <span className="req">*</span>}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={e => onChange(e.target.files?.[0] || null)}
        className={darkMode ? 'bg-space-cadet text-light' : ''}
        style={{
          backgroundColor: darkMode ? '#1C2541' : undefined,
          color: darkMode ? '#ffffff' : undefined,
          borderColor: darkMode ? '#4a5a6b' : undefined,
        }}
      />
      {error && <div className="ja-error">{error}</div>}
    </div>
  );
}
