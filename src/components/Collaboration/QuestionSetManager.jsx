import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import './QuestionSetManager.css';
import QuestionEditModal from './QuestionEditModal';

function QuestionSetManager({ 
  formFields, 
  setFormFields, 
  onImportQuestions 
}) {
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [editingMode, setEditingMode] = useState('');

  const api = {
    // Get all templates
    getTemplates: async () => {
    
      const response = await axios.get(ENDPOINTS.GET_ALL_TEMPLATES);
      return response.data.templates;
    },
    
    // Create a new template
    createTemplate: async (data) => {
      const response = await axios.post(ENDPOINTS.CREATE_TEMPLATE, data);
      return response.data.template;
    },
    
    // Update an existing template
    updateTemplate: async (id, data) => {
      const response = await axios.put(ENDPOINTS.UPDATE_TEMPLATE(id), data);
      return response.data.template;
    },
    
    // Delete a template
    deleteTemplate: async (id) => {
      const response = await axios.delete(ENDPOINTS.DELETE_TEMPLATE(id));
      return response.data;
    },

    // Get template by ID
    getTemplateById: async (id) => {
      const response = await axios.get(ENDPOINTS.GET_TEMPLATE_BY_ID(id));
      return response.data.template;
    }
  };

  // Load templates from API on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await api.getTemplates();
        setTemplates(data);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
        
        // Fallback to localStorage if API fails
        try {
          const savedTemplates = localStorage.getItem('jobFormTemplates');
          if (savedTemplates) {
            setTemplates(JSON.parse(savedTemplates));
            //setError('Using locally saved templates.');
          }
        } catch (localError) {
          console.error('Failed to load local templates:', localError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);

const saveTemplate = async () => {
  if (templateName.trim() === '') {
    alert('Please enter a template name');
    return;
  }
  
  if (formFields.length === 0) {
    alert('Your form is empty. Please add questions before saving as a template.');
    return;
  }
  
  setIsLoading(true);
  setError(null);
  
  try {
    const templateExists = templates.some(t => t.name === templateName);
    
    if (templateExists) {
      const confirmOverwrite = window.confirm(`Template "${templateName}" already exists. Do you want to overwrite it?`);
      if (!confirmOverwrite) {
        setIsLoading(false);
        return;
      }
      
      // Find the existing template to get its ID
      const existingTemplate = templates.find(t => t.name === templateName);
      
      // Update the template
      const updatedTemplate = await api.updateTemplate(existingTemplate._id, {
        name: templateName,
        fields: formFields.map(field => ({
          questionText: field.questionText,
          questionType: field.questionType,
          visible: field.visible !== undefined ? field.visible : true,
          isRequired: field.required || false,
          options: field.options || [],
          placeholder: field.placeholder || ''
        }))
      });
      
      // Update local state
      setTemplates(templates.map(t => 
        t._id === updatedTemplate._id ? updatedTemplate : t
      ));
      
      alert(`Template "${templateName}" updated successfully!`);
    } else {
  
      const newTemplate = await api.createTemplate({
        name: templateName,
        fields: formFields.map(field => ({
          questionText: field.questionText || field.label,
          questionType: field.questionType || field.type,
          visible: field.visible !== undefined ? field.visible : true,
          isRequired: field.required || field.isRequired || false,
          options: field.options || [],
          placeholder: field.placeholder || ''
        }))
      });

      // Update local state
      const updatedTemplates = [...templates, newTemplate];
      setTemplates(updatedTemplates);

      // Also saved to localStorage as backup
      localStorage.setItem('jobFormTemplates', JSON.stringify(updatedTemplates));
      
      alert(`Template "${templateName}" created successfully!`);
    }
    
    setTemplateName('');
  } catch (err) {
    console.error('Failed to save template:', err);
    
    // Save to localStorage as fallback
    try {
      const templateExists = templates.some(t => t.name === templateName);
      if (templateExists) {
        const newTemplates = templates.map(t => 
          t.name === templateName ? { ...t, fields: formFields } : t
        );
        setTemplates(newTemplates);
        localStorage.setItem('jobFormTemplates', JSON.stringify(newTemplates));
      } else {
        const newTemplates = [
          ...templates,
          {
            id: Date.now(), // Add a temporary ID for local templates
            name: templateName,
            fields: formFields,
          }
        ];
        
        setTemplates(newTemplates);
        localStorage.setItem('jobFormTemplates', JSON.stringify(newTemplates));
      }
      alert(`Template "${templateName}" saved locally.`);
    } catch (localError) {
      console.error('Failed to save local template:', localError);
      alert('Failed to save template. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};

  // Load template
  const loadTemplate = async () => {
    if (selectedTemplate === '') {
      alert('Please select a template to load');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const template = templates.find(t => t.name === selectedTemplate);
      
      if (template) {
        // Confirm if user wants to replace current form fields
        if (formFields.length > 0) {
          const confirmLoad = window.confirm('This will replace your current form. Continue?');
          if (!confirmLoad) {
            setIsLoading(false);
            return;
          }
        }
        
        // Check if template has _id (server template) or not (local template)
        if (template._id) {
          // Get the full template data from the server
          const fullTemplate = await api.getTemplateById(template._id);
          onImportQuestions(fullTemplate.fields);
        } else {
          // Use the local template directly
          onImportQuestions(template.fields);
        }
        
        alert(`Template "${selectedTemplate}" loaded successfully!`);
      }
    } catch (err) {
      console.error('Failed to load template:', err);
      setError('Failed to load template. Please try again later.');
      alert('Failed to load template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add template to existing fields
  const appendTemplate = async () => {
    if (selectedTemplate === '') {
      alert('Please select a template to append');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const template = templates.find(t => t.name === selectedTemplate);
      
      if (template) {
        // Check if template has _id (server template) or not (local template)
        if (template._id) {
          // Get template fields for appending from the server
          const templateData = await api.getTemplateById(template._id);
          onImportQuestions([...formFields, ...templateData.fields]);
        } else {
          // Use the local template directly
          onImportQuestions([...formFields, ...template.fields]);
        }
        
        alert(`Template "${selectedTemplate}" appended successfully!`);
      }
    } catch (err) {
      console.error('Failed to append template:', err);
      setError('Failed to append template. Please try again later.');
      alert('Failed to append template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a template
  const deleteTemplate = async () => {
    if (selectedTemplate === '') {
      alert('Please select a template to delete');
      return;
    }
    
    const confirmDelete = window.confirm(`Are you sure you want to delete template "${selectedTemplate}"?`);
    if (!confirmDelete) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const template = templates.find(t => t.name === selectedTemplate);
      
      if (template) {
        // Check if template has _id (server template) or not (local template)
        if (template._id) {
          // Delete from server
          await api.deleteTemplate(template._id);
        }
        
        // Always remove from local state
        const filteredTemplates = templates.filter(t => t.name !== selectedTemplate);
        setTemplates(filteredTemplates);
        localStorage.setItem('jobFormTemplates', JSON.stringify(filteredTemplates));
        
        setSelectedTemplate('');
        alert(`Template "${selectedTemplate}" deleted successfully!`);
      }
    } catch (err) {
      console.error('Failed to delete template:', err);
      setError('Failed to delete template. Please try again later.');
      
      // Still delete from local state
      const filteredTemplates = templates.filter(t => t.name !== selectedTemplate);
      setTemplates(filteredTemplates);
      localStorage.setItem('jobFormTemplates', JSON.stringify(filteredTemplates));
      setSelectedTemplate('');
      alert(`Template deleted from local storage only.`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleEditFormQuestion = (question, index) => {
    // Transform the question format if needed
    const questionForEdit = {
      label: question.questionText || question.label,
      type: question.questionType || question.type,
      options: question.options || [],
      required: question.required || false,
      placeholder: question.placeholder || ''
    };
    
    setEditingQuestion(questionForEdit);
    setEditingIndex(index);
    setEditingMode('form');
    setEditModalOpen(true);
  };

  const handleSaveEditedQuestion = (editedQuestion) => {
    if (editingMode === 'form') {
     
      
      const updatedQuestion = {
        ...formFields[editingIndex],
        questionText: editedQuestion.label,
        questionType: editedQuestion.type,
        options: editedQuestion.options || [],
        required: editedQuestion.required,
        placeholder: editedQuestion.placeholder
      };
      
      const updatedFields = [...formFields];
      updatedFields[editingIndex] = updatedQuestion;
      setFormFields(updatedFields);
    } else if (editingMode === 'template') {
      
      const updatedPreviewQuestions = previewQuestions.map((q, idx) => 
        idx === editingIndex ? editedQuestion : q
      );
      setPreviewQuestions(updatedPreviewQuestions);
    }
    
    setEditModalOpen(false);
    setEditingQuestion(null);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditModalOpen(false);
    setEditingQuestion(null);
    setEditingIndex(null);
  };

  return (
    <div className="question-set-manager">
      <h3>Question Set Templates</h3>
      {error && <div className="error-message">{error}</div>}
      <div className="template-actions">
        <div className="save-template">
          <input
            type="text"
            placeholder="Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="button" 
            onClick={saveTemplate} 
            className="save-template-button"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Current set'}
          </button>
        </div>
        <div className="load-template">
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            disabled={isLoading || templates.length === 0}
          >
            <option value="">Select a template</option>
            {templates.map((template, i) => (
              <option key={template._id || i} value={template.name}>
                {template.name}
              </option>
            ))}
          </select>
          <button 
            type="button" 
            onClick={loadTemplate} 
            className="load-template-button"
            disabled={isLoading || !selectedTemplate}
          >
            {isLoading ? 'Loading...' : 'Clone with Template'}
          </button>
          <button 
            type="button" 
            onClick={appendTemplate} 
            className="append-template-button"
            disabled={isLoading || !selectedTemplate}
          >
            {isLoading ? 'Appending...' : 'Append Template'}
          </button>
          <button 
            type="button" 
            onClick={deleteTemplate} 
            className="delete-template-button"
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
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
}

QuestionSetManager.propTypes = {
  formFields: PropTypes.array.isRequired,
  setFormFields: PropTypes.func.isRequired,
  onImportQuestions: PropTypes.func.isRequired,
};

export default QuestionSetManager;