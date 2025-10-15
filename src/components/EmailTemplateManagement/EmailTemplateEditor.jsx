import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { connect, useSelector } from 'react-redux';
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
  FaPencilAlt,
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
  const darkMode = useSelector(state => state.theme.darkMode);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_content: '',
    variables: [],
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showVariableModal, setShowVariableModal] = useState(false);
  const [extractedVariables, setExtractedVariables] = useState([]);
  const [variableError, setVariableError] = useState('');
  const [newVariable, setNewVariable] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
  });
  const [showTypeSelectionModal, setShowTypeSelectionModal] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState(null); // 'saving', 'saved', 'error'

  // Effect to load template data when in edit mode
  useEffect(() => {
    if (templateId) {
      fetchEmailTemplate(templateId);
    } else {
      clearCurrentTemplate(); // Clear any previous template data when creating a new one
      setFormData({
        name: '',
        subject: '',
        html_content: '',
        variables: [],
      });
    }
  }, [templateId, fetchEmailTemplate, clearCurrentTemplate]);

  // Effect to populate form data when template is fetched
  useEffect(() => {
    if (template && templateId) {
      setFormData({
        name: template.name || '',
        subject: template.subject || '',
        html_content: template.html_content || '',
        variables: template.variables || [],
      });
    }
  }, [template, templateId]);

  // Auto-save effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (templateId && !saving && !Object.keys(validationErrors).length) {
        // Only auto-save if in edit mode, not currently saving, and no validation errors
        // You might want to add a check here to see if formData has actually changed
        // before triggering an auto-save to prevent unnecessary API calls.
        // For simplicity, we'll omit that check for now.
        // console.log('Auto-saving...');
        // setAutoSaveStatus('saving');
        // updateEmailTemplate(templateId, formData)
        //   .then(() => setAutoSaveStatus('saved'))
        //   .catch(() => setAutoSaveStatus('error'));
      }
    }, 5000); // Auto-save every 5 seconds

    return () => {
      clearTimeout(handler);
    };
  }, [formData, templateId, saving, validationErrors, updateEmailTemplate]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors(prev => ({ ...prev, [field]: '' })); // Clear error on input change
  }, []);

  const handleVariableChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newVariables = [...prev.variables];
      newVariables[index] = { ...newVariables[index], [field]: value };
      return { ...prev, variables: newVariables };
    });
    setValidationErrors(prev => ({ ...prev, [`variable_${index}_${field}`]: '' }));
  }, []);

  // Extract variables from HTML content and subject
  const extractVariables = useCallback(() => {
    const htmlContent = formData.html_content;
    const subject = formData.subject;
    const allContent = `${htmlContent || ''} ${subject || ''}`;
    const regex = /{{(\w+)}}/g;
    const matches = [...allContent.matchAll(regex)];
    const uniqueVariables = [...new Set(matches.map(match => match[1]))];
    return uniqueVariables.map(name => ({ name, label: name, type: 'text', required: false }));
  }, [formData.html_content, formData.subject]);

  // Auto-populate variables from HTML content and subject
  const handleAutoPopulateVariables = () => {
    const extractedVars = extractVariables();

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

  const validateForm = useCallback(() => {
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
    const usedVariables = [
      ...new Set([...allContent.matchAll(/{{(\w+)}}/g)].map(match => match[1])),
    ];
    const definedVariableNames = formData.variables.map(v => v.name);
    const undefinedVariables = usedVariables.filter(v => !definedVariableNames.includes(v));

    if (undefinedVariables.length > 0) {
      errors.undefined_variables = `The following variables are used but not defined: ${undefinedVariables.join(
        ', ',
      )}. Please define them or remove them from the content.`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setAutoSaveStatus('saving');
    try {
      if (templateId) {
        await updateEmailTemplate(templateId, formData);
      } else {
        await createEmailTemplate(formData);
      }
      setShowSuccessMessage(true);
      setAutoSaveStatus('saved');
      setTimeout(() => setShowSuccessMessage(false), 3000);
      if (onSave) {
        onSave(formData); // Pass saved data back to parent if needed
      }
    } catch (err) {
      setAutoSaveStatus('error');
      // Error is already handled by Redux and displayed via `error` prop
    } finally {
      setSaving(false);
    }
  }, [validateForm, templateId, formData, updateEmailTemplate, createEmailTemplate, onSave]);

  const handleOpenVariableModal = useCallback(() => {
    setNewVariable({ name: '', label: '', type: 'text', required: false });
    setVariableError('');
    setShowVariableModal(true);
  }, []);

  const handleAddVariable = useCallback(() => {
    if (!newVariable.name.trim() || !newVariable.label.trim()) {
      setVariableError('Variable name and label are required');
      return;
    }

    // Check if variable name already exists
    if (formData.variables.some(v => v.name === newVariable.name)) {
      setVariableError('A variable with this name already exists');
      return;
    }

    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, { ...newVariable }],
    }));
    setShowVariableModal(false);
    setNewVariable({ name: '', label: '', type: 'text', required: false });
    setVariableError('');
  }, [formData.variables, newVariable]);

  const handleDeleteVariable = useCallback(index => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  }, []);

  const resetAllStates = useCallback(() => {
    setFormData({
      name: '',
      subject: '',
      html_content: '',
      variables: [],
    });
    setValidationErrors({});
    setSaving(false);
    setShowSuccessMessage(false);
    setShowPreviewModal(false);
    setShowVariableModal(false);
    setExtractedVariables([]);
    setVariableError('');
    setNewVariable({ name: '', label: '', type: 'text', required: false });
    setShowTypeSelectionModal(false);
    setAutoSaveStatus(null);
  }, []);

  const clearReduxState = useCallback(() => {
    clearEmailTemplateError();
    clearCurrentTemplate();
  }, [clearEmailTemplateError, clearCurrentTemplate]);

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
                      menubar: 'file edit view insert format tools table help',
                      placeholder: 'Enter your email content here...',
                      skin: 'oxide',
                      content_css: 'default',

                      // Comprehensive plugin list for maximum functionality
                      plugins: [
                        'advlist',
                        'anchor',
                        'autolink',
                        'autoresize',
                        'autosave',
                        'charmap',
                        'code',
                        'codesample',
                        'directionality',
                        'emoticons',
                        'fullscreen',
                        'help',
                        'hr',
                        'image',
                        'importcss',
                        'insertdatetime',
                        'link',
                        'lists',
                        'media',
                        'nonbreaking',
                        'pagebreak',
                        'preview',
                        'quickbars',
                        'save',
                        'searchreplace',
                        'table',
                        'template',
                        'textcolor',
                        'textpattern',
                        'visualblocks',
                        'visualchars',
                        'wordcount',
                      ],

                      // Comprehensive toolbar with all formatting options
                      toolbar: [
                        'undo redo | formatselect fontselect fontsizeselect | bold italic underline strikethrough subscript superscript | forecolor backcolor',
                        'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | blockquote hr pagebreak | ltr rtl',
                        'link unlink anchor | image media codesample | table | charmap emoticons | insertdatetime nonbreaking',
                        'searchreplace visualblocks visualchars | code preview fullscreen | help | insertvariable',
                      ],

                      branding: false,

                      // Comprehensive font family options
                      font_family_formats:
                        'Arial=arial,helvetica,sans-serif; ' +
                        'Arial Black=arial black,avant garde; ' +
                        'Bookman Old Style=bookman old style,serifs; ' +
                        'Comic Sans MS=comic sans ms,cursive; ' +
                        'Courier=courier,monaco,monospace; ' +
                        'Courier New=courier new,courier,monaco,monospace; ' +
                        'Georgia=georgia,palatino,serif; ' +
                        'Helvetica=helvetica,arial,sans-serif; ' +
                        'Helvetica Neue=helvetica neue,helvetica,arial,sans-serif; ' +
                        'Impact=impact,chicago; ' +
                        'Lucida Console=lucida console,monaco,monospace; ' +
                        'Lucida Grande=lucida grande,helvetica,arial,sans-serif; ' +
                        'Palatino=palatino linotype,palatino,serif; ' +
                        'Tahoma=tahoma,arial,helvetica,sans-serif; ' +
                        'Times=times,times new roman,serif; ' +
                        'Times New Roman=times new roman,times,serif; ' +
                        'Trebuchet MS=trebuchet ms,geneva,arial,sans-serif; ' +
                        'Verdana=verdana,geneva,arial,helvetica,sans-serif; ' +
                        'Webdings=webdings; ' +
                        'Wingdings=wingdings,zapf dingbats; ' +
                        'Andale Mono=andale mono,monospace; ' +
                        'Open Sans=open sans,sans-serif; ' +
                        'Roboto=roboto,sans-serif; ' +
                        'Lato=lato,sans-serif; ' +
                        'Montserrat=montserrat,sans-serif; ' +
                        'Source Sans Pro=source sans pro,sans-serif; ' +
                        'Poppins=poppins,sans-serif; ' +
                        'Inter=inter,sans-serif; ' +
                        'Nunito=nunito,sans-serif; ' +
                        'PT Sans=pt sans,sans-serif; ' +
                        'Ubuntu=ubuntu,sans-serif',

                      // Ultra-granular font sizes from 8px to 144px
                      fontsize_formats:
                        '8px 9px 10px 11px 12px 13px 14px 15px 16px 17px 18px 19px 20px 21px 22px 23px 24px 25px 26px 27px 28px 29px 30px 31px 32px 33px 34px 35px 36px 37px 38px 39px 40px 42px 44px 46px 48px 50px 52px 54px 56px 58px 60px 62px 64px 66px 68px 70px 72px 74px 76px 78px 80px 84px 88px 92px 96px 100px 104px 108px 112px 116px 120px 124px 128px 132px 136px 140px 144px',

                      // Comprehensive block formats
                      block_formats:
                        'Paragraph=p; ' +
                        'Heading 1=h1; ' +
                        'Heading 2=h2; ' +
                        'Heading 3=h3; ' +
                        'Heading 4=h4; ' +
                        'Heading 5=h5; ' +
                        'Heading 6=h6; ' +
                        'Preformatted=pre; ' +
                        'Blockquote=blockquote; ' +
                        'Address=address; ' +
                        'Code=code; ' +
                        'Div=div; ' +
                        'Section=section; ' +
                        'Article=article; ' +
                        'Header=header; ' +
                        'Footer=footer; ' +
                        'Main=main; ' +
                        'Aside=aside; ' +
                        'Nav=nav; ' +
                        'Figure=figure; ' +
                        'Figcaption=figcaption',

                      // Line height options with more granular control
                      lineheight_formats:
                        '0.5 0.6 0.7 0.8 0.9 1 1.1 1.2 1.3 1.4 1.5 1.6 1.7 1.8 1.9 2 2.1 2.2 2.3 2.4 2.5 2.6 2.7 2.8 2.9 3 3.5 4 4.5 5',

                      // Image settings - URL only, no upload
                      image_upload_handler: function(blobInfo, success, failure) {
                        failure(
                          'Direct image upload is not supported. Please use "Insert/Edit Image" and provide an image URL.',
                        );
                      },

                      // Media settings - URL only, no upload
                      media_upload_handler: function(blobInfo, success, failure) {
                        failure(
                          'Direct media upload is not supported. Please use "Insert/Edit Media" and provide a media URL.',
                        );
                      },

                      // File picker callback - redirect to URL input
                      file_picker_callback: function(callback, value, meta) {
                        // eslint-disable-next-line no-alert
                        const url = window.prompt(
                          `Please enter the ${meta.filetype === 'image' ? 'image' : 'media'} URL:`,
                          value,
                        );
                        if (url) {
                          callback(url);
                        }
                      },

                      // Disable automatic uploads for all file types
                      automatic_uploads: false,
                      images_upload_handler: function(blobInfo, success, failure) {
                        failure('Please use the URL option to insert images.');
                      },

                      // Advanced image options
                      image_advtab: true,
                      image_caption: true,
                      image_title: true,
                      image_description: true,
                      image_dimensions: true,
                      image_uploadtab: false,
                      image_class_list: [
                        { title: 'None', value: '' },
                        { title: 'Responsive', value: 'img-responsive' },
                        { title: 'Rounded', value: 'img-rounded' },
                        { title: 'Circle', value: 'img-circle' },
                        { title: 'Thumbnail', value: 'img-thumbnail' },
                        { title: 'Float Left', value: 'float-left' },
                        { title: 'Float Right', value: 'float-right' },
                        { title: 'Center Block', value: 'center-block' },
                        { title: 'Shadow', value: 'img-shadow' },
                        { title: 'Border', value: 'img-border' },
                      ],

                      // Comprehensive link options
                      link_title: true,
                      link_assume_external_targets: true,
                      link_context_toolbar: true,
                      link_target_list: [
                        { title: 'None', value: '' },
                        { title: 'Same window', value: '_self' },
                        { title: 'New window', value: '_blank' },
                        { title: 'Parent window', value: '_parent' },
                        { title: 'Top window', value: '_top' },
                      ],
                      link_class_list: [
                        { title: 'None', value: '' },
                        { title: 'External Link', value: 'external-link' },
                        { title: 'Button Primary', value: 'btn btn-primary' },
                        { title: 'Button Secondary', value: 'btn btn-secondary' },
                        { title: 'Button Success', value: 'btn btn-success' },
                        { title: 'Button Danger', value: 'btn btn-danger' },
                        { title: 'Button Warning', value: 'btn btn-warning' },
                        { title: 'Button Info', value: 'btn btn-info' },
                      ],

                      // Advanced table options
                      table_default_attributes: {
                        border: '1',
                        cellpadding: '5',
                        cellspacing: '0',
                      },
                      table_default_styles: {
                        'border-collapse': 'collapse',
                        width: '100%',
                        border: '1px solid #ccc',
                      },
                      table_responsive_width: true,
                      table_grid: true,
                      table_tab_navigation: true,
                      table_toolbar:
                        'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
                      table_appearance_options: true,
                      table_clone_elements: 'strong em a',
                      table_class_list: [
                        { title: 'None', value: '' },
                        { title: 'Table', value: 'table' },
                        { title: 'Striped', value: 'table-striped' },
                        { title: 'Bordered', value: 'table-bordered' },
                        { title: 'Borderless', value: 'table-borderless' },
                        { title: 'Hover', value: 'table-hover' },
                        { title: 'Condensed', value: 'table-condensed' },
                        { title: 'Responsive', value: 'table-responsive' },
                        { title: 'Dark', value: 'table-dark' },
                        { title: 'Light', value: 'table-light' },
                      ],
                      table_cell_class_list: [
                        { title: 'None', value: '' },
                        { title: 'Active', value: 'table-active' },
                        { title: 'Primary', value: 'table-primary' },
                        { title: 'Secondary', value: 'table-secondary' },
                        { title: 'Success', value: 'table-success' },
                        { title: 'Danger', value: 'table-danger' },
                        { title: 'Warning', value: 'table-warning' },
                        { title: 'Info', value: 'table-info' },
                        { title: 'Light', value: 'table-light' },
                        { title: 'Dark', value: 'table-dark' },
                      ],
                      table_row_class_list: [
                        { title: 'None', value: '' },
                        { title: 'Active', value: 'table-active' },
                        { title: 'Primary', value: 'table-primary' },
                        { title: 'Secondary', value: 'table-secondary' },
                        { title: 'Success', value: 'table-success' },
                        { title: 'Danger', value: 'table-danger' },
                        { title: 'Warning', value: 'table-warning' },
                        { title: 'Info', value: 'table-info' },
                        { title: 'Light', value: 'table-light' },
                        { title: 'Dark', value: 'table-dark' },
                      ],

                      // Advanced list options
                      advlist_bullet_styles: 'disc circle square',
                      advlist_number_styles:
                        'decimal lower-alpha lower-roman upper-alpha upper-roman lower-greek',

                      // Text patterns for quick formatting (Markdown-like)
                      textpattern_patterns: [
                        { start: '*', end: '*', format: 'italic' },
                        { start: '_', end: '_', format: 'italic' },
                        { start: '**', end: '**', format: 'bold' },
                        { start: '__', end: '__', format: 'bold' },
                        { start: '***', end: '***', format: ['bold', 'italic'] },
                        { start: '___', end: '___', format: ['bold', 'italic'] },
                        { start: '~~', end: '~~', format: 'strikethrough' },
                        { start: '`', end: '`', format: 'code' },
                        { start: '#', format: 'h1' },
                        { start: '##', format: 'h2' },
                        { start: '###', format: 'h3' },
                        { start: '####', format: 'h4' },
                        { start: '#####', format: 'h5' },
                        { start: '######', format: 'h6' },
                        { start: '1. ', cmd: 'InsertOrderedList' },
                        { start: '* ', cmd: 'InsertUnorderedList' },
                        { start: '- ', cmd: 'InsertUnorderedList' },
                        { start: '+ ', cmd: 'InsertUnorderedList' },
                        { start: '> ', cmd: 'mceBlockQuote' },
                        { start: '---', replacement: '<hr/>' },
                        { start: '--', replacement: '—' },
                        { start: '->', replacement: '→' },
                        { start: '<-', replacement: '←' },
                        { start: '=>', replacement: '⇒' },
                        { start: '<=', replacement: '⇐' },
                        { start: '(c)', replacement: '©' },
                        { start: '(r)', replacement: '®' },
                        { start: '(tm)', replacement: '™' },
                      ],

                      // Comprehensive content style for email compatibility
                      content_style: `
                        body { 
                        font-family: Arial, Helvetica, sans-serif; 
                          font-size: 14px; 
                          line-height: 1.6; 
                          background-color: #ffffff !important;
                          color: #212529 !important;
                          margin: 20px;
                          cursor: text !important;
                          max-width: none;
                        }
                        
                        h1, h2, h3, h4, h5, h6 { 
                          margin-top: 20px; 
                          margin-bottom: 10px; 
                          font-weight: bold; 
                          line-height: 1.2;
                          color: #212529;
                        }
                        
                        h1 { font-size: 2.5em; }
                        h2 { font-size: 2em; }
                        h3 { font-size: 1.75em; }
                        h4 { font-size: 1.5em; }
                        h5 { font-size: 1.25em; }
                        h6 { font-size: 1em; }
                        
                        p { 
                          margin: 10px 0; 
                          color: #212529;
                        }
                        
                        ul, ol { 
                          margin: 10px 0; 
                          padding-left: 30px; 
                          color: #212529;
                        }
                        
                        li {
                          margin: 5px 0;
                          color: #212529;
                        }
                        
                        blockquote { 
                          margin: 10px 0; 
                          padding: 10px 20px; 
                          border-left: 4px solid #007bff; 
                          background-color: #f8f9fa; 
                          font-style: italic;
                          color: #495057;
                        }
                        
                        table { 
                          border-collapse: collapse; 
                          width: 100%; 
                          margin: 10px 0; 
                        }
                        
                        th, td { 
                          border: 1px solid #dee2e6; 
                          padding: 8px 12px; 
                          text-align: left; 
                          vertical-align: top;
                        }
                        
                        th { 
                          background-color: #f8f9fa; 
                          font-weight: bold; 
                          color: #495057;
                        }
                        
                        td {
                          color: #212529;
                        }
                        
                        img { 
                          max-width: 100%; 
                          height: auto; 
                          border-radius: 4px;
                        }
                        
                        a { 
                          color: #007bff; 
                          text-decoration: underline; 
                        }
                        
                        a:hover {
                          color: #0056b3;
                        }
                        
                        code { 
                          background-color: #f8f9fa; 
                          padding: 2px 6px; 
                          border-radius: 4px; 
                          font-family: 'Courier New', Courier, monospace; 
                          font-size: 90%;
                          color: #e83e8c;
                        }
                        
                        pre { 
                          background-color: #f8f9fa; 
                          padding: 15px; 
                          border-radius: 6px; 
                          overflow-x: auto; 
                          font-family: 'Courier New', Courier, monospace; 
                          border: 1px solid #e9ecef;
                          color: #212529;
                        }
                        
                        hr {
                          border: none;
                          border-top: 2px solid #dee2e6;
                          margin: 20px 0;
                        }
                        
                        .img-responsive { max-width: 100%; height: auto; }
                        .img-rounded { border-radius: 6px; }
                        .img-circle { border-radius: 50%; }
                        .img-thumbnail { 
                          padding: 4px; 
                          background-color: #fff; 
                          border: 1px solid #dee2e6; 
                          border-radius: 4px; 
                        }
                        .img-shadow { box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                        .img-border { border: 2px solid #dee2e6; }
                        .float-left { float: left; margin: 0 15px 10px 0; }
                        .float-right { float: right; margin: 0 0 10px 15px; }
                        .center-block { display: block; margin: 0 auto; }
                        
                        .btn {
                          display: inline-block;
                          padding: 6px 12px;
                          margin-bottom: 0;
                          font-size: 14px;
                          font-weight: 400;
                          line-height: 1.42857143;
                          text-align: center;
                          white-space: nowrap;
                          vertical-align: middle;
                          cursor: pointer;
                          border: 1px solid transparent;
                          border-radius: 4px;
                          text-decoration: none;
                        }
                        
                        .btn-primary { background-color: #007bff; border-color: #007bff; color: #fff; }
                        .btn-secondary { background-color: #6c757d; border-color: #6c757d; color: #fff; }
                        .btn-success { background-color: #28a745; border-color: #28a745; color: #fff; }
                        .btn-danger { background-color: #dc3545; border-color: #dc3545; color: #fff; }
                        .btn-warning { background-color: #ffc107; border-color: #ffc107; color: #212529; }
                        .btn-info { background-color: #17a2b8; border-color: #17a2b8; color: #fff; }
                        
                        .external-link::after {
                          content: " ↗";
                          font-size: 0.8em;
                        }
                      `,

                      // Setup function for additional customizations
                      setup: function(editor) {
                        // Initialize with light mode styling
                        editor.on('init', function() {
                          const body = editor.getBody();
                          body.style.backgroundColor = '#ffffff';
                          body.style.color = '#212529';
                        });

                        // Custom button for inserting variables
                        editor.ui.registry.addButton('insertvariable', {
                          text: 'Variable',
                          tooltip: 'Insert Template Variable',
                          onAction: function() {
                            const variables = formData.variables || [];
                            if (variables.length === 0) {
                              editor.notificationManager.open({
                                text: 'No variables defined. Please add variables first.',
                                type: 'warning',
                              });
                              return;
                            }

                            const variableOptions = variables.map(v => ({
                              text: `${v.label} ({{${v.name}}})`,
                              value: `{{${v.name}}}`,
                            }));

                            editor.windowManager.open({
                              title: 'Insert Variable',
                              body: {
                                type: 'panel',
                                items: [
                                  {
                                    type: 'selectbox',
                                    name: 'variable',
                                    label: 'Select Variable:',
                                    items: variableOptions,
                                  },
                                ],
                              },
                              buttons: [
                                {
                                  type: 'cancel',
                                  text: 'Cancel',
                                },
                                {
                                  type: 'submit',
                                  text: 'Insert',
                                  primary: true,
                                },
                              ],
                              onSubmit: function(api) {
                                const data = api.getData();
                                if (data.variable) {
                                  editor.insertContent(data.variable);
                                }
                                api.close();
                              },
                            });
                          },
                        });

                        // Custom menu items
                        editor.ui.registry.addMenuItem('custominsertmenu', {
                          text: 'Insert Custom Content',
                          context: 'insert',
                          onAction: function() {
                            editor.insertContent('<p>Custom content inserted!</p>');
                          },
                        });
                      },

                      // Additional configurations
                      paste_data_images: false,
                      paste_retain_style_properties:
                        'color font-size font-family background-color text-align font-weight font-style text-decoration line-height margin padding border',
                      paste_remove_styles_if_webkit: false,
                      paste_merge_formats: true,
                      paste_convert_word_fake_lists: true,
                      paste_webkit_styles: 'all',
                      paste_remove_spans: false,
                      paste_remove_styles: false,

                      // Word count and character count
                      wordcount_countregex: /[\w\u2019\'-]+/g,
                      wordcount_cleanregex: /[0-9.(),;:!?%#$?\x27\x22_+=\\\/\-]*/g,

                      // Accessibility
                      a11y_advanced_options: true,

                      // Auto-save prevention (we handle this manually)
                      save_enablewhendirty: false,

                      // Emoticons
                      emoticons_database_url: '/tinymce/plugins/emoticons/js/emojis.min.js',

                      // Media configuration - URL only, comprehensive support
                      media_live_embeds: true,
                      media_alt_source: false,
                      media_poster: false,
                      media_dimensions: true,
                      media_filter_html: false,
                      media_url_resolver: function(data, resolve) {
                        const url = data.url;
                        let html = '';

                        // Video files
                        if (url.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv|m4v)$/i)) {
                          html = `<video width="320" height="240" controls>
                            <source src="${url}" type="video/mp4">
                            Your browser does not support the video tag.
                          </video>`;
                        }
                        // Audio files
                        else if (url.match(/\.(mp3|wav|ogg|aac|m4a|flac|wma)$/i)) {
                          html = `<audio controls>
                            <source src="${url}" type="audio/mpeg">
                            Your browser does not support the audio tag.
                          </audio>`;
                        }
                        // YouTube
                        else if (url.match(/youtube\.com\/watch\?v=([^&]+)/)) {
                          const videoId = url.match(/youtube\.com\/watch\?v=([^&]+)/)[1];
                          html = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
                        }
                        // YouTube short URL
                        else if (url.match(/youtu\.be\/([^?]+)/)) {
                          const videoId = url.match(/youtu\.be\/([^?]+)/)[1];
                          html = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
                        }
                        // Vimeo
                        else if (url.match(/vimeo\.com\/(\d+)/)) {
                          const videoId = url.match(/vimeo\.com\/(\d+)/)[1];
                          html = `<iframe src="https://player.vimeo.com/video/${videoId}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
                        }
                        // Dailymotion
                        else if (url.match(/dailymotion\.com\/video\/([^_]+)/)) {
                          const videoId = url.match(/dailymotion\.com\/video\/([^_]+)/)[1];
                          html = `<iframe src="https://www.dailymotion.com/embed/video/${videoId}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
                        }
                        // Default video embed
                        else {
                          html = `<video width="320" height="240" controls>
                            <source src="${url}">
                            Your browser does not support the video tag.
                          </video>`;
                        }

                        setTimeout(() => {
                          resolve({ html });
                        }, 100);
                      },

                      // Comprehensive color picker options
                      color_map: [
                        '#000000',
                        'Black',
                        '#434343',
                        'Dark Gray 4',
                        '#666666',
                        'Dark Gray 3',
                        '#999999',
                        'Dark Gray 2',
                        '#B7B7B7',
                        'Dark Gray 1',
                        '#CCCCCC',
                        'Gray',
                        '#D9D9D9',
                        'Light Gray 1',
                        '#EFEFEF',
                        'Light Gray 2',
                        '#F3F3F3',
                        'Light Gray 3',
                        '#FFFFFF',
                        'White',
                        '#980000',
                        'Dark Red',
                        '#FF0000',
                        'Red',
                        '#FF9900',
                        'Orange',
                        '#FFFF00',
                        'Yellow',
                        '#00FF00',
                        'Green',
                        '#00FFFF',
                        'Cyan',
                        '#4A86E8',
                        'Cornflower Blue',
                        '#0000FF',
                        'Blue',
                        '#9900FF',
                        'Purple',
                        '#FF00FF',
                        'Magenta',
                        '#E6B8AF',
                        'Light Red Berry 3',
                        '#F4CCCC',
                        'Light Red 3',
                        '#FCE5CD',
                        'Light Orange 3',
                        '#FFF2CC',
                        'Light Yellow 3',
                        '#D9EAD3',
                        'Light Green 3',
                        '#D0E0E3',
                        'Light Cyan 3',
                        '#C9DAF8',
                        'Light Cornflower Blue 3',
                        '#CFE2F3',
                        'Light Blue 3',
                        '#D9D2E9',
                        'Light Purple 3',
                        '#EAD1DC',
                        'Light Magenta 3',
                        '#DD7E6B',
                        'Light Red Berry 2',
                        '#EA9999',
                        'Light Red 2',
                        '#F9CB9C',
                        'Light Orange 2',
                        '#FFE599',
                        'Light Yellow 2',
                        '#B6D7A8',
                        'Light Green 2',
                        '#A2C4C9',
                        'Light Cyan 2',
                        '#A4C2F4',
                        'Light Cornflower Blue 2',
                        '#9FC5E8',
                        'Light Blue 2',
                        '#B4A7D6',
                        'Light Purple 2',
                        '#D5A6BD',
                        'Light Magenta 2',
                        '#CC4125',
                        'Light Red Berry 1',
                        '#E06666',
                        'Light Red 1',
                        '#F6B26B',
                        'Light Orange 1',
                        '#FFD966',
                        'Light Yellow 1',
                        '#93C47D',
                        'Light Green 1',
                        '#76A5AF',
                        'Light Cyan 1',
                        '#6D9EEB',
                        'Light Cornflower Blue 1',
                        '#6FA8DC',
                        'Light Blue 1',
                        '#8E7CC3',
                        'Light Purple 1',
                        '#C27BA0',
                        'Light Magenta 1',
                        '#A61C00',
                        'Dark Red Berry 1',
                        '#CC0000',
                        'Dark Red 1',
                        '#E69138',
                        'Dark Orange 1',
                        '#F1C232',
                        'Dark Yellow 1',
                        '#6AA84F',
                        'Dark Green 1',
                        '#45818E',
                        'Dark Cyan 1',
                        '#3C78D8',
                        'Dark Cornflower Blue 1',
                        '#3D85C6',
                        'Dark Blue 1',
                        '#674EA7',
                        'Dark Purple 1',
                        '#A64D79',
                        'Dark Magenta 1',
                        '#85200C',
                        'Dark Red Berry 2',
                        '#990000',
                        'Dark Red 2',
                        '#B45F06',
                        'Dark Orange 2',
                        '#BF9000',
                        'Dark Yellow 2',
                        '#38761D',
                        'Dark Green 2',
                        '#134F5C',
                        'Dark Cyan 2',
                        '#1155CC',
                        'Dark Cornflower Blue 2',
                        '#0B5394',
                        'Dark Blue 2',
                        '#351C75',
                        'Dark Purple 2',
                        '#741B47',
                        'Dark Magenta 2',
                        '#5B0F00',
                        'Dark Red Berry 3',
                        '#660000',
                        'Dark Red 3',
                        '#783F04',
                        'Dark Orange 3',
                        '#7F6000',
                        'Dark Yellow 3',
                        '#274E13',
                        'Dark Green 3',
                        '#0C343D',
                        'Dark Cyan 3',
                        '#1C4587',
                        'Dark Cornflower Blue 3',
                        '#073763',
                        'Dark Blue 3',
                        '#20124D',
                        'Dark Purple 3',
                        '#4C1130',
                        'Dark Magenta 3',
                      ],

                      // Custom color picker
                      color_cols: 10,
                      custom_colors: true,

                      // Directionality
                      directionality: 'ltr',

                      // Browser spellcheck
                      browser_spellcheck: true,

                      // Context menu
                      contextmenu:
                        'link linkchecker image table spellchecker configurepermanentpen',

                      // Resize options
                      resize: 'both',
                      min_height: 400,
                      max_height: 1000,

                      // Status bar
                      statusbar: true,

                      // Element path
                      elementpath: true,

                      // Quickbars
                      quickbars_selection_toolbar:
                        'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
                      quickbars_text_toolbar: 'bold italic | quicklink h2 h3 blockquote',
                      quickbars_image_toolbar:
                        'alignleft aligncenter alignright | rotateleft rotateright | imageoptions',
                      quickbars_insert_toolbar: 'quickimage quicktable',

                      // Advanced options
                      convert_urls: false,
                      relative_urls: false,
                      remove_script_host: false,
                      document_base_url: '/',

                      // Indentation
                      indent_use_margin: true,
                      indent: '30px',

                      // Auto-resize
                      autoresize_bottom_margin: 50,
                      autoresize_max_height: 1000,
                      autoresize_min_height: 400,

                      // Visual aids
                      visual: true,
                      visual_table_class: 'mce-item-table',
                      visual_anchor_class: 'mce-item-anchor',

                      // Code sample
                      codesample_languages: [
                        { text: 'HTML/XML', value: 'markup' },
                        { text: 'JavaScript', value: 'javascript' },
                        { text: 'CSS', value: 'css' },
                        { text: 'PHP', value: 'php' },
                        { text: 'Ruby', value: 'ruby' },
                        { text: 'Python', value: 'python' },
                        { text: 'Java', value: 'java' },
                        { text: 'C', value: 'c' },
                        { text: 'C#', value: 'csharp' },
                        { text: 'C++', value: 'cpp' },
                      ],
                      codesample_dialog_height: 400,
                      codesample_dialog_width: 800,

                      // Custom formats
                      formats: {
                        alignleft: {
                          selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img',
                          styles: { textAlign: 'left' },
                        },
                        aligncenter: {
                          selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img',
                          styles: { textAlign: 'center' },
                        },
                        alignright: {
                          selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img',
                          styles: { textAlign: 'right' },
                        },
                        alignjustify: {
                          selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img',
                          styles: { textAlign: 'justify' },
                        },
                        bold: { inline: 'strong', remove: 'all' },
                        italic: { inline: 'em', remove: 'all' },
                        underline: { inline: 'u', remove: 'all' },
                        strikethrough: { inline: 'strike', remove: 'all' },
                        subscript: { inline: 'sub' },
                        superscript: { inline: 'sup' },
                        highlight: { inline: 'mark' },
                        code: { inline: 'code' },
                        removeformat: [
                          {
                            selector:
                              'b,strong,em,i,font,u,strike,sub,sup,dfn,code,samp,kbd,var,cite,mark,q,del,ins',
                            remove: 'all',
                            split: true,
                            expand: false,
                            block_expand: true,
                            deep: true,
                          },
                          {
                            selector: 'span',
                            attributes: ['style', 'class'],
                            remove: 'empty',
                            split: true,
                            expand: false,
                            deep: true,
                          },
                          {
                            selector: '*',
                            attributes: ['style', 'class'],
                            split: false,
                            expand: false,
                            deep: true,
                          },
                        ],
                      },

                      // Template support
                      templates: [
                        {
                          title: 'Email Newsletter',
                          description: 'Professional email newsletter template',
                          content: `
                            <h1>Newsletter Title</h1>
                            <p>Welcome to our newsletter!</p>
                            <h2>Section 1</h2>
                            <p>Your content here...</p>
                            <h2>Section 2</h2>
                            <p>More content here...</p>
                            <hr>
                            <p><small>Unsubscribe | Contact Us</small></p>
                          `,
                        },
                        {
                          title: 'Simple Email',
                          description: 'Basic email template',
                          content: `
                            <p>Dear {{firstName}},</p>
                            <p>Your content here...</p>
                            <p>Best regards,<br>Your Team</p>
                          `,
                        },
                      ],

                      // Advanced paste options
                      smart_paste: true,
                      paste_block_drop: false,
                      paste_as_text: false,
                      paste_tab_spaces: 4,

                      // Non-breaking space
                      nonbreaking_force_tab: true,
                      nonbreaking_wrap: true,

                      // Advanced typography
                      entities: '160,nbsp,38,amp,60,lt,62,gt',
                      entity_encoding: 'named',

                      // Custom CSS classes
                      body_class: 'email-content',
                      content_css_cors: true,

                      // Performance optimizations
                      cache_suffix: '?v=6.8.0',
                      compress: true,
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
                              onClick={() => {
                                // Logic to edit variable (e.g., open modal with pre-filled data)
                                // For now, just a placeholder
                                // eslint-disable-next-line no-alert
                                alert(`Edit variable: ${variable.name}`);
                              }}
                              title="Edit Variable"
                            >
                              <FaPencilAlt />
                            </Button>
                            <Button
                              color="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteVariable(index)}
                              title="Delete Variable"
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

      {/* Preview Modal */}
      <Modal isOpen={showPreviewModal} toggle={() => setShowPreviewModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setShowPreviewModal(false)}>Email Preview</ModalHeader>
        <ModalBody>
          <div dangerouslySetInnerHTML={{ __html: getPreviewContent() }} />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add Variable Modal */}
      <Modal isOpen={showVariableModal} toggle={() => setShowVariableModal(false)} centered>
        <ModalHeader toggle={() => setShowVariableModal(false)}>Add New Variable</ModalHeader>
        <ModalBody>
          {variableError && <Alert color="danger">{variableError}</Alert>}
          <FormGroup>
            <Label for="variableName">Variable Name (e.g., firstName)</Label>
            <Input
              type="text"
              id="variableName"
              value={newVariable.name}
              onChange={e => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter variable name (e.g., firstName)"
            />
          </FormGroup>
          <FormGroup>
            <Label for="variableLabel">Variable Label (e.g., First Name)</Label>
            <Input
              type="text"
              id="variableLabel"
              value={newVariable.label}
              onChange={e => setNewVariable(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Enter display label (e.g., First Name)"
            />
          </FormGroup>
          <FormGroup>
            <Label for="variableType">Variable Type</Label>
            <Input
              type="select"
              id="variableType"
              value={newVariable.type}
              onChange={e => setNewVariable(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="email">Email</option>
            </Input>
          </FormGroup>
          <FormGroup check>
            <Label check>
              <Input
                type="checkbox"
                checked={newVariable.required}
                onChange={e => setNewVariable(prev => ({ ...prev, required: e.target.checked }))}
              />{' '}
              Required
            </Label>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowVariableModal(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleAddVariable}>
            Add Variable
          </Button>
        </ModalFooter>
      </Modal>

      {/* Type Selection Modal for Auto-extracted Variables */}
      <Modal isOpen={showTypeSelectionModal} toggle={handleCancelTypeSelection} centered size="lg">
        <ModalHeader toggle={handleCancelTypeSelection}>Select Variable Types</ModalHeader>
        <ModalBody>
          <p>Please select a type for each new variable:</p>
          <ListGroup>
            {extractedVariables.map((variable, index) => (
              <ListGroupItem
                key={index}
                className="d-flex justify-content-between align-items-center"
              >
                <span>{variable.name}</span>
                <Input
                  type="select"
                  value={variable.type}
                  onChange={e => handleTypeSelection(index, e.target.value)}
                  style={{ width: '150px' }}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="email">Email</option>
                </Input>
              </ListGroupItem>
            ))}
          </ListGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCancelTypeSelection}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleConfirmTypeSelection}>
            Add Selected Variables
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
