import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Badge,
  Alert,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import { hasPermissionSimple } from '~/utils/permissions';
import QuestionSetManager from './QuestionSetManager';
import QuestionSetEditor from './QuestionSetEditor';

const EnhancedJobFormBuilder = () => {
  const [activeTab, setActiveTab] = useState('form');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    fixedFields: {
      includePersonalInfo: true,
      includeBasicInfo: true,
      includeExperience: true,
      includeAvailability: true,
    },
    jobLinks: {
      specificJobLink: '',
      generalLinks: [],
    },
    questions: [],
    questionSets: [],
    settings: {
      allowDuplicateSubmissions: false,
      requireLogin: false,
      autoSaveProgress: true,
      showProgressBar: true,
    },
  });

  const [currentFormId, setCurrentFormId] = useState(null);
  const [showQuestionSetManager, setShowQuestionSetManager] = useState(false);
  const [showQuestionSetEditor, setShowQuestionSetEditor] = useState(false);
  const [editingQuestionSet, setEditingQuestionSet] = useState(null);
  const [newGeneralLink, setNewGeneralLink] = useState({ title: '', url: '', description: '' });

  const { auth } = useSelector(state => state);
  const userPermissions = auth?.user?.permissions?.frontPermissions || [];
  const userRole = auth?.user?.role;

  const categories = [
    'General',
    'Engineering',
    'Marketing',
    'Design',
    'Management',
    'Data Analysis',
    'Content Creation',
    'Business Development',
    'Other',
  ];

  useEffect(() => {
    // Load existing form if available
    loadFirstAvailableForm();
  }, []);

  const formatFormData = form => ({
    title: form.title || '',
    description: form.description || '',
    category: form.category || 'General',
    fixedFields: form.fixedFields || {
      includePersonalInfo: true,
      includeBasicInfo: true,
      includeExperience: true,
      includeAvailability: true,
    },
    jobLinks: form.jobLinks || { specificJobLink: '', generalLinks: [] },
    questions: form.questions || [],
    questionSets: form.questionSets || [],
    settings: form.settings || {
      allowDuplicateSubmissions: false,
      requireLogin: false,
      autoSaveProgress: true,
      showProgressBar: true,
    },
  });

  const loadFormById = async formId => {
    try {
      if (!formId) return;
      const response = await axios.get(ENDPOINTS.GET_JOB_FORM(formId));
      if (response.data?.form) {
        setFormData(formatFormData(response.data.form));
      }
    } catch (error) {
      toast.error('Failed to refresh form details');
    }
  };

  const loadFirstAvailableForm = async () => {
    try {
      const response = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS);
      if (response.data && response.data.length > 0) {
        const firstForm = response.data[0];
        setCurrentFormId(firstForm._id);
        setFormData(formatFormData(firstForm));
      }
    } catch (error) {
      // Error loading forms - could be logged to error reporting service
      toast.error('Failed to load forms');
    }
  };

  const canManageForms = () => {
    return hasPermissionSimple(userPermissions, 'manageJobForms') || userRole === 'Owner';
  };

  const canCreateQuestionSets = () => {
    return hasPermissionSimple(userPermissions, 'createFormQuestions') || userRole === 'Owner';
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedFormChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const addGeneralLink = () => {
    if (!newGeneralLink.title || !newGeneralLink.url) {
      toast.error('Title and URL are required for general links');
      return;
    }

    if (formData.jobLinks.generalLinks.length >= 5) {
      toast.error('Maximum 5 general links allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      jobLinks: {
        ...prev.jobLinks,
        generalLinks: [...prev.jobLinks.generalLinks, newGeneralLink],
      },
    }));

    setNewGeneralLink({ title: '', url: '', description: '' });
    toast.success('General link added');
  };

  const removeGeneralLink = index => {
    setFormData(prev => ({
      ...prev,
      jobLinks: {
        ...prev.jobLinks,
        generalLinks: prev.jobLinks.generalLinks.filter((_, i) => i !== index),
      },
    }));
    toast.success('General link removed');
  };

  const handleSaveForm = async () => {
    if (!canManageForms()) {
      toast.error('You do not have permission to manage job forms');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Form title is required');
      return;
    }

    try {
      const requestData = {
        ...formData,
        requestor: {
          requestorId: auth.user.userid,
          role: userRole,
        },
      };

      let response;
      if (currentFormId) {
        requestData.formId = currentFormId;
        response = await axios.put(ENDPOINTS.UPDATE_JOB_FORM, requestData);
      } else {
        response = await axios.post(ENDPOINTS.CREATE_JOB_FORM, requestData);
        setCurrentFormId(response.data.form._id);
      }

      toast.success('Form saved successfully');
      if (response?.data?.form?._id) {
        await loadFormById(response.data.form._id);
      }
    } catch (error) {
      // Error saving form - could be logged to error reporting service
      toast.error('Failed to save form');
    }
  };

  const handleCreateNewForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'General',
      fixedFields: {
        includePersonalInfo: true,
        includeBasicInfo: true,
        includeExperience: true,
        includeAvailability: true,
      },
      jobLinks: {
        specificJobLink: '',
        generalLinks: [],
      },
      questions: [],
      questionSets: [],
      settings: {
        allowDuplicateSubmissions: false,
        requireLogin: false,
        autoSaveProgress: true,
        showProgressBar: true,
      },
    });
    setCurrentFormId(null);
    toast.info('New form created. Remember to save it.');
  };

  const handleQuestionSetSaved = () => {
    // Refresh the form or handle as needed
    setShowQuestionSetEditor(false);
    setEditingQuestionSet(null);
  };

  return (
    <Container fluid className="enhanced-job-form-builder">
      <Row>
        <Col>
          <Card>
            <CardHeader>
              <Row className="align-items-center">
                <Col>
                  <h4 className="mb-0">Job Application Form Builder</h4>
                  <small className="text-muted">
                    Create and manage job application forms with reusable question sets
                  </small>
                </Col>
                <Col xs="auto">
                  {canManageForms() && (
                    <>
                      <Button
                        color="outline-primary"
                        onClick={handleCreateNewForm}
                        className="mr-2"
                      >
                        New Form
                      </Button>
                      <Button color="primary" onClick={handleSaveForm}>
                        Save Form
                      </Button>
                    </>
                  )}
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {!canManageForms() && (
                <Alert color="warning">
                  You do not have permission to manage job forms. Contact an administrator to get
                  the required permissions.
                </Alert>
              )}

              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={activeTab === 'form' ? 'active' : ''}
                    onClick={() => setActiveTab('form')}
                  >
                    Form Settings
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === 'fields' ? 'active' : ''}
                    onClick={() => setActiveTab('fields')}
                  >
                    Fixed Fields
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === 'links' ? 'active' : ''}
                    onClick={() => setActiveTab('links')}
                  >
                    Job Links
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === 'questions' ? 'active' : ''}
                    onClick={() => setActiveTab('questions')}
                  >
                    Questions ({formData.questions.length})
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === 'settings' ? 'active' : ''}
                    onClick={() => setActiveTab('settings')}
                  >
                    Settings
                  </NavLink>
                </NavItem>
              </Nav>

              <TabContent activeTab={activeTab} className="mt-3">
                <TabPane tabId="form">
                  <Row>
                    <Col md={8}>
                      <FormGroup>
                        <Label for="formTitle">Form Title *</Label>
                        <Input
                          type="text"
                          id="formTitle"
                          value={formData.title}
                          onChange={e => handleFormChange('title', e.target.value)}
                          placeholder="Enter form title..."
                          disabled={!canManageForms()}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for="formCategory">Category</Label>
                        <Input
                          type="select"
                          id="formCategory"
                          value={formData.category}
                          onChange={e => handleFormChange('category', e.target.value)}
                          disabled={!canManageForms()}
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>

                  <FormGroup>
                    <Label for="formDescription">Description</Label>
                    <Input
                      type="textarea"
                      id="formDescription"
                      value={formData.description}
                      onChange={e => handleFormChange('description', e.target.value)}
                      placeholder="Describe this job application form..."
                      rows="3"
                      disabled={!canManageForms()}
                    />
                  </FormGroup>
                </TabPane>

                <TabPane tabId="fields">
                  <p className="text-muted mb-3">
                    Configure which standard fields should appear in all forms of this type.
                  </p>

                  <Row>
                    <Col md={6}>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={formData.fixedFields.includePersonalInfo}
                            onChange={e =>
                              handleNestedFormChange(
                                'fixedFields',
                                'includePersonalInfo',
                                e.target.checked,
                              )
                            }
                            disabled={!canManageForms()}
                          />
                          Personal Information (Name, Email, Phone)
                        </Label>
                      </FormGroup>

                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={formData.fixedFields.includeBasicInfo}
                            onChange={e =>
                              handleNestedFormChange(
                                'fixedFields',
                                'includeBasicInfo',
                                e.target.checked,
                              )
                            }
                            disabled={!canManageForms()}
                          />
                          Basic Information (Title, Location)
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={formData.fixedFields.includeExperience}
                            onChange={e =>
                              handleNestedFormChange(
                                'fixedFields',
                                'includeExperience',
                                e.target.checked,
                              )
                            }
                            disabled={!canManageForms()}
                          />
                          Experience Level
                        </Label>
                      </FormGroup>

                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={formData.fixedFields.includeAvailability}
                            onChange={e =>
                              handleNestedFormChange(
                                'fixedFields',
                                'includeAvailability',
                                e.target.checked,
                              )
                            }
                            disabled={!canManageForms()}
                          />
                          Availability (Start Date, Hours/Week)
                        </Label>
                      </FormGroup>
                    </Col>
                  </Row>
                </TabPane>

                <TabPane tabId="links">
                  <FormGroup>
                    <Label for="specificJobLink">Specific Job Advertisement Link</Label>
                    <Input
                      type="url"
                      id="specificJobLink"
                      value={formData.jobLinks.specificJobLink}
                      onChange={e =>
                        handleNestedFormChange('jobLinks', 'specificJobLink', e.target.value)
                      }
                      placeholder="https://example.com/job-posting"
                      disabled={!canManageForms()}
                    />
                    <small className="text-muted">
                      Link to the specific job posting for this form (optional)
                    </small>
                  </FormGroup>

                  <hr />

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 className="mb-0">General Job Links</h6>
                      <small className="text-muted">
                        Add 2-5 general links for applicants when no specific job link is available
                      </small>
                    </div>
                  </div>

                  {formData.jobLinks.generalLinks.length > 0 && (
                    <div className="mb-3">
                      {formData.jobLinks.generalLinks.map((link, index) => (
                        <Card key={index} className="mb-2">
                          <CardBody className="py-2">
                            <Row className="align-items-center">
                              <Col>
                                <div>
                                  <strong>{link.title}</strong>
                                  <br />
                                  <small className="text-muted">{link.url}</small>
                                  {link.description && (
                                    <>
                                      <br />
                                      <small>{link.description}</small>
                                    </>
                                  )}
                                </div>
                              </Col>
                              <Col xs="auto">
                                <Button
                                  size="sm"
                                  color="danger"
                                  onClick={() => removeGeneralLink(index)}
                                  disabled={!canManageForms()}
                                >
                                  Remove
                                </Button>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  )}

                  {canManageForms() && formData.jobLinks.generalLinks.length < 5 && (
                    <Card>
                      <CardBody>
                        <h6>Add General Link</h6>
                        <Row>
                          <Col md={4}>
                            <FormGroup>
                              <Label for="linkTitle">Title *</Label>
                              <Input
                                type="text"
                                id="linkTitle"
                                value={newGeneralLink.title}
                                onChange={e =>
                                  setNewGeneralLink(prev => ({ ...prev, title: e.target.value }))
                                }
                                placeholder="e.g. Careers Page"
                              />
                            </FormGroup>
                          </Col>
                          <Col md={4}>
                            <FormGroup>
                              <Label for="linkUrl">URL *</Label>
                              <Input
                                type="url"
                                id="linkUrl"
                                value={newGeneralLink.url}
                                onChange={e =>
                                  setNewGeneralLink(prev => ({ ...prev, url: e.target.value }))
                                }
                                placeholder="https://example.com"
                              />
                            </FormGroup>
                          </Col>
                          <Col md={4}>
                            <FormGroup>
                              <Label for="linkDescription">Description</Label>
                              <Input
                                type="text"
                                id="linkDescription"
                                value={newGeneralLink.description}
                                onChange={e =>
                                  setNewGeneralLink(prev => ({
                                    ...prev,
                                    description: e.target.value,
                                  }))
                                }
                                placeholder="Brief description"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Button color="primary" onClick={addGeneralLink}>
                          Add Link
                        </Button>
                      </CardBody>
                    </Card>
                  )}
                </TabPane>

                <TabPane tabId="questions">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 className="mb-0">Form Questions</h6>
                      <small className="text-muted">Manage custom questions for this form</small>
                    </div>
                    <div>
                      <Button
                        color="outline-primary"
                        onClick={() => setShowQuestionSetManager(true)}
                        className="mr-2"
                        disabled={!currentFormId}
                      >
                        Import from Question Sets
                      </Button>
                      {canCreateQuestionSets() && (
                        <Button color="success" onClick={() => setShowQuestionSetEditor(true)}>
                          Create Question Set
                        </Button>
                      )}
                    </div>
                  </div>

                  {!currentFormId && (
                    <Alert color="info">
                      Please save your form first before managing questions.
                    </Alert>
                  )}

                  {formData.questions.length === 0 ? (
                    <Alert color="secondary">
                      No custom questions added yet. Use &quot;Import from Question Sets&quot; to
                      add questions from reusable question sets.
                    </Alert>
                  ) : (
                    <div>
                      {formData.questions.map((question, index) => (
                        <Card key={index} className="mb-2">
                          <CardBody className="py-2">
                            <Row className="align-items-center">
                              <Col>
                                <div>
                                  <strong>Q{index + 1}:</strong> {question.questionText}
                                </div>
                                <small className="text-muted">
                                  Type: {question.questionType}
                                  {question.isRequired && (
                                    <Badge color="warning" className="ml-2">
                                      Required
                                    </Badge>
                                  )}
                                  {question.fromQuestionSet && (
                                    <Badge color="info" className="ml-2">
                                      From Question Set
                                    </Badge>
                                  )}
                                </small>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabPane>

                <TabPane tabId="settings">
                  <h6>Form Behavior Settings</h6>

                  <Row>
                    <Col md={6}>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={formData.settings.allowDuplicateSubmissions}
                            onChange={e =>
                              handleNestedFormChange(
                                'settings',
                                'allowDuplicateSubmissions',
                                e.target.checked,
                              )
                            }
                            disabled={!canManageForms()}
                          />
                          Allow duplicate submissions
                        </Label>
                      </FormGroup>

                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={formData.settings.requireLogin}
                            onChange={e =>
                              handleNestedFormChange('settings', 'requireLogin', e.target.checked)
                            }
                            disabled={!canManageForms()}
                          />
                          Require user login
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={formData.settings.autoSaveProgress}
                            onChange={e =>
                              handleNestedFormChange(
                                'settings',
                                'autoSaveProgress',
                                e.target.checked,
                              )
                            }
                            disabled={!canManageForms()}
                          />
                          Auto-save progress
                        </Label>
                      </FormGroup>

                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={formData.settings.showProgressBar}
                            onChange={e =>
                              handleNestedFormChange(
                                'settings',
                                'showProgressBar',
                                e.target.checked,
                              )
                            }
                            disabled={!canManageForms()}
                          />
                          Show progress bar
                        </Label>
                      </FormGroup>
                    </Col>
                  </Row>
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Question Set Manager Modal */}
      <QuestionSetManager
        isOpen={showQuestionSetManager}
        toggle={() => setShowQuestionSetManager(false)}
        currentFormId={currentFormId}
        onQuestionSetSelect={() => {
          // Refresh form data after import
          if (currentFormId) {
            loadFormById(currentFormId);
          } else {
            loadFirstAvailableForm();
          }
        }}
        onCreateQuestionSet={() => {
          setEditingQuestionSet(null);
          setShowQuestionSetEditor(true);
        }}
        onEditQuestionSet={questionSet => {
          setEditingQuestionSet(questionSet);
          setShowQuestionSetEditor(true);
        }}
      />

      {/* Question Set Editor Modal */}
      <QuestionSetEditor
        isOpen={showQuestionSetEditor}
        toggle={() => setShowQuestionSetEditor(false)}
        questionSet={editingQuestionSet}
        onSave={savedQuestionSet => {
          handleQuestionSetSaved();
          if (currentFormId) {
            loadFormById(currentFormId);
          }
        }}
      />
    </Container>
  );
};

export default EnhancedJobFormBuilder;
