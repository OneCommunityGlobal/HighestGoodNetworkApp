import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Alert,
  Spinner,
} from 'reactstrap';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import { hasPermissionSimple } from '~/utils/permissions';

function reportQuestionSetError(message, error) {
  console.error(message, error);
  toast.error(message);
}

function getSampleQuestionKey(question) {
  if (question?._id) return String(question._id);
  return `${question?.questionText || 'question'}-${question?.questionType || 'textbox'}`;
}

const sampleQuestionShape = PropTypes.shape({
  _id: PropTypes.string,
  questionText: PropTypes.string,
  questionType: PropTypes.string,
});

function SampleQuestionListItem({ question }) {
  return <li className="text-sm">• {question.questionText}</li>;
}

SampleQuestionListItem.propTypes = {
  question: sampleQuestionShape.isRequired,
};

function QuestionSetCard({
  questionSet,
  currentFormId,
  canCreate,
  canEdit,
  canDelete,
  onImport,
  onClone,
  onEdit,
  onDelete,
}) {
  const {
    name,
    description,
    category,
    questions: questionList = [],
    isDefault,
    usageCount = 0,
  } = questionSet;

  return (
    <Card className="mb-3">
      <CardHeader>
        <Row className="align-items-center">
          <Col>
            <h6 className="mb-0">{name}</h6>
            <small className="text-muted">
              {questionList.length} questions • {category}
              {isDefault && (
                <Badge color="primary" className="ml-2">
                  Default
                </Badge>
              )}
            </small>
          </Col>
          <Col xs="auto">
            <Badge color="info">{usageCount} uses</Badge>
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        {description && <p className="text-muted mb-2">{description}</p>}

        <div className="mb-3">
          <small className="text-muted">Sample Questions:</small>
          <ul className="list-unstyled mt-1">
            {questionList.slice(0, 3).map(question => (
              <SampleQuestionListItem key={getSampleQuestionKey(question)} question={question} />
            ))}
            {questionList.length > 3 && (
              <li className="text-muted text-sm">...and {questionList.length - 3} more</li>
            )}
          </ul>
        </div>

        <Row>
          <Col>
            <Button
              color="primary"
              size="sm"
              onClick={() => onImport(questionSet)}
              disabled={!currentFormId}
            >
              Import All Questions
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              color="secondary"
              size="sm"
              className="mr-2"
              onClick={() => onClone(questionSet)}
              disabled={!canCreate}
            >
              Clone
            </Button>
            {canEdit && (
              <Button
                color="warning"
                size="sm"
                className="mr-2"
                onClick={() => onEdit(questionSet)}
              >
                Edit
              </Button>
            )}
            {canDelete && (
              <Button color="danger" size="sm" onClick={() => onDelete(questionSet)}>
                Delete
              </Button>
            )}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}

QuestionSetCard.propTypes = {
  questionSet: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    questions: PropTypes.arrayOf(sampleQuestionShape).isRequired,
    isDefault: PropTypes.bool,
    usageCount: PropTypes.number,
  }).isRequired,
  currentFormId: PropTypes.string,
  canCreate: PropTypes.bool,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
  onImport: PropTypes.func.isRequired,
  onClone: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

QuestionSetCard.defaultProps = {
  currentFormId: null,
  canCreate: false,
  canEdit: false,
  canDelete: false,
};

