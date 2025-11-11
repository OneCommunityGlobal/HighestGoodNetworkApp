import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import {
  Row,
  Col,
  Table,
  Button,
  Input,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { FaPlus, FaSearch, FaInfo, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import {
  fetchEmailTemplates,
  deleteEmailTemplate,
  setSearchTerm,
  clearEmailTemplateError,
} from '../../../../actions/emailTemplateActions';
import './EmailTemplateList.css';

const EmailTemplateList = ({
  templates,
  loading,
  error,
  searchTerm,
  fetchEmailTemplates,
  deleteEmailTemplate,
  setSearchTerm,
  clearEmailTemplateError,
  onCreateTemplate,
  onEditTemplate,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [templateToShow, setTemplateToShow] = useState(null);
  const [loadingTemplateInfo, setLoadingTemplateInfo] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Constants
  const PAGE_SIZE = 10; // Standard page size for templates

  // Removed shimmer/skeleton in favor of simple spinners
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Show toast notifications for errors from Redux (only once per error)
  const [lastError, setLastError] = useState(null);
  useEffect(() => {
    if (error && error !== lastError) {
      setLastError(error);
      toast.error(`Failed to load templates: ${error}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error, lastError]);

  // Fetch templates with optimized parameters
  useEffect(() => {
    fetchEmailTemplates({
      search: debouncedSearch,
      page: currentPage,
      limit: PAGE_SIZE,
      sortBy,
      sortOrder,
    });
  }, [fetchEmailTemplates, debouncedSearch, currentPage, sortBy, sortOrder]);

  const handleSearch = useCallback(
    e => {
      const value = e.target.value;
      if (typeof value === 'string') {
        setSearchTerm(value);
      }
    },
    [setSearchTerm],
  );

  const handleDeleteClick = useCallback(template => {
    setTemplateToDelete(template);
    setShowDeleteModal(true);
  }, []);

  const handleInfoClick = useCallback(async template => {
    if (!template || !template._id) {
      toast.error('Invalid template selected');
      return;
    }

    setLoadingTemplateInfo(true);
    setTemplateToShow(template);
    setShowInfoModal(true);

    try {
      // Fetch full template data including variables
      // Backend returns: { success: true, template: {...} }
      const response = await axios.get(`${ENDPOINTS.EMAIL_TEMPLATES}/${template._id}`);
      if (response.data.success && response.data.template) {
        setTemplateToShow(response.data.template);
      } else {
        throw new Error(response.data.message || 'Invalid response format');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching template details:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to load template details';
      toast.error(errorMessage);
      setTemplateToShow(null);
    } finally {
      setLoadingTemplateInfo(false);
    }
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!templateToDelete || !templateToDelete._id) {
      toast.error('Invalid template selected for deletion');
      return;
    }

    try {
      await deleteEmailTemplate(templateToDelete._id);
      setShowDeleteModal(false);
      setTemplateToDelete(null);
      toast.success(`Template "${templateToDelete.name}" deleted successfully`);
      // Refetch current page to keep list in sync after deletion
      await fetchEmailTemplates({
        search: debouncedSearch,
        page: currentPage,
        limit: PAGE_SIZE,
        sortBy,
        sortOrder,
      });
    } catch (error) {
      toast.error(`Failed to delete template: ${error.message || 'Unknown error'}`);
      // Keep modal open on error so user can retry
    }
  }, [
    templateToDelete,
    deleteEmailTemplate,
    fetchEmailTemplates,
    debouncedSearch,
    currentPage,
    sortBy,
    sortOrder,
  ]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false);
    setTemplateToDelete(null);
  }, []);

  // Manual retry function
  const handleManualRetry = useCallback(async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    setRetryAttempts(prev => prev + 1);

    try {
      // Clear any existing error state before retrying
      clearEmailTemplateError();

      await fetchEmailTemplates({
        search: debouncedSearch,
        page: currentPage,
        sortBy,
        sortOrder,
      });
      setRetryAttempts(0); // Reset on success
      toast.success('Templates loaded successfully');
    } catch (err) {
      toast.error(`Retry failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsRetrying(false);
    }
  }, [
    fetchEmailTemplates,
    debouncedSearch,
    currentPage,
    sortBy,
    sortOrder,
    isRetrying,
    clearEmailTemplateError,
  ]);

  const formatDate = useCallback(dateString => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }, []);

  const handleSortChange = useCallback((field, order) => {
    if (field && order && ['asc', 'desc'].includes(order)) {
      setSortBy(field);
      setSortOrder(order);
      setCurrentPage(1); // Reset to first page when sorting changes
    }
  }, []);

  const handlePageChange = useCallback(page => {
    if (typeof page === 'number' && page > 0) {
      setCurrentPage(page);
      // Scroll to top when page changes
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        // Fallback for browsers that don't support smooth scrolling
        window.scrollTo(0, 0);
      }
    }
  }, []);

  // Templates are already sorted and filtered by the API
  const sortedAndFilteredTemplates = useMemo(() => {
    if (!templates || !Array.isArray(templates)) {
      return [];
    }
    return templates.filter(template => {
      return (
        template && template._id && typeof template._id === 'string' && template._id.length > 0
      );
    });
  }, [templates]);

  return (
    <div className="email-template-list">
      {/* Controls Section - Only show when templates are successfully loaded */}
      {!loading && !error && (
        <div className="controls-section">
          <Row className="align-items-center mb-2 gx-0">
            <Col lg={8} md={12} className="px-0">
              <div className="d-flex gap-3 align-items-center">
                <div className="search-container flex-grow-1">
                  <FaSearch className="search-icon" />
                  <Input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={handleSearch}
                    aria-label="Search templates"
                  />
                </div>
                <div className="sort-container" style={{ width: '200px', flexShrink: 0 }}>
                  <Input
                    type="select"
                    value={`${sortBy}-${sortOrder}`}
                    onChange={e => {
                      const [field, order] = e.target.value.split('-');
                      handleSortChange(field, order);
                    }}
                    aria-label="Sort templates"
                  >
                    <option value="created_at-desc">Newest First</option>
                    <option value="created_at-asc">Oldest First</option>
                    <option value="updated_at-desc">Recently Updated</option>
                    <option value="updated_at-asc">Least Recently Updated</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                  </Input>
                </div>
              </div>
            </Col>
            <Col lg={4} md={12} className="px-0">
              <div className="create-button-container d-flex justify-content-lg-end justify-content-center">
                <Button
                  color="primary"
                  onClick={onCreateTemplate}
                  style={{ width: 'auto', minWidth: '140px' }}
                >
                  <FaPlus className="me-2" />
                  Create Template
                </Button>
              </div>
            </Col>
          </Row>

          {/* Results summary */}
          <Row>
            <Col>
              <div className="templates-count">
                {debouncedSearch
                  ? `Showing ${sortedAndFilteredTemplates.length} templates for "${debouncedSearch}"`
                  : `Showing ${sortedAndFilteredTemplates.length} templates`}
              </div>
            </Col>
          </Row>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="loading-state">
          <FaSpinner className="fa-spin me-2" />
          <div>Loading templates...</div>
        </div>
      )}

      {/* Error State - On parent background */}
      {error && !loading && (
        <div className="error-state-parent-bg">
          <h5 className="text-danger">Failed to load templates</h5>
          <div className="error-messages">
            {error.split('\n').map((line, index) => (
              <p key={index} className="error-line">
                {line}
              </p>
            ))}
          </div>
          {retryAttempts > 0 && (
            <small className="text-muted d-block mb-3">Retry attempt: {retryAttempts}</small>
          )}
          <div className="error-actions">
            <Button
              color="primary"
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="retry-button"
              size="sm"
            >
              {isRetrying ? (
                <>
                  <FaSpinner className="fa-spin me-1" />
                  Retrying...
                </>
              ) : (
                <>
                  <FaSearch className="me-1" />
                  Retry
                </>
              )}
            </Button>
            <Button
              color="outline-primary"
              onClick={onCreateTemplate}
              className="create-button"
              size="sm"
            >
              <FaPlus className="me-1" />
              Create Template
            </Button>
          </div>
        </div>
      )}

      {/* Templates Table */}
      {!loading && !error && (
        <div className="templates-table">
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Template Name</th>
                <th className="d-none d-md-table-cell">Created By</th>
                <th className="d-none d-lg-table-cell">Created</th>
                <th className="d-none d-lg-table-cell">Last Updated</th>
                <th className="d-none d-xl-table-cell">Last Updated By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!sortedAndFilteredTemplates || sortedAndFilteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan="6">
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
              ) : (
                sortedAndFilteredTemplates
                  .map(template => {
                    if (!template || !template._id) {
                      return null; // Skip invalid templates
                    }

                    return (
                      <tr key={template._id}>
                        <td>
                          <div className="template-name">
                            {template.name && typeof template.name === 'string'
                              ? template.name
                              : 'Unnamed Template'}
                          </div>
                        </td>
                        <td className="d-none d-md-table-cell">
                          <div className="created-by">
                            {template.created_by &&
                            template.created_by.firstName &&
                            template.created_by.lastName &&
                            typeof template.created_by.firstName === 'string' &&
                            typeof template.created_by.lastName === 'string'
                              ? `${template.created_by.firstName} ${template.created_by.lastName}`.trim()
                              : 'Unknown'}
                          </div>
                        </td>
                        <td className="d-none d-lg-table-cell">
                          <div className="date-text">
                            {template.created_at ? formatDate(template.created_at) : 'Unknown'}
                          </div>
                        </td>
                        <td className="d-none d-lg-table-cell">
                          <div className="date-text">
                            {template.updated_at ? formatDate(template.updated_at) : 'Unknown'}
                          </div>
                        </td>
                        <td className="d-none d-xl-table-cell">
                          <div className="updated-by">
                            {template.updated_by &&
                            template.updated_by.firstName &&
                            template.updated_by.lastName &&
                            typeof template.updated_by.firstName === 'string' &&
                            typeof template.updated_by.lastName === 'string'
                              ? `${template.updated_by.firstName} ${template.updated_by.lastName}`.trim()
                              : 'Unknown'}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button
                              color="outline-info"
                              size="sm"
                              onClick={() => handleInfoClick(template)}
                              title="Show Template Details & Preview"
                              aria-label={`Show details for ${template.name || 'template'}`}
                              className="action-btn info-btn"
                            >
                              <FaInfo />
                            </Button>
                            <Button
                              color="outline-primary"
                              size="sm"
                              onClick={() => {
                                if (template && template._id) {
                                  onEditTemplate(template);
                                } else {
                                  toast.error('Cannot edit template: Invalid template data');
                                }
                              }}
                              title="Edit Template"
                              aria-label={`Edit template ${template.name || 'template'}`}
                              className="action-btn edit-btn"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              color="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteClick(template)}
                              title="Delete Template"
                              aria-label={`Delete template ${template.name || 'template'}`}
                              className="action-btn delete-btn"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                  .filter(Boolean) // Remove null entries
              )}
            </tbody>
          </Table>

          {/* Pagination Controls */}
          {/* Removed pagination controls (PAGE_SIZE, handlePageChange, and their JSX) */}
        </div>
      )}

      {/* Template Info Modal */}
      <Modal isOpen={showInfoModal} toggle={() => setShowInfoModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setShowInfoModal(false)}>
          Template Details: {templateToShow?.name}
        </ModalHeader>
        <ModalBody>
          {loadingTemplateInfo ? (
            <div className="text-center">
              <FaSpinner className="fa-spin me-2" />
              <div className="mt-2">Loading template details...</div>
            </div>
          ) : templateToShow ? (
            <div>
              <div className="mb-3">
                <strong>Template Name:</strong> {templateToShow.name || 'Unnamed Template'}
              </div>
              <div className="mb-3">
                <strong>Created By:</strong>{' '}
                {templateToShow.created_by
                  ? `${templateToShow.created_by.firstName || ''} ${templateToShow.created_by
                      .lastName || ''}`.trim() || 'Unknown'
                  : 'Unknown'}
              </div>
              <div className="mb-3">
                <strong>Updated By:</strong>{' '}
                {templateToShow.updated_by &&
                templateToShow.updated_by.firstName &&
                templateToShow.updated_by.lastName
                  ? `${templateToShow.updated_by.firstName} ${templateToShow.updated_by.lastName}`
                  : 'Not specified'}
              </div>
              <div className="mb-3">
                <strong>Created At:</strong> {formatDate(templateToShow.created_at)}
              </div>
              <div className="mb-3">
                <strong>Updated At:</strong> {formatDate(templateToShow.updated_at)}
              </div>
              {templateToShow.variables &&
                Array.isArray(templateToShow.variables) &&
                templateToShow.variables.length > 0 && (
                  <div className="mb-3">
                    <strong>Variables:</strong>
                    <div className="mt-2">
                      {templateToShow.variables.map((variable, index) => (
                        <Badge key={index} color="secondary" className="me-2 mb-1">
                          {variable.name || 'Unnamed'} ({variable.label || 'No Label'})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              <div className="mb-3">
                <strong>Subject:</strong> {templateToShow.subject || 'No subject'}
              </div>
              {templateToShow.html_content && (
                <div className="mb-3">
                  <strong>Content Preview:</strong>
                  <div
                    className="mt-2 p-3 border rounded"
                    style={{ maxHeight: '400px', overflow: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: templateToShow.html_content }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted">
              <p>No template data available</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowInfoModal(false)}>
            Close
          </Button>
          <Button
            color="primary"
            onClick={() => {
              if (templateToShow && templateToShow._id) {
                setShowInfoModal(false);
                onEditTemplate(templateToShow);
              } else {
                toast.error('Cannot edit template: Invalid template data');
              }
            }}
          >
            Edit Template
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} toggle={handleDeleteCancel}>
        <ModalHeader toggle={handleDeleteCancel}>Confirm Delete</ModalHeader>
        <ModalBody>
          {templateToDelete ? (
            <>
              Are you sure you want to delete the template &quot;
              {templateToDelete.name || 'Unnamed Template'}&quot;? This action cannot be undone.
            </>
          ) : (
            <div className="text-center text-muted">
              <p>No template selected for deletion</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleDeleteConfirm} disabled={!templateToDelete}>
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
});

const mapDispatchToProps = {
  fetchEmailTemplates,
  deleteEmailTemplate,
  setSearchTerm,
  clearEmailTemplateError,
};

// PropTypes for type checking
EmailTemplateList.propTypes = {
  templates: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  searchTerm: PropTypes.string,
  fetchEmailTemplates: PropTypes.func.isRequired,
  deleteEmailTemplate: PropTypes.func.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  clearEmailTemplateError: PropTypes.func.isRequired,
  onCreateTemplate: PropTypes.func.isRequired,
  onEditTemplate: PropTypes.func.isRequired,
};

// Default props
EmailTemplateList.defaultProps = {
  templates: [],
  loading: false,
  error: null,
  searchTerm: '',
};

// Memoize the component to prevent unnecessary re-renders
const MemoizedEmailTemplateList = memo(EmailTemplateList);

export default connect(mapStateToProps, mapDispatchToProps)(MemoizedEmailTemplateList);
