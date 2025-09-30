import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Card,
  CardBody,
  Alert,
  Badge,
} from 'reactstrap';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';

const QuestionSetEditor = ({ isOpen, toggle, questionSet = null, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General',
    targetRole: 'General',
    questions: [],
    isDefault: false,
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    questionType: 'textbox',
    isRequired: false,
    options: [],
    placeholder: '',
    validationRules: {},
  });

  const [newOption, setNewOption] = useState('');
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);

  const { auth } = useSelector(state => state);
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

  const questionTypes = [
    { value: 'textbox', label: 'Short Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'radio', label: 'Multiple Choice' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'date', label: 'Date' },
    { value: 'file', label: 'File Upload' },
  ];

  useEffect(() => {
    if (isOpen) {
      if (questionSet) {
        // Editing existing question set
        setFormData({
          name: questionSet.name || '',
          description: questionSet.description || '',
          category: questionSet.category || 'General',
          targetRole: questionSet.targetRole || 'General',
          questions: questionSet.questions || [],
          isDefault: questionSet.isDefault || false,
        });
      } else {
        // Creating new question set
        resetForm();
      }
      resetCurrentQuestion();
    }
  }, [isOpen, questionSet]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'General',
      targetRole: 'General',
      questions: [],
      isDefault: false,
    });
  };

  const resetCurrentQuestion = () => {
    setCurrentQuestion({
      questionText: '',
      questionType: 'textbox',
      isRequired: false,
      options: [],
      placeholder: '',
      validationRules: {},
    });
    setNewOption('');
    setEditingQuestionIndex(-1);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addOption = () => {
    if (newOption.trim()) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()],
      }));
      setNewOption('');
    }
  };

  const removeOption = index => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const addQuestion = () => {
    if (!currentQuestion.questionText.trim()) {
      toast.error('Question text is required');
      return;
    }

    const needsOptions = ['checkbox', 'radio', 'dropdown'].includes(currentQuestion.questionType);
    if (needsOptions && currentQuestion.options.length === 0) {
      toast.error('Please add at least one option for this question type');
      return;
    }

    const question = {
      ...currentQuestion,
      questionText: currentQuestion.questionText.trim(),
      placeholder: currentQuestion.placeholder.trim(),
    };

    if (editingQuestionIndex >= 0) {
      // Update existing question
      const updatedQuestions = [...formData.questions];
      updatedQuestions[editingQuestionIndex] = question;
      setFormData(prev => ({ ...prev, questions: updatedQuestions }));
      toast.success('Question updated');
    } else {
      // Add new question
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, question],
      }));
      toast.success('Question added');
    }

    resetCurrentQuestion();
  };

  const editQuestion = index => {
    const question = formData.questions[index];
    setCurrentQuestion(question);
    setEditingQuestionIndex(index);
  };

  const deleteQuestion = index => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
    resetCurrentQuestion();
    toast.success('Question deleted');
  };

  const moveQuestion = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.questions.length) return;

    const questions = [...formData.questions];
    [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];

    setFormData(prev => ({ ...prev, questions }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Question set name is required');
      return;
    }

    if (formData.questions.length === 0) {
      toast.error('Please add at least one question');
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
      if (questionSet) {
        // Update existing question set
        response = await axios.put(ENDPOINTS.QUESTION_SET_BY_ID(questionSet._id), requestData);
      } else {
        // Create new question set
        response = await axios.post(ENDPOINTS.QUESTION_SETS, requestData);
      }

      toast.success(`Question set ${questionSet ? 'updated' : 'created'} successfully`);

      if (onSave) {
        onSave(response.data.questionSet);
      }

      toggle();
    } catch (error) {
      // Error saving question set - could be logged to error reporting service
      toast.error(error.response?.data?.message || 'Failed to save question set');
    }
  };

  const needsOptions = ['checkbox', 'radio', 'dropdown'].includes(currentQuestion.questionType);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {questionSet ? 'Edit Question Set' : 'Create New Question Set'}
      </ModalHeader>
      <ModalBody>
        <Form>
          <Row>
            <Col md={8}>
              <FormGroup>
                <Label for="questionSetName">Name *</Label>
                <Input
                  type="text"
                  id="questionSetName"
                  value={formData.name}
                  onChange={e => handleFormChange('name', e.target.value)}
                  placeholder="Enter question set name..."
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="category">Category *</Label>
                <Input
                  type="select"
                  id="category"
                  value={formData.category}
                  onChange={e => handleFormChange('category', e.target.value)}
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

          <Row>
            <Col md={8}>
              <FormGroup>
                <Label for="description">Description</Label>
                <Input
                  type="textarea"
                  id="description"
                  value={formData.description}
                  onChange={e => handleFormChange('description', e.target.value)}
                  placeholder="Describe this question set..."
                  rows="2"
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="targetRole">Target Role</Label>
                <Input
                  type="text"
                  id="targetRole"
                  value={formData.targetRole}
                  onChange={e => handleFormChange('targetRole', e.target.value)}
                  placeholder="e.g. Software Engineer"
                />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup check>
            <Label check>
              <Input
                type="checkbox"
                checked={formData.isDefault}
                onChange={e => handleFormChange('isDefault', e.target.checked)}
              />
              Set as default for this category
            </Label>
          </FormGroup>

          <hr />

          <h6>Questions ({formData.questions.length})</h6>

          {/* Question Builder */}
          <Card className="mb-3">
            <CardBody>
              <h6 className="card-title">
                {editingQuestionIndex >= 0 ? 'Edit Question' : 'Add New Question'}
              </h6>

              <Row>
                <Col md={8}>
                  <FormGroup>
                    <Label for="questionText">Question Text *</Label>
                    <Input
                      type="textarea"
                      id="questionText"
                      value={currentQuestion.questionText}
                      onChange={e => handleQuestionChange('questionText', e.target.value)}
                      placeholder="Enter your question..."
                      rows="2"
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="questionType">Question Type *</Label>
                    <Input
                      type="select"
                      id="questionType"
                      value={currentQuestion.questionType}
                      onChange={e => handleQuestionChange('questionType', e.target.value)}
                    >
                      {questionTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={8}>
                  <FormGroup>
                    <Label for="placeholder">Placeholder Text</Label>
                    <Input
                      type="text"
                      id="placeholder"
                      value={currentQuestion.placeholder}
                      onChange={e => handleQuestionChange('placeholder', e.target.value)}
                      placeholder="Enter placeholder text..."
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup check className="mt-4">
                    <Label check>
                      <Input
                        type="checkbox"
                        checked={currentQuestion.isRequired}
                        onChange={e => handleQuestionChange('isRequired', e.target.checked)}
                      />
                      Required
                    </Label>
                  </FormGroup>
                </Col>
              </Row>

              {needsOptions && (
                <FormGroup>
                  <Label>Options</Label>
                  <div className="d-flex mb-2">
                    <Input
                      type="text"
                      value={newOption}
                      onChange={e => setNewOption(e.target.value)}
                      placeholder="Enter option..."
                      onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addOption())}
                    />
                    <Button color="primary" onClick={addOption} className="ml-2">
                      Add
                    </Button>
                  </div>
                  <div>
                    {currentQuestion.options.map((option, index) => (
                      <Badge key={index} color="secondary" className="mr-2 mb-2 p-2">
                        {option}
                        <Button
                          close
                          size="sm"
                          className="ml-2"
                          onClick={() => removeOption(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </FormGroup>
              )}

              <Button
                color={editingQuestionIndex >= 0 ? 'warning' : 'success'}
                onClick={addQuestion}
              >
                {editingQuestionIndex >= 0 ? 'Update Question' : 'Add Question'}
              </Button>

              {editingQuestionIndex >= 0 && (
                <Button color="secondary" onClick={resetCurrentQuestion} className="ml-2">
                  Cancel Edit
                </Button>
              )}
            </CardBody>
          </Card>

          {/* Questions List */}
          {formData.questions.length > 0 && (
            <div>
              <h6>Current Questions</h6>
              {formData.questions.map((question, index) => (
                <Card key={index} className="mb-2">
                  <CardBody className="py-2">
                    <Row className="align-items-center">
                      <Col>
                        <div>
                          <strong>Q{index + 1}:</strong> {question.questionText}
                        </div>
                        <small className="text-muted">
                          Type: {questionTypes.find(t => t.value === question.questionType)?.label}
                          {question.isRequired && (
                            <Badge color="warning" className="ml-2">
                              Required
                            </Badge>
                          )}
                        </small>
                      </Col>
                      <Col xs="auto">
                        <Button
                          size="sm"
                          color="link"
                          onClick={() => moveQuestion(index, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          size="sm"
                          color="link"
                          onClick={() => moveQuestion(index, 'down')}
                          disabled={index === formData.questions.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          size="sm"
                          color="info"
                          onClick={() => editQuestion(index)}
                          className="mr-1"
                        >
                          Edit
                        </Button>
                        <Button size="sm" color="danger" onClick={() => deleteQuestion(index)}>
                          Delete
                        </Button>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSave}>
          {questionSet ? 'Update Question Set' : 'Create Question Set'}
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default QuestionSetEditor;
