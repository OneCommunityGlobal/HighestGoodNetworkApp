import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Modal,
  ListGroup,
  Badge,
  Spinner,
} from 'reactstrap';
import { FaPaperPlane, FaTimes, FaEye, FaPlus, FaTrash } from 'react-icons/fa';
import {
  fetchEmailTemplates,
  sendEmailWithTemplate,
  clearEmailTemplateError,
} from '../../actions/emailTemplateActions';
import './EmailSender.css';

const EmailSender = ({
  templates,
  loading,
  error,
  sendingEmail,
  emailSent,
  fetchEmailTemplates,
  sendEmailWithTemplate,
  clearEmailTemplateError,
  onClose,
  selectedTemplateId = null,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [recipients, setRecipients] = useState('');
  const [variableValues, setVariableValues] = useState({});
  const [senderCredentials, setSenderCredentials] = useState({
    email: '',
    password: '',
  });
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [recipientList, setRecipientList] = useState([]);

  useEffect(() => {
    fetchEmailTemplates('', true); // Fetch only active templates
  }, [fetchEmailTemplates]);

  useEffect(() => {
    if (selectedTemplateId && templates.length > 0) {
      const template = templates.find(t => t._id === selectedTemplateId);
      if (template) {
        setSelectedTemplate(template);
        initializeVariableValues(template);
      }
    }
  }, [selectedTemplateId, templates]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearEmailTemplateError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearEmailTemplateError]);

  useEffect(() => {
    if (emailSent) {
      const timer = setTimeout(() => {
        clearEmailTemplateError();
        if (onClose) {
          onClose();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [emailSent, clearEmailTemplateError, onClose]);

  const initializeVariableValues = template => {
    const initialValues = {};
    if (template.variables) {
      template.variables.forEach(variable => {
        initialValues[variable.name] = '';
      });
    }
    setVariableValues(initialValues);
  };

  const handleTemplateSelect = template => {
    setSelectedTemplate(template);
    initializeVariableValues(template);
    setValidationErrors({});
  };

  const handleVariableChange = (variableName, value) => {
    setVariableValues(prev => ({
      ...prev,
      [variableName]: value,
    }));

    // Clear validation error for this variable
    if (validationErrors[variableName]) {
      setValidationErrors(prev => ({
        ...prev,
        [variableName]: null,
      }));
    }
  };

  const parseRecipients = recipientText => {
    return recipientText
      .split(/[,;\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
  };

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = {};

    if (!selectedTemplate) {
      errors.template = 'Please select a template';
    }

    if (!recipients.trim()) {
      errors.recipients = 'Please enter at least one recipient';
    } else {
      const recipientEmails = parseRecipients(recipients);
      const invalidEmails = recipientEmails.filter(email => !validateEmail(email));
      if (invalidEmails.length > 0) {
        errors.recipients = `Invalid email addresses: ${invalidEmails.join(', ')}`;
      }
      setRecipientList(recipientEmails);
    }

    if (!senderCredentials.email.trim()) {
      errors.senderEmail = 'Sender email is required';
    } else if (!validateEmail(senderCredentials.email)) {
      errors.senderEmail = 'Invalid sender email address';
    }

    if (!senderCredentials.password.trim()) {
      errors.senderPassword = 'Sender password is required';
    }

    // Validate required variables
    if (selectedTemplate && selectedTemplate.variables) {
      selectedTemplate.variables.forEach(variable => {
        if (variable.required && !variableValues[variable.name]?.trim()) {
          errors[variable.name] = `${variable.label} is required`;
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendEmail = async () => {
    if (!validateForm()) {
      return;
    }

    const emailData = {
      recipients: recipientList,
      variableValues,
      senderEmail: senderCredentials.email,
      senderPassword: senderCredentials.password,
    };

    try {
      await sendEmailWithTemplate(selectedTemplate._id, emailData);
    } catch (error) {
      // Error is handled by Redux action
    }
  };

  const getPreviewContent = () => {
    if (!selectedTemplate) return '';

    let content = selectedTemplate.html_content;
    let subject = selectedTemplate.subject;

    // Replace variables with values or placeholders
    if (selectedTemplate.variables) {
      selectedTemplate.variables.forEach(variable => {
        const value = variableValues[variable.name] || `[${variable.label}]`;
        const regex = new RegExp(`{{${variable.name}}}`, 'g');
        content = content.replace(regex, value);
        subject = subject.replace(regex, value);
      });
    }

    return { subject, content };
  };

  const addRecipientFromInput = () => {
    const newEmail = document.getElementById('newRecipientInput').value.trim();
    if (newEmail && validateEmail(newEmail)) {
      const currentRecipients = recipients ? recipients + ', ' + newEmail : newEmail;
      setRecipients(currentRecipients);
      document.getElementById('newRecipientInput').value = '';
    }
  };

  return (
    <Container fluid className="email-sender">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Send Email</h4>
              <div>
                <Button
                  color="outline-secondary"
                  className="me-2"
                  onClick={() => setShowPreviewModal(true)}
                  disabled={!selectedTemplate}
                >
                  <FaEye className="me-1" />
                  Preview
                </Button>
                <Button
                  color="primary"
                  className="me-2"
                  onClick={handleSendEmail}
                  disabled={sendingEmail || !selectedTemplate}
                >
                  {sendingEmail ? (
                    <Spinner animation="border" size="sm" className="me-1" />
                  ) : (
                    <FaPaperPlane className="me-1" />
                  )}
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </Button>
                <Button color="secondary" onClick={onClose}>
                  <FaTimes className="me-1" />
                  Cancel
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Success Alert */}
              {emailSent && (
                <Alert color="success">
                  Email sent successfully to {recipientList.length} recipient
                  {recipientList.length !== 1 ? 's' : ''}!
                </Alert>
              )}

              {/* Error Alert */}
              {error && (
                <Alert color="danger" toggle={clearEmailTemplateError}>
                  {error}
                </Alert>
              )}

              <Row>
                {/* Email Form */}
                <Col lg={8}>
                  <Form>
                    {/* Template Selection */}
                    <Form.Group className="mb-3">
                      <Form.Label>Select Template *</Form.Label>
                      <Form.Select
                        value={selectedTemplate?._id || ''}
                        onChange={e => {
                          const template = templates.find(t => t._id === e.target.value);
                          handleTemplateSelect(template);
                        }}
                        isInvalid={!!validationErrors.template}
                      >
                        <option value="">Choose a template...</option>
                        {templates.map(template => (
                          <option key={template._id} value={template._id}>
                            {template.name} - {template.subject}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.template}
                      </Form.Control.Feedback>
                    </Form.Group>

                    {/* Recipients */}
                    <Form.Group className="mb-3">
                      <Form.Label>Recipients *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={recipients}
                        onChange={e => setRecipients(e.target.value)}
                        isInvalid={!!validationErrors.recipients}
                        placeholder="Enter email addresses separated by commas, semicolons, or new lines"
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.recipients}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        You can enter multiple email addresses separated by commas, semicolons, or
                        new lines
                      </Form.Text>

                      {/* Quick add recipient */}
                      <div className="mt-2 d-flex">
                        <Form.Control
                          type="email"
                          id="newRecipientInput"
                          placeholder="Add recipient email"
                          className="me-2"
                          onKeyPress={e => e.key === 'Enter' && addRecipientFromInput()}
                        />
                        <Button color="outline-primary" size="sm" onClick={addRecipientFromInput}>
                          <FaPlus />
                        </Button>
                      </div>
                    </Form.Group>

                    {/* Sender Credentials */}
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Sender Email *</Form.Label>
                          <Form.Control
                            type="email"
                            value={senderCredentials.email}
                            onChange={e =>
                              setSenderCredentials(prev => ({ ...prev, email: e.target.value }))
                            }
                            isInvalid={!!validationErrors.senderEmail}
                            placeholder="your-email@example.com"
                          />
                          <Form.Control.Feedback type="invalid">
                            {validationErrors.senderEmail}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Sender Password *</Form.Label>
                          <Form.Control
                            type="password"
                            value={senderCredentials.password}
                            onChange={e =>
                              setSenderCredentials(prev => ({ ...prev, password: e.target.value }))
                            }
                            isInvalid={!!validationErrors.senderPassword}
                            placeholder="Your email password or app password"
                          />
                          <Form.Control.Feedback type="invalid">
                            {validationErrors.senderPassword}
                          </Form.Control.Feedback>
                          <Form.Text className="text-muted">
                            Use app-specific password for Gmail
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Variable Values */}
                    {selectedTemplate &&
                      selectedTemplate.variables &&
                      selectedTemplate.variables.length > 0 && (
                        <Card className="mb-3">
                          <Card.Header>
                            <h6 className="mb-0">Template Variables</h6>
                          </Card.Header>
                          <Card.Body>
                            <Row>
                              {selectedTemplate.variables.map((variable, index) => (
                                <Col md={6} key={variable.name} className="mb-3">
                                  <Form.Group>
                                    <Form.Label>
                                      {variable.label}
                                      {variable.required && <span className="text-danger"> *</span>}
                                    </Form.Label>
                                    {variable.type === 'textarea' ? (
                                      <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={variableValues[variable.name] || ''}
                                        onChange={e =>
                                          handleVariableChange(variable.name, e.target.value)
                                        }
                                        isInvalid={!!validationErrors[variable.name]}
                                      />
                                    ) : (
                                      <Form.Control
                                        type={variable.type}
                                        value={variableValues[variable.name] || ''}
                                        onChange={e =>
                                          handleVariableChange(variable.name, e.target.value)
                                        }
                                        isInvalid={!!validationErrors[variable.name]}
                                      />
                                    )}
                                    <Form.Control.Feedback type="invalid">
                                      {validationErrors[variable.name]}
                                    </Form.Control.Feedback>
                                  </Form.Group>
                                </Col>
                              ))}
                            </Row>
                          </Card.Body>
                        </Card>
                      )}
                  </Form>
                </Col>

                {/* Template Info Panel */}
                <Col lg={4}>
                  {selectedTemplate ? (
                    <Card>
                      <Card.Header>
                        <h6 className="mb-0">Template Info</h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-2">
                          <strong>Name:</strong> {selectedTemplate.name}
                        </div>
                        <div className="mb-2">
                          <strong>Subject:</strong> {selectedTemplate.subject}
                        </div>
                        <div className="mb-2">
                          <strong>Variables:</strong>{' '}
                          <Badge bg="info">{selectedTemplate.variables?.length || 0}</Badge>
                        </div>
                        <div className="mb-2">
                          <strong>Status:</strong>{' '}
                          <Badge bg={selectedTemplate.is_active ? 'success' : 'secondary'}>
                            {selectedTemplate.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                          <div>
                            <strong>Variable List:</strong>
                            <ListGroup flush className="mt-2">
                              {selectedTemplate.variables.map(variable => (
                                <ListGroup.Item key={variable.name} className="px-0 py-1">
                                  <small>
                                    <code>{`{{${variable.name}}}`}</code> - {variable.label}
                                    {variable.required && (
                                      <Badge bg="warning" size="sm" className="ms-1">
                                        Required
                                      </Badge>
                                    )}
                                  </small>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  ) : (
                    <Card>
                      <Card.Body className="text-center text-muted">
                        <p>Select a template to see details</p>
                      </Card.Body>
                    </Card>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal isOpen={showPreviewModal} toggle={() => setShowPreviewModal(false)} size="lg">
        <Modal.Header toggle={() => setShowPreviewModal(false)}>
          <Modal.Title>Email Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTemplate && (
            <>
              <div className="mb-3">
                <strong>Subject:</strong> {getPreviewContent().subject}
              </div>
              <div className="mb-3">
                <strong>Recipients:</strong> {parseRecipients(recipients).join(', ')}
              </div>
              <div dangerouslySetInnerHTML={{ __html: getPreviewContent().content }} />
              <div className="mt-3">
                <small className="text-muted">
                  This is how your email will look when sent. Variables without values are shown as
                  [Label].
                </small>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button color="secondary" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

const mapStateToProps = state => ({
  templates: state.emailTemplates.templates,
  loading: state.emailTemplates.loading,
  error: state.emailTemplates.error,
  sendingEmail: state.emailTemplates.sendingEmail,
  emailSent: state.emailTemplates.emailSent,
});

const mapDispatchToProps = {
  fetchEmailTemplates,
  sendEmailWithTemplate,
  clearEmailTemplateError,
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailSender);
