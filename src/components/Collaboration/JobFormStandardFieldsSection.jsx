import PropTypes from 'prop-types';
import styles from './JobFormBuilder.module.css';
import StandardApplicantFieldControl from './StandardApplicantFieldControl';
import { FIXED_FIELD_GROUP_OPTIONS } from './jobFormQuestionUtils';

function JobFormStandardFieldsSection({ fixedFields, visibleStandardFields, onFixedFieldToggle }) {
  return (
    <div className={styles.standardApplicantSection}>
      <p className={styles.standardApplicantNote}>
        Default profile sections are stored on the job form (<code>fixedFields</code>). Toggle which
        sections applicants see, then Save Form. Custom questions below come from{' '}
        <code>questions</code>. The &quot;I agree to terms and conditions&quot; checkbox on
        /job-application is frontend-only (not saved to the backend or this form).
      </p>
      <div className={styles.fixedFieldsToggles}>
        {FIXED_FIELD_GROUP_OPTIONS.map(group => {
          const inputId = `jfb-fixed-${group.key}`;
          return (
            <div key={group.key} className={styles.fixedFieldsToggle}>
              <input
                id={inputId}
                type="checkbox"
                checked={Boolean(fixedFields[group.key])}
                onChange={e => onFixedFieldToggle(group.key, e.target.checked)}
              />
              <label htmlFor={inputId}>
                {group.label}
                <span className={styles.fixedFieldsToggleHint}>{group.description}</span>
              </label>
            </div>
          );
        })}
      </div>
      {visibleStandardFields.length === 0 ? (
        <p className={styles.standardApplicantNote}>
          No default profile fields enabled. Applicants will only see custom questions below.
        </p>
      ) : (
        <div className={styles.standardApplicantGrid}>
          {visibleStandardFields.map(field => (
            <div key={field.label} className={styles.standardApplicantField}>
              <label className={`${styles.fieldLabel} ${styles.jbformLabel}`}>
                {field.label}
                {field.required ? (
                  <span className={styles.requiredMark} aria-hidden="true">
                    {' '}
                    *
                  </span>
                ) : null}
              </label>
              <StandardApplicantFieldControl
                field={field}
                className={`${styles.jobformInput} ${styles.standardApplicantInput}`}
              />
            </div>
          ))}
        </div>
      )}
      <div className={styles.frontendOnlyTermsPreview} aria-hidden="true">
        <label className={styles.frontendOnlyTermsLabel}>
          <input type="checkbox" disabled tabIndex={-1} />
          <span>
            I agree to terms and conditions{' '}
            <span className={styles.requiredMark} aria-hidden="true">
              *
            </span>
          </span>
        </label>
        <p className={styles.fixedFieldsToggleHint}>
          Frontend-only on /job-application. Not stored on this job form or in the API response.
        </p>
      </div>
    </div>
  );
}

JobFormStandardFieldsSection.propTypes = {
  fixedFields: PropTypes.shape({}).isRequired,
  visibleStandardFields: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      required: PropTypes.bool,
    }),
  ).isRequired,
  onFixedFieldToggle: PropTypes.func.isRequired,
};

export default JobFormStandardFieldsSection;
