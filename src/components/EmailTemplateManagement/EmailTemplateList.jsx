import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  InputGroup,
  Input,
  Badge,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from 'reactstrap';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaPencilAlt,
  FaTags,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import {
  fetchEmailTemplates,
  deleteEmailTemplate,
  setSearchTerm,
  clearEmailTemplateError,
} from '../../actions/emailTemplateActions';
import './EmailTemplateList.css';

const EmailTemplateList = ({
  templates,
  loading,
  error,
  searchTerm,
  totalCount,
  fetchEmailTemplates,
  deleteEmailTemplate,
  setSearchTerm,
  clearEmailTemplateError,
  onCreateTemplate,
  onEditTemplate,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Skeleton loading component
  const SkeletonLoader = ({ width = '100%', height = '20px', className = '' }) => (
    <div className={`skeleton-loader ${className}`} style={{ width, height }} />
  );
  useEffect(() => {
    fetchEmailTemplates(searchTerm);
  }, [fetchEmailTemplates, searchTerm]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearEmailTemplateError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearEmailTemplateError]);

  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = template => {
    setTemplateToDelete(template);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (templateToDelete) {
      try {
        await deleteEmailTemplate(templateToDelete._id);
        setShowDeleteModal(false);
        setTemplateToDelete(null);
      } catch (error) {
        // Error is handled by Redux action
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setTemplateToDelete(null);
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVariableCount = variables => {
    return variables ? variables.length : 0;
  };

  return (
    <div className="email-template-list">
      {/* Header */}
      <div className="list-header">
        <div className="d-flex justify-content-between align-items-center">
          <h2>Email Templates</h2>
          <Button color="primary" onClick={onCreateTemplate}>
            <FaPlus className="me-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <Row className="align-items-center">
          <Col md={6}>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <Input
                type="text"
                placeholder="Search templates by name or subject..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </Col>
          <Col md={6} className="d-flex align-items-center justify-content-end">
            <div className="templates-count">
              {totalCount} template{totalCount !== 1 ? 's' : ''} found
            </div>
          </Col>
        </Row>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert color="danger" toggle={clearEmailTemplateError}>
          {error}
        </Alert>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="loading-state">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <div>Loading templates...</div>
        </div>
      )}

      {/* Templates Table */}
      {!loading && (
        <div className="templates-table">
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Variables</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <h5>{searchTerm ? 'No templates found' : 'No email templates found'}</h5>
                      <p>
                        {searchTerm
                          ? 'Try adjusting your search terms or filters.'
                          : 'Get started by creating your first email template.'}
                      </p>
                      {!searchTerm && (
                        <Button color="primary" onClick={onCreateTemplate}>
                          <FaPlus className="me-2" />
                          Create your first template
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : loading ? (
                // Skeleton loading rows
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td>
                      <SkeletonLoader width="200px" height="16px" className="mb-1" />
                      <SkeletonLoader width="150px" height="14px" />
                    </td>
                    <td>
                      <SkeletonLoader width="60px" height="20px" />
                    </td>
                    <td>
                      <SkeletonLoader width="100px" height="14px" />
                    </td>
                    <td>
                      <SkeletonLoader width="100px" height="14px" />
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <SkeletonLoader width="32px" height="32px" />
                        <SkeletonLoader width="32px" height="32px" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                templates.map(template => (
                  <tr key={template._id}>
                    <td>
                      <div className="template-name">{template.name}</div>
                      <div className="template-subject">{template.subject}</div>
                    </td>
                    <td>
                      <div className="variables-count">
                        <FaTags />
                        {getVariableCount(template.variables)}
                      </div>
                    </td>
                    <td>
                      <div className="date-text">{formatDate(template.created_at)}</div>
                    </td>
                    <td>
                      <div className="date-text">{formatDate(template.updated_at)}</div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          color="outline-primary"
                          size="sm"
                          onClick={() => onEditTemplate(template)}
                          title="Edit Template"
                          style={{
                            backgroundColor: '#fd7e14',
                            borderColor: '#fd7e14',
                            color: '#ffffff',
                          }}
                        >
                          <FaPencilAlt />
                        </Button>
                        <Button
                          color="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteClick(template)}
                          title="Delete Template"
                          style={{
                            backgroundColor: '#dc3545',
                            borderColor: '#dc3545',
                            color: '#ffffff',
                          }}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} toggle={handleDeleteCancel}>
        <ModalHeader toggle={handleDeleteCancel}>Confirm Delete</ModalHeader>
        <ModalBody>
          Are you sure you want to delete the template &quot;{templateToDelete?.name}&quot;? This
          action cannot be undone.
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const mapStateToProps = state => ({
  templates: state.emailTemplates.templates,
  loading: state.emailTemplates.loading,
  error: state.emailTemplates.error,
  searchTerm: state.emailTemplates.searchTerm,
  totalCount: state.emailTemplates.totalCount,
});

const mapDispatchToProps = {
  fetchEmailTemplates,
  deleteEmailTemplate,
  setSearchTerm,
  clearEmailTemplateError,
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailTemplateList);