const QuestionSetManager = ({
  isOpen,
  toggle,
  onQuestionSetSelect,
  onCreateQuestionSet,
  onEditQuestionSet,
  currentFormId,
}) => {
  const [questionSets, setQuestionSets] = useState([]);
  const [filteredQuestionSets, setFilteredQuestionSets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const { auth } = useSelector(state => state);
  const userPermissions = auth?.user?.permissions?.frontPermissions || [];
  const userRole = auth?.user?.role;

  const categories = [
    'All',
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
    if (isOpen) {
      fetchQuestionSets();
    }
  }, [isOpen]);

  useEffect(() => {
    filterQuestionSets();
  }, [questionSets, selectedCategory, searchTerm]);

  const fetchQuestionSets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ENDPOINTS.QUESTION_SETS);
      setQuestionSets(response.data.questionSets || []);
    } catch (error) {
      reportQuestionSetError('Failed to fetch question sets', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestionSets = () => {
    let filtered = questionSets;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(qs => qs.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        qs =>
          qs.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          qs.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredQuestionSets(filtered);
  };

  const canCreateQuestionSets = () => {
    return hasPermissionSimple(userPermissions, 'createFormQuestions') || userRole === 'Owner';
  };

  const canEditQuestionSets = () => {
    return hasPermissionSimple(userPermissions, 'editFormQuestions') || userRole === 'Owner';
  };

  const canDeleteQuestionSets = () => {
    return hasPermissionSimple(userPermissions, 'deleteFormQuestions') || userRole === 'Owner';
  };

  const handleImportQuestions = async (selectedSet, selectedQuestions = null) => {
    if (!currentFormId) {
      toast.error('No form selected for import');
      return;
    }

    const questionCount = selectedSet.questions?.length ?? 0;

    try {
      const importData = {
        questionSetId: selectedSet._id,
        includeAll: selectedQuestions === null,
        selectedQuestions: selectedQuestions || [],
        requestor: {
          requestorId: auth.user.userid,
          role: userRole,
        },
      };

      await axios.post(ENDPOINTS.IMPORT_QUESTIONS(currentFormId), importData);
      toast.success(
        `Imported ${
          selectedQuestions ? selectedQuestions.length : questionCount
        } questions successfully`,
      );

      if (onQuestionSetSelect) {
        onQuestionSetSelect(selectedSet);
      }

      toggle();
    } catch (error) {
      reportQuestionSetError('Failed to import questions', error);
    }
  };

  const handleCloneQuestionSet = async selectedSet => {
    if (!canCreateQuestionSets()) {
      toast.error('You do not have permission to clone question sets');
      return;
    }

    try {
      const cloneData = {
        newName: `${selectedSet.name} (Copy)`,
        requestor: {
          requestorId: auth.user.userid,
          role: userRole,
        },
      };

      await axios.post(ENDPOINTS.CLONE_QUESTION_SET(selectedSet._id), cloneData);
      toast.success('Question set cloned successfully');
      fetchQuestionSets();
    } catch (error) {
      reportQuestionSetError('Failed to clone question set', error);
    }
  };

  const handleDeleteQuestionSet = async selectedSet => {
    if (!canDeleteQuestionSets()) {
      toast.error('You do not have permission to delete question sets');
      return;
    }

    if (
      globalThis.confirm(
        'Are you sure you want to delete this question set? This action cannot be undone.',
      )
    ) {
      try {
        const deleteData = {
          requestor: {
            requestorId: auth.user.userid,
            role: userRole,
          },
        };

        await axios.delete(ENDPOINTS.QUESTION_SET_BY_ID(selectedSet._id), { data: deleteData });
        toast.success('Question set deleted successfully');
        fetchQuestionSets();
      } catch (error) {
        console.error('Failed to delete question set', error);
        toast.error(error.response?.data?.message || 'Failed to delete question set');
      }
    }
  };

  const handleEditQuestionSet = selectedSet => {
    if (onEditQuestionSet) {
      onEditQuestionSet(selectedSet);
    }
    toggle();
  };

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} size="lg">
        <ModalHeader toggle={toggle}>Question Set Library</ModalHeader>
        <ModalBody>
          {!currentFormId && (
            <Alert color="warning">
              Please save your form first before importing questions from question sets.
            </Alert>
          )}

          <Row className="mb-3">
            <Col md={6}>
              <FormGroup>
                <Label for="categoryFilter">Filter by Category</Label>
                <Input
                  type="select"
                  id="categoryFilter"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="searchTerm">Search Question Sets</Label>
                <Input
                  type="text"
                  id="searchTerm"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </FormGroup>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center">
              <Spinner color="primary" />
              <p>Loading question sets...</p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filteredQuestionSets.length === 0 ? (
                <Alert color="info">
                  No question sets found.{' '}
                  {canCreateQuestionSets() && 'Create your first question set to get started!'}
                </Alert>
              ) : (
                filteredQuestionSets.map(qs => (
                  <QuestionSetCard
                    key={qs._id}
                    questionSet={qs}
                    currentFormId={currentFormId}
                    canCreate={canCreateQuestionSets()}
                    canEdit={canEditQuestionSets()}
                    canDelete={canDeleteQuestionSets()}
                    onImport={handleImportQuestions}
                    onClone={handleCloneQuestionSet}
                    onEdit={handleEditQuestionSet}
                    onDelete={handleDeleteQuestionSet}
                  />
                ))
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {canCreateQuestionSets() && (
            <Button
              color="success"
              onClick={() => {
                if (onCreateQuestionSet) {
                  onCreateQuestionSet();
                }
                toggle();
              }}
            >
              Create New Question Set
            </Button>
          )}
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Question Set Creation/Edit Modal will be added in next component */}
    </>
  );
};

QuestionSetManager.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onQuestionSetSelect: PropTypes.func,
  onCreateQuestionSet: PropTypes.func,
  onEditQuestionSet: PropTypes.func,
  currentFormId: PropTypes.string,
};

QuestionSetManager.defaultProps = {
  onQuestionSetSelect: undefined,
  onCreateQuestionSet: undefined,
  onEditQuestionSet: undefined,
  currentFormId: null,
};

export default QuestionSetManager;
