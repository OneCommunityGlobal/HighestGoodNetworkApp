/* eslint-disable no-alert */
/* eslint-disable no-console */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import styles from './QuestionSetManager.module.css';
import QuestionEditModal from './QuestionEditModal';

function QuestionSetManager({
  formFields,
  setFormFields,
  onImportQuestions,
  darkMode,
  templateName,
  setTemplateName,
  selectedTemplate,
  setSelectedTemplate,
}) {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const api = {
    getTemplates: async () => {
      const response = await axios.get(ENDPOINTS.GET_ALL_TEMPLATES);
      return response.data.templates;
    },
    createTemplate: async data => {
      const response = await axios.post(ENDPOINTS.CREATE_TEMPLATE, data);
      return response.data.template;
    },
    updateTemplate: async (id, data) => {
      const response = await axios.put(ENDPOINTS.UPDATE_TEMPLATE(id), data);
      return response.data.template;
    },
    deleteTemplate: async id => {
      const response = await axios.delete(ENDPOINTS.DELETE_TEMPLATE(id));
      return response.data;
    },
    getTemplateById: async id => {
      const response = await axios.get(ENDPOINTS.GET_TEMPLATE_BY_ID(id));
      return response.data.template;
    },
  };

  // --------------------------
  // LOAD TEMPLATES
  // --------------------------
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await api.getTemplates();
        setTemplates(data);
      } catch (err) {
        console.error('Failed to fetch templates:', err);

        try {
          const saved = localStorage.getItem('jobFormTemplates');
          if (saved) {
            setTemplates(JSON.parse(saved));
          }
        } catch (localErr) {
          console.error('Failed to load local templates:', localErr);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // --------------------------
  // SAVE TEMPLATE
  // --------------------------
  const saveTemplate = async () => {
    if (templateName.trim() === '') {
      alert('Please enter a template name');
      return;
    }

    if (formFields.length === 0) {
      alert('Your form is empty. Add questions first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const exists = templates.some(t => t.name === templateName);

      if (exists) {
        const confirmOverwrite = window.confirm(`Template "${templateName}" exists. Overwrite?`);

        if (!confirmOverwrite) {
          setIsLoading(false);
          return;
        }

        const existingTemplate = templates.find(t => t.name === templateName);

        const updatedTemplate = await api.updateTemplate(existingTemplate._id, {
          name: templateName,
          fields: formFields.map(field => ({
            questionText: field.questionText,
            questionType: field.questionType,
            visible: field.visible !== undefined ? field.visible : true,
            isRequired: field.required || false,
            options: field.options || [],
            placeholder: field.placeholder || '',
          })),
        });

        setTemplates(templates.map(t => (t._id === updatedTemplate._id ? updatedTemplate : t)));

        alert(`Template "${templateName}" updated.`);
      } else {
        const newTemplate = await api.createTemplate({
          name: templateName,
          fields: formFields.map(field => ({
            questionText: field.questionText || field.label,
            questionType: field.questionType || field.type,
            visible: field.visible !== undefined ? field.visible : true,
            isRequired: field.required || field.isRequired || false,
            options: field.options || [],
            placeholder: field.placeholder || '',
          })),
        });

        const updated = [...templates, newTemplate];
        setTemplates(updated);

        localStorage.setItem('jobFormTemplates', JSON.stringify(updated));

        alert(`Template "${templateName}" created.`);
      }

      setTemplateName('');
    } catch (err) {
      console.error('Failed to save template:', err);
      alert('Failed to save. Check console.');

      // fallback local save
      const exists = templates.some(t => t.name === templateName);

      if (exists) {
        const newTemplates = templates.map(t =>
          t.name === templateName ? { ...t, fields: formFields } : t,
        );
        setTemplates(newTemplates);
        localStorage.setItem('jobFormTemplates', JSON.stringify(newTemplates));
      } else {
        const newTemplates = [
          ...templates,
          {
            id: Date.now(),
            name: templateName,
            fields: formFields,
          },
        ];
        setTemplates(newTemplates);
        localStorage.setItem('jobFormTemplates', JSON.stringify(newTemplates));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------
  // LOAD TEMPLATE
  // --------------------------
  const loadTemplate = async () => {
    if (selectedTemplate === '') {
      alert('Please select a template.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const template = templates.find(t => t.name === selectedTemplate);

      if (template) {
        if (formFields.length > 0) {
          const confirmLoad = window.confirm('This replaces your current form. Continue?');
          if (!confirmLoad) {
            setIsLoading(false);
            return;
          }
        }

        if (template._id) {
          const fullTemplate = await api.getTemplateById(template._id);
          onImportQuestions(fullTemplate.fields);
        } else {
          onImportQuestions(template.fields);
        }

        alert(`Template "${selectedTemplate}" loaded.`);
      }
    } catch (err) {
      console.error('Failed to load template:', err);
      alert('Failed to load template.');
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------
  // APPEND TEMPLATE
  // --------------------------
  const appendTemplate = async () => {
    if (selectedTemplate === '') {
      alert('Select a template to append');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const template = templates.find(t => t.name === selectedTemplate);

      if (template) {
        if (template._id) {
          const templateData = await api.getTemplateById(template._id);
          onImportQuestions([...formFields, ...templateData.fields]);
        } else {
          onImportQuestions([...formFields, ...template.fields]);
        }

        alert(`Template "${selectedTemplate}" appended.`);
      }
    } catch (err) {
      console.error('Failed to append template:', err);
      alert('Append failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------
  // DELETE TEMPLATE
  // --------------------------
  const deleteTemplate = async () => {
    if (selectedTemplate === '') {
      alert('Select a template to delete');
      return;
    }

    const confirmDelete = window.confirm(`Delete template "${selectedTemplate}"?`);
    if (!confirmDelete) return;

    setIsLoading(true);
    setError(null);

    try {
      const template = templates.find(t => t.name === selectedTemplate);

      if (template) {
        if (template._id) {
          await api.deleteTemplate(template._id);
        }

        const filtered = templates.filter(t => t.name !== selectedTemplate);
        setTemplates(filtered);
        localStorage.setItem('jobFormTemplates', JSON.stringify(filtered));

        setSelectedTemplate('');
        alert(`Template "${selectedTemplate}" deleted.`);
      }
    } catch (err) {
      console.error('Failed to delete template:', err);

      const filtered = templates.filter(t => t.name !== selectedTemplate);
      setTemplates(filtered);
      localStorage.setItem('jobFormTemplates', JSON.stringify(filtered));

      setSelectedTemplate('');
      alert('Deleted locally only.');
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------
  // QUESTION EDITING
  // --------------------------
  const handleSaveEditedQuestion = editedQuestion => {
    if (editingIndex !== null) {
      const updated = [...formFields];
      updated[editingIndex] = {
        ...updated[editingIndex],
        questionText: editedQuestion.label,
        questionType: editedQuestion.type,
        options: editedQuestion.options || [],
        required: editedQuestion.required,
        placeholder: editedQuestion.placeholder,
      };

      setFormFields(updated);
    }

    setEditModalOpen(false);
    setEditingQuestion(null);
    setEditingIndex(null);
  };

  return (
    <div className={`${styles.questionSetManager} ${darkMode ? styles.darkMode : ''}`}>
      <h3>Question Set Templates</h3>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.templateActions}>
        {/* SAVE */}
        <div className={styles.saveTemplate}>
          <input
            type="text"
            placeholder="Template Name"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={saveTemplate}
            className={styles.saveTemplateButton}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Current set'}
          </button>
        </div>

        {/* LOAD / APPEND / DELETE */}
        <div className={styles.loadTemplate}>
          <select
            value={selectedTemplate}
            onChange={e => setSelectedTemplate(e.target.value)}
            disabled={isLoading || templates.length === 0}
          >
            <option value="">Select a template</option>
            {templates.map((t, i) => (
              <option key={t._id || i} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={loadTemplate}
            className={styles.loadTemplateButton}
            disabled={isLoading || !selectedTemplate}
          >
            {isLoading ? 'Loading...' : 'Clone with Template'}
          </button>

          <button
            type="button"
            onClick={appendTemplate}
            className={styles.appendTemplateButton}
            disabled={isLoading || !selectedTemplate}
          >
            {isLoading ? 'Appending...' : 'Append Template'}
          </button>

          <button
            type="button"
            onClick={deleteTemplate}
            className={styles.deleteTemplateButton}
            disabled={isLoading || !selectedTemplate}
          >
            {isLoading ? 'Deleting...' : 'Delete Template'}
          </button>
        </div>
      </div>

      {editModalOpen && editingQuestion && (
        <QuestionEditModal
          question={editingQuestion}
          onSave={handleSaveEditedQuestion}
          onCancel={() => {
            setEditModalOpen(false);
            setEditingQuestion(null);
            setEditingIndex(null);
          }}
        />
      )}
    </div>
  );
}

QuestionSetManager.propTypes = {
  formFields: PropTypes.arrayOf(
    PropTypes.shape({
      questionText: PropTypes.string,
      questionType: PropTypes.string,
      visible: PropTypes.bool,
      isRequired: PropTypes.bool,
      required: PropTypes.bool,
      options: PropTypes.arrayOf(PropTypes.string),
      placeholder: PropTypes.string,
      label: PropTypes.string,
      type: PropTypes.string,
    }),
  ).isRequired,
  setFormFields: PropTypes.func.isRequired,
  onImportQuestions: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  templateName: PropTypes.string.isRequired,
  setTemplateName: PropTypes.func.isRequired,
  selectedTemplate: PropTypes.string.isRequired,
  setSelectedTemplate: PropTypes.func.isRequired,
};

export default QuestionSetManager;
