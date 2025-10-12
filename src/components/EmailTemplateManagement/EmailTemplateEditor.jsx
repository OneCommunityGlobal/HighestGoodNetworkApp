import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ListGroup,
  ListGroupItem,
  Badge,
  Spinner,
} from 'reactstrap';
import {
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
  FaEye,
  FaCode,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
} from 'react-icons/fa';
import { Editor } from '@tinymce/tinymce-react';
import {
  createEmailTemplate,
  updateEmailTemplate,
  fetchEmailTemplate,
  clearEmailTemplateError,
  clearCurrentTemplate,
} from '../../actions/emailTemplateActions';
import './EmailTemplateEditor.css';

const EmailTemplateEditor = ({
  template,
  loading,
  error,
  createEmailTemplate,
  updateEmailTemplate,
  fetchEmailTemplate,
  clearEmailTemplateError,
  clearCurrentTemplate,
  onClose,
  onSave,
  templateId = null, // For editing existing templates
}) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_content: '',
    variables: [],
  });

  const [showVariableModal, setShowVariableModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showTypeSelectionModal, setShowTypeSelectionModal] = useState(false);
  const [extractedVariables, setExtractedVariables] = useState([]);
  const [variableError, setVariableError] = useState('');
  const [newVariable, setNewVariable] = useState({
    name: '',
    label: '',
    type: 'text',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState(null); // 'saving', 'saved', 'error'

  // Complete state reset function
  const resetAllStates = () => {
    setFormData({
      name: '',
      subject: '',
      html_content: '',
      variables: [],
    });
    setShowVariableModal(false);
    setShowPreviewModal(false);
    setShowTypeSelectionModal(false);
    setExtractedVariables([]);
    setVariableError('');
    setNewVariable({
      name: '',
      label: '',
      type: 'text',
    });
    setValidationErrors({});
    setSaving(false);
    setShowSuccessMessage(false);
    setAutoSaveStatus(null);
  };

  // Clear Redux state (only when exiting)
  const clearReduxState = () => {
    clearCurrentTemplate();
  };

  // Reset form data when templateId changes
  useEffect(() => {
    if (templateId) {
      // Clear all states first
      resetAllStates();
      // Fetch the template
      fetchEmailTemplate(templateId);
    } else {
      // If no templateId, reset to create mode
      resetAllStates();
    }
  }, [templateId]); // Remove fetchEmailTemplate from dependencies to prevent infinite loops

  // Set form data when template is loaded
  useEffect(() => {
    if (template && template._id === templateId) {
      setFormData({
        name: template.name || '',
        subject: template.subject || '',
        html_content: template.html_content || '',
        variables: template.variables || [],
      });
    }
  }, [template, templateId]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearEmailTemplateError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearEmailTemplateError]);

  // Cleanup effect when component unmounts or when exiting template editor
  useEffect(() => {
    return () => {
      // Clear everything when exiting template editor
      resetAllStates();
      clearReduxState();
    };
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Extract variables from HTML content and subject
  const extractVariablesFromContent = (htmlContent, subject) => {
    const allContent = `${htmlContent || ''} ${subject || ''}`;
    if (!allContent.trim()) return [];

    // Find all {{variableName}} patterns in the content
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = [];
    let match;

    while ((match = variableRegex.exec(allContent)) !== null) {
      const variableName = match[1].trim();
      if (variableName && !matches.find(m => m.name === variableName)) {
        matches.push({
          name: variableName,
          label:
            variableName.charAt(0).toUpperCase() + variableName.slice(1).replace(/([A-Z])/g, ' $1'),
          type: 'text',
        });
      }
    }

    return matches;
  };

  // Auto-populate variables from HTML content and subject
  const handleAutoPopulateVariables = () => {
    const extractedVars = extractVariablesFromContent(formData.html_content, formData.subject);

    if (extractedVars.length === 0) {
      // eslint-disable-next-line no-alert
      alert(
        'No variables found in the content or subject. Make sure to use {{variableName}} format.',
      );
      return;
    }

    // Filter out variables that already exist
    const existingVariableNames = formData.variables.map(v => v.name);
    const newVariables = extractedVars.filter(v => !existingVariableNames.includes(v.name));

    if (newVariables.length === 0) {
      // eslint-disable-next-line no-alert
      alert('All variables from the content and subject are already defined.');
      return;
    }

    // Set extracted variables and show type selection modal
    setExtractedVariables(newVariables);
    setShowTypeSelectionModal(true);
  };

  // Handle type selection for extracted variables
  const handleTypeSelection = (variableIndex, type) => {
    setExtractedVariables(prev =>
      prev.map((variable, index) => (index === variableIndex ? { ...variable, type } : variable)),
    );
  };

  // Confirm and add variables with selected types
  const handleConfirmTypeSelection = () => {
    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, ...extractedVariables],
    }));

    setShowTypeSelectionModal(false);
    setExtractedVariables([]);

    // eslint-disable-next-line no-alert
    alert(
      `Added ${extractedVariables.length} new variable(s): ${extractedVariables
        .map(v => v.name)
        .join(', ')}`,
    );
  };

  // Cancel type selection
  const handleCancelTypeSelection = () => {
    setShowTypeSelectionModal(false);
    setExtractedVariables([]);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Template name is required';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }

    if (!formData.html_content.trim()) {
      errors.html_content = 'HTML content is required';
    }

    // Validate variables
    formData.variables.forEach((variable, index) => {
      if (!variable.name.trim()) {
        errors[`variable_${index}_name`] = 'Variable name is required';
      }
      if (!variable.label.trim()) {
        errors[`variable_${index}_label`] = 'Variable label is required';
      }
    });

    // Check if all variables used in content and subject are defined
    const allContent = `${formData.html_content || ''} ${formData.subject || ''}`;
    const usedVariables = [];
    const variableRegex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = variableRegex.exec(allContent)) !== null) {
      const variableName = match[1].trim();
      if (variableName && !usedVariables.includes(variableName)) {
        usedVariables.push(variableName);
      }
    }

    // Check if all used variables are defined
    const definedVariableNames = formData.variables.map(v => v.name);
    const undefinedVariables = usedVariables.filter(v => !definedVariableNames.includes(v));

    if (undefinedVariables.length > 0) {
      errors.undefined_variables = `The following variables are used but not defined: ${undefinedVariables.join(
        ', ',
      )}. Please define them or remove them from the content.`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setAutoSaveStatus('saving');

    try {
      let result;
      if (templateId) {
        result = await updateEmailTemplate(templateId, formData);
      } else {
        result = await createEmailTemplate(formData);
      }

      if (result.success) {
        setShowSuccessMessage(true);
        setAutoSaveStatus('saved');
        setTimeout(() => {
          setShowSuccessMessage(false);
          setAutoSaveStatus(null);
        }, 3000);
      }

      if (onSave) {
        onSave(result);
      }
    } catch (error) {
      // Error is handled by Redux action
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddVariable = () => {
    // Clear any previous errors
    setVariableError('');

    if (!newVariable.name.trim() || !newVariable.label.trim()) {
      setVariableError('Variable name and label are required');
      return;
    }

    // Check if variable name already exists
    if (formData.variables.some(v => v.name === newVariable.name)) {
      setVariableError('A variable with this name already exists');
      return;
    }

    // Validate variable name format (alphanumeric and underscores only)
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(newVariable.name)) {
      setVariableError(
        'Variable name must start with a letter and contain only letters, numbers, and underscores',
      );
      return;
    }

    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, { ...newVariable }],
    }));

    setNewVariable({
      name: '',
      label: '',
      type: 'text',
    });

    setShowVariableModal(false);
  };

  const handleRemoveVariable = index => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  };

  const handleOpenVariableModal = () => {
    setVariableError('');
    setShowVariableModal(true);
  };

  const insertVariableIntoContent = variableName => {
    const variableTag = `{{${variableName}}}`;
    const currentContent = formData.html_content;
    const newContent = currentContent + variableTag;
    handleInputChange('html_content', newContent);
  };

  const getPreviewContent = () => {
    let content = formData.html_content;
    formData.variables.forEach(variable => {
      const placeholder = `[${variable.label}]`;
      content = content.replace(new RegExp(`{{${variable.name}}}`, 'g'), placeholder);
    });
    return content;
  };

  if (loading && templateId) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading template...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <div className="email-template-editor">
      {/* Header */}
      <div className="editor-header">
        <div className="d-flex justify-content-between align-items-center">
          <h2>{templateId ? 'Edit Email Template' : 'Create Email Template'}</h2>
          <div className="d-flex align-items-center" style={{ gap: '12px' }}>
            {/* Auto-save status indicator */}
            {autoSaveStatus && (
              <div className="auto-save-status">
                {autoSaveStatus === 'saving' && (
                  <small className="text-muted d-flex align-items-center">
                    <FaSpinner className="me-1 fa-spin" />
                    Saving...
                  </small>
                )}
                {autoSaveStatus === 'saved' && (
                  <small className="text-success d-flex align-items-center">
                    <FaCheckCircle className="me-1" />
                    Saved
                  </small>
                )}
                {autoSaveStatus === 'error' && (
                  <small className="text-danger d-flex align-items-center">
                    <FaExclamationTriangle className="me-1" />
                    Save failed
                  </small>
                )}
              </div>
            )}

            <Button
              color="outline-secondary"
              onClick={() => setShowPreviewModal(true)}
              disabled={!formData.html_content}
            >
              <FaEye className="me-1" />
              Preview
            </Button>
            <Button color="primary" onClick={handleSave} disabled={saving}>
              {saving ? <Spinner size="sm" className="me-1" /> : <FaSave className="me-1" />}
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              color="secondary"
              onClick={() => {
                // Clear everything when exiting template editor
                resetAllStates();
                clearReduxState();
                if (onClose) {
                  onClose();
                }
              }}
            >
              <FaTimes className="me-1" />
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessMessage && (
        <Alert color="success" className="d-flex align-items-center">
          <FaCheckCircle className="me-2" />
          <div>
            <strong>Template saved successfully!</strong>
            <br />
            <small>Your changes have been saved.</small>
          </div>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          color="danger"
          toggle={clearEmailTemplateError}
          className="d-flex align-items-center"
        >
          <FaExclamationTriangle className="me-2" />
          <div>
            <strong>Error saving template</strong>
            <br />
            <small>{error}</small>
          </div>
        </Alert>
      )}

      {/* Main Content */}
      <Card className="form-card">
        <CardBody>
          <Row className="g-4">
            {/* Template Form */}
            <Col lg={8} className="ps-0">
              <Form>
                {/* Template Name */}
                <FormGroup>
                  <Label>Template Name *</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    invalid={!!validationErrors.name}
                    placeholder="Enter template name"
                  />
                  {validationErrors.name && (
                    <div className="invalid-feedback d-block">{validationErrors.name}</div>
                  )}
                </FormGroup>

                {/* Subject */}
                <FormGroup>
                  <Label>Subject *</Label>
                  <Input
                    type="text"
                    value={formData.subject}
                    onChange={e => handleInputChange('subject', e.target.value)}
                    invalid={!!validationErrors.subject}
                    placeholder="Enter email subject"
                  />
                  {validationErrors.subject && (
                    <div className="invalid-feedback d-block">{validationErrors.subject}</div>
                  )}
                </FormGroup>

                {/* HTML Content */}
                <FormGroup className="editor-container">
                  <Label>HTML Content *</Label>
                  <Editor
                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                    value={formData.html_content}
                    onEditorChange={content => handleInputChange('html_content', content)}
                    init={{
                      license_key: 'gpl',
                      height: 600,
                      menubar: false,
                      placeholder: 'Enter your email content here...',
                      plugins: [
                        'advlist',
                        'autolink',
                        'lists',
                        'link',
                        'image',
                        'charmap',
                        'preview',
                        'anchor',
                        'searchreplace',
                        'visualblocks',
                        'code',
                        'fullscreen',
                        'insertdatetime',
                        'media',
                        'table',
                        'help',
                        'wordcount',
                        'fontsize',
                        'lineheight',
                      ],
                      toolbar: [
                        'undo redo | blocks fontsize lineheight | bold italic underline strikethrough | forecolor backcolor',
                        'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image table',
                        'code preview fullscreen | searchreplace | charmap emoticons | help',
                      ],
                      branding: false,
                      content_style: `body, p, div, span, * { 
                        cursor: text !important; 
                        font-family: Arial, Helvetica, sans-serif; 
                        font-size: 12pt; 
                        line-height: 1.5; 
                      }`,
                      font_size: '12pt',
                      setup: function(editor) {
                        editor.on('init', function() {
                          editor.getBody().style.fontFamily = 'Arial, Helvetica, sans-serif';
                          if (!editor.getBody().style.fontSize) {
                            editor.getBody().style.fontSize = '12pt';
                          }
                        });
                      },
                      block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3',
                      fontsize_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt',
                      lineheight_formats: '1 1.2 1.4 1.6 1.8 2',
                    }}
                  />
                  {validationErrors.html_content && (
                    <div className="text-danger mt-1">{validationErrors.html_content}</div>
                  )}
                  {validationErrors.undefined_variables && (
                    <div className="text-danger mt-2 p-2 bg-light rounded">
                      <strong>⚠️ Undefined Variables:</strong>
                      <br />
                      {validationErrors.undefined_variables}
                    </div>
                  )}
                </FormGroup>
              </Form>
            </Col>

            {/* Variables Panel */}
            <Col lg={4} className="pe-0">
              <div className="variables-section">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>
                    <FaCode className="me-2" />
                    Variables
                  </h5>
                  <div className="d-flex gap-2">
                    <Button
                      color="outline-success"
                      size="sm"
                      onClick={handleAutoPopulateVariables}
                      disabled={!formData.html_content.trim()}
                      title="Extract variables from HTML content and subject"
                    >
                      <FaCode className="me-1" />
                      Auto Extract from Content & Subject
                    </Button>
                    <Button color="outline-primary" size="sm" onClick={handleOpenVariableModal}>
                      <FaPlus className="me-1" />
                      Add Variable
                    </Button>
                  </div>
                </div>

                {formData.variables.length === 0 ? (
                  <p className="text-muted text-center">
                    No variables defined. Variables allow you to personalize emails.
                  </p>
                ) : (
                  <ListGroup flush>
                    {formData.variables.map((variable, index) => (
                      <ListGroupItem key={index} className="variable-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1 me-3">
                            <div className="fw-bold">{variable.label}</div>
                            <small className="text-muted d-block">{`{{${variable.name}}}`}</small>
                            <div className="mt-1">
                              <Badge color="secondary" className="me-2">
                                {variable.type}
                              </Badge>
                              {variable.required && <Badge color="warning">Required</Badge>}
                            </div>
                          </div>
                          <div className="d-flex align-items-center">
                            <Button
                              color="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => insertVariableIntoContent(variable.name)}
                              title="Insert into content"
                            >
                              <FaCode />
                            </Button>
                            <Button
                              color="outline-danger"
                              size="sm"
                              onClick={() => handleRemoveVariable(index)}
                              title="Remove variable"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </div>
                      </ListGroupItem>
                    ))}
                  </ListGroup>
                )}
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Add Variable Modal */}
      <Modal isOpen={showVariableModal} toggle={() => setShowVariableModal(false)}>
        <ModalHeader toggle={() => setShowVariableModal(false)}>Add Variable</ModalHeader>
        <ModalBody>
          {variableError && (
            <Alert color="danger" className="mb-3">
              {variableError}
            </Alert>
          )}
          <Form>
            <FormGroup>
              <Label>Variable Name *</Label>
              <Input
                type="text"
                value={newVariable.name}
                onChange={e => {
                  setNewVariable(prev => ({ ...prev, name: e.target.value }));
                  if (variableError) setVariableError('');
                }}
                placeholder="e.g., firstName, companyName"
              />
              <small className="text-muted">Use camelCase, no spaces or special characters</small>
            </FormGroup>

            <FormGroup>
              <Label>Display Label *</Label>
              <Input
                type="text"
                value={newVariable.label}
                onChange={e => {
                  setNewVariable(prev => ({ ...prev, label: e.target.value }));
                  if (variableError) setVariableError('');
                }}
                placeholder="e.g., First Name, Company Name"
              />
            </FormGroup>

            <FormGroup>
              <Label>Type</Label>
              <Input
                type="select"
                value={newVariable.type}
                onChange={e => setNewVariable(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="text">Text</option>
                <option value="url">URL/Link</option>
                <option value="number">Number</option>
                <option value="textarea">Textarea</option>
                <option value="image">Image</option>
              </Input>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowVariableModal(false)}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleAddVariable}
            disabled={!newVariable.name.trim() || !newVariable.label.trim()}
          >
            Add Variable
          </Button>
        </ModalFooter>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={showPreviewModal} toggle={() => setShowPreviewModal(false)} size="lg">
        <ModalHeader toggle={() => setShowPreviewModal(false)}>Email Preview</ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <strong>Subject:</strong> {formData.subject}
          </div>
          <div dangerouslySetInnerHTML={{ __html: getPreviewContent() }} />
          {formData.variables.length > 0 && (
            <div className="mt-3">
              <small className="text-muted">
                Note: Variables are shown as [Label] in preview. They will be replaced with actual
                values when sending emails.
              </small>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Type Selection Modal */}
      <Modal isOpen={showTypeSelectionModal} toggle={handleCancelTypeSelection} size="lg">
        <ModalHeader toggle={handleCancelTypeSelection}>
          <FaCode className="me-2" />
          Configure Extracted Variables
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <p className="text-muted">
              We found {extractedVariables.length} variable(s) in your content and subject. Please
              select the appropriate type for each variable:
            </p>
          </div>

          <div className="extracted-variables-list">
            {extractedVariables.map((variable, index) => (
              <Card key={index} className="mb-3">
                <CardBody className="py-3">
                  <Row className="align-items-center">
                    <Col md={6}>
                      <div>
                        <strong>{variable.label}</strong>
                        <div className="text-muted small">{`{{${variable.name}}}`}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <Label className="small">Type</Label>
                        <Input
                          type="select"
                          value={variable.type}
                          onChange={e => handleTypeSelection(index, e.target.value)}
                          size="sm"
                        >
                          <option value="text">Text</option>
                          <option value="url">URL/Link</option>
                          <option value="number">Number</option>
                          <option value="textarea">Textarea</option>
                          <option value="image">Image</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            ))}
          </div>

          <div className="mt-3 p-3 bg-light rounded">
            <small className="text-muted">
              <strong>Tip:</strong> Choose the most appropriate type for each variable to provide
              the best user experience when sending emails. All variables will be marked as
              required.
            </small>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCancelTypeSelection}>
            Cancel
          </Button>
          <Button color="success" onClick={handleConfirmTypeSelection}>
            <FaPlus className="me-1" />
            Add {extractedVariables.length} Variable{extractedVariables.length !== 1 ? 's' : ''}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const mapStateToProps = state => ({
  template: state.emailTemplates.currentTemplate,
  loading: state.emailTemplates.loading,
  error: state.emailTemplates.error,
});

const mapDispatchToProps = {
  createEmailTemplate,
  updateEmailTemplate,
  fetchEmailTemplate,
  clearEmailTemplateError,
  clearCurrentTemplate,
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailTemplateEditor);
