import PropTypes from 'prop-types';
import styles from './JobFormBuilder.module.css';
import QuestionSetManager from './QuestionSetManager';
import QuestionEditModal from './QuestionEditModal';
import JobFormBuilderQuestionRow from './JobFormBuilderQuestionRow';
import JobFormBuilderNewFieldSection from './JobFormBuilderNewFieldSection';
import JobFormStandardFieldsSection from './JobFormStandardFieldsSection';

/**
 * Manage-job-forms workspace for the Job Form Builder (keeps parent CC low).
 */
function JobFormBuilderWorkspace({
  jobForms,
  currentFormId,
  onLoadJobForm,
  onCreateNewForm,
  formFields,
  setFormFields,
  darkMode,
  showAlert,
  showConfirm,
  fixedFields,
  visibleStandardFields,
  onFixedFieldToggle,
  onMoveField,
  onDeleteField,
  onEditField,
  onVisibilityChange,
  newField,
  setNewField,
  newFieldErrors,
  setNewFieldErrors,
  newOption,
  setNewOption,
  onAddOption,
  onAddField,
  onOpenPreview,
  onSubmit,
  editModalOpen,
  editingQuestion,
  onSaveEditedQuestion,
  onCancelEdit,
}) {
  return (
    <div className={styles.customForm}>
      <p className={styles.jobformDesc}>
        Load or create a Collaboration job form. Default profile sections are controlled by this
        form&apos;s backend <code>fixedFields</code>; custom questions are stored in{' '}
        <code>questions</code>. Save Form writes to /api/jobforms (not /api/templates).
      </p>
      <QuestionSetManager
        jobForms={jobForms}
        selectedFormId={currentFormId ? String(currentFormId) : ''}
        onLoadJobForm={onLoadJobForm}
        onCreateNewForm={onCreateNewForm}
        formFields={formFields}
        setFormFields={setFormFields}
        darkMode={darkMode}
        showAlert={showAlert}
        showConfirm={showConfirm}
      />
      <JobFormStandardFieldsSection
        fixedFields={fixedFields}
        visibleStandardFields={visibleStandardFields}
        onFixedFieldToggle={onFixedFieldToggle}
      />
      <form>
        {formFields.map((field, index) => (
          <JobFormBuilderQuestionRow
            key={`${index}-${field.questionText}`}
            field={field}
            index={index}
            totalFields={formFields.length}
            onMove={onMoveField}
            onDelete={onDeleteField}
            onEdit={onEditField}
            onVisibilityChange={event => onVisibilityChange(event, field)}
            darkMode={darkMode}
          />
        ))}
      </form>
      <JobFormBuilderNewFieldSection
        newField={newField}
        setNewField={setNewField}
        newFieldErrors={newFieldErrors}
        setNewFieldErrors={setNewFieldErrors}
        newOption={newOption}
        setNewOption={setNewOption}
        onAddOption={onAddOption}
        onAddField={onAddField}
      />
      <div className={styles.previewSection}>
        <button type="button" className={styles.previewTextButton} onClick={onOpenPreview}>
          Preview Form
        </button>
      </div>
      <div className={styles.saveSection}>
        <button type="button" className={styles.jobSubmitButton} onClick={onSubmit}>
          Save Form
        </button>
      </div>
      {editModalOpen && editingQuestion ? (
        <QuestionEditModal
          question={editingQuestion}
          onSave={onSaveEditedQuestion}
          onCancel={onCancelEdit}
          darkMode={darkMode}
        />
      ) : null}
    </div>
  );
}

JobFormBuilderWorkspace.propTypes = {
  jobForms: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  currentFormId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onLoadJobForm: PropTypes.func.isRequired,
  onCreateNewForm: PropTypes.func.isRequired,
  formFields: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setFormFields: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  showAlert: PropTypes.func,
  showConfirm: PropTypes.func,
  fixedFields: PropTypes.shape({}).isRequired,
  visibleStandardFields: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onFixedFieldToggle: PropTypes.func.isRequired,
  onMoveField: PropTypes.func.isRequired,
  onDeleteField: PropTypes.func.isRequired,
  onEditField: PropTypes.func.isRequired,
  onVisibilityChange: PropTypes.func.isRequired,
  newField: PropTypes.shape({}).isRequired,
  setNewField: PropTypes.func.isRequired,
  newFieldErrors: PropTypes.shape({}).isRequired,
  setNewFieldErrors: PropTypes.func.isRequired,
  newOption: PropTypes.string.isRequired,
  setNewOption: PropTypes.func.isRequired,
  onAddOption: PropTypes.func.isRequired,
  onAddField: PropTypes.func.isRequired,
  onOpenPreview: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editModalOpen: PropTypes.bool.isRequired,
  editingQuestion: PropTypes.shape({}),
  onSaveEditedQuestion: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
};

JobFormBuilderWorkspace.defaultProps = {
  currentFormId: null,
  darkMode: false,
  showAlert: undefined,
  showConfirm: undefined,
  editingQuestion: null,
};

export default JobFormBuilderWorkspace;
