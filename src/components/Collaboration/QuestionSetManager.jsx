import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';
import styles from './QuestionSetManager.module.css';
import { findDuplicateQuestions, normalizeLoadedQuestions } from './jobFormQuestionUtils';

/**
 * Loads live job application forms (Collaboration /job-application questions)
 * into the builder. This is intentionally wired to job forms, not /api/templates.
 */
function QuestionSetManager({
  jobForms = [],
  selectedFormId = '',
  onLoadJobForm,
  onCreateNewForm,
  formFields,
  setFormFields,
  darkMode = false,
  showAlert,
  showConfirm,
}) {
  const [selectedId, setSelectedId] = useState(selectedFormId || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedFormId) setSelectedId(selectedFormId);
    else setSelectedId('');
  }, [selectedFormId]);

  const selectedForm =
    jobForms.find(form => String(form._id || form.id) === String(selectedId)) || null;

  const loadSelectedForm = async ({ append = false } = {}) => {
    if (!selectedForm) {
      await showAlert?.('Please select a job form to load.', {
        title: 'No form selected',
      });
      return;
    }

    if (!append && formFields.length > 0) {
      const confirmLoad = await showConfirm?.(
        `Load questions for "${selectedForm.title}"? This will replace the questions currently on screen.`,
        { title: 'Load job form', confirmLabel: 'Load form' },
      );
      if (!confirmLoad) return;
    }

    setIsLoading(true);
    try {
      const incoming = normalizeLoadedQuestions(selectedForm.questions || []);

      if (append) {
        const duplicates = findDuplicateQuestions(incoming, formFields);
        let questionsToAppend = incoming;
        if (duplicates.length > 0) {
          const confirmAdd = await showConfirm?.(
            `${duplicates.length} question(s) in this form appear similar to questions you already have. Add anyway?`,
            { title: 'Similar questions', confirmLabel: 'Add anyway' },
          );
          if (!confirmAdd) {
            questionsToAppend = incoming.filter(q => !duplicates.includes(q));
          }
        }
        setFormFields([...formFields, ...questionsToAppend]);
      } else {
        await onLoadJobForm(selectedForm);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (formFields.length === 0) return;
    const confirmClear = await showConfirm?.(
      'Clear all questions on screen? This does not delete the saved job form until you click Save Form.',
      { title: 'Clear questions', confirmLabel: 'Clear' },
    );
    if (confirmClear) setFormFields([]);
  };

  const handleCreateNew = async () => {
    if (typeof onCreateNewForm !== 'function') return;
    if (formFields.length > 0) {
      const confirmCreate = await showConfirm?.(
        'Start a new job form? Unsaved question edits on screen will be cleared.',
        { title: 'Create new form', confirmLabel: 'Continue' },
      );
      if (!confirmCreate) return;
    }
    await onCreateNewForm();
  };

  return (
    <div className={`${styles.questionSetManager} ${darkMode ? styles.darkMode : ''}`}>
      <h3>Load job form</h3>
      <p className={styles.templateRowLabel}>
        Choose a Collaboration job title to load its live application questions (same forms used on
        /job-application). Use Create New Form with the exact job title so applicants can match it.
        Edit below, then use Save Form. Templates (/api/templates) are not used on apply.
      </p>
      <div className={styles.templateActions}>
        <div className={styles.templateRow}>
          <div className={styles.loadTemplate}>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              disabled={isLoading}
              aria-label="Select a job form"
            >
              <option value="">Select a job form</option>
              {jobForms.map(form => {
                const id = String(form._id || form.id);
                return (
                  <option key={id} value={id}>
                    {form.title}
                  </option>
                );
              })}
            </select>
            <div className={styles.loadTemplateButtons}>
              <button
                id="create-job-form-button"
                type="button"
                onClick={handleCreateNew}
                className={styles.saveTemplateButton}
                disabled={isLoading || typeof onCreateNewForm !== 'function'}
              >
                Create New Form
              </button>
              <UncontrolledTooltip
                autohide={false}
                placement="top"
                target="create-job-form-button"
                trigger="hover focus"
              >
                Start a new job form. Use the exact Collaboration job title, then Save Form to POST
                /api/jobforms so it appears on /job-application.
              </UncontrolledTooltip>
              <button
                id="load-job-form-button"
                type="button"
                onClick={() => loadSelectedForm({ append: false })}
                className={styles.loadTemplateButton}
                disabled={isLoading || !selectedForm}
              >
                {isLoading ? 'Loading...' : 'Load Form'}
              </button>
              <UncontrolledTooltip
                autohide={false}
                placement="top"
                target="load-job-form-button"
                trigger="hover focus"
              >
                Load this job&apos;s live application questions into the builder.
              </UncontrolledTooltip>
              <button
                id="clear-job-form-button"
                type="button"
                onClick={handleClear}
                className={styles.clearTemplateButton}
                disabled={formFields.length === 0}
              >
                Clear Questions
              </button>
              <UncontrolledTooltip
                autohide={false}
                placement="top"
                target="clear-job-form-button"
                trigger="hover focus"
              >
                Remove questions from the editor only. Save Form to persist changes.
              </UncontrolledTooltip>
              <button
                id="append-job-form-button"
                type="button"
                onClick={() => loadSelectedForm({ append: true })}
                className={styles.appendTemplateButton}
                disabled={isLoading || !selectedForm}
              >
                {isLoading ? 'Appending...' : 'Append Questions'}
              </button>
              <UncontrolledTooltip
                autohide={false}
                placement="top"
                target="append-job-form-button"
                trigger="hover focus"
              >
                Add another job form&apos;s questions onto the current list without switching forms.
              </UncontrolledTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

QuestionSetManager.propTypes = {
  jobForms: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      title: PropTypes.string,
      questions: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  ),
  selectedFormId: PropTypes.string,
  onLoadJobForm: PropTypes.func.isRequired,
  onCreateNewForm: PropTypes.func,
  formFields: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setFormFields: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  showAlert: PropTypes.func,
  showConfirm: PropTypes.func,
};

QuestionSetManager.defaultProps = {
  jobForms: [],
  selectedFormId: '',
  onCreateNewForm: undefined,
  darkMode: false,
  showAlert: undefined,
  showConfirm: undefined,
};

export default QuestionSetManager;
