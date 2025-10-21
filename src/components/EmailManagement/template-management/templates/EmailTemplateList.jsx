import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Input,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from 'reactstrap';
import {
  FaPlus,
  FaSearch,
  FaTags,
  FaExclamationTriangle,
  FaInfo,
  FaFilter,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [templateToShow, setTemplateToShow] = useState(null);
  const [loadingTemplateInfo, setLoadingTemplateInfo] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  // Skeleton loading component
  const SkeletonLoader = ({ width = '100%', height = '20px', className = '' }) => (
    <div className={`skeleton-loader ${className}`} style={{ width, height }} />
  );
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Show toast notifications for errors from Redux
  useEffect(() => {
    if (error) {
      toast.error(`Failed to load templates: ${error}`);
    }
  }, [error]);

  // Fetch templates with optimized parameters
  useEffect(() => {
    fetchEmailTemplates({
      search: debouncedSearch,
      page: currentPage,
      sortBy,
      sortOrder,
    });
  }, [fetchEmailTemplates, debouncedSearch, currentPage, sortBy, sortOrder]);

  const handleSearch = useCallback(
    e => {
      setSearchTerm(e.target.value);
    },
    [setSearchTerm],
  );

  const handleDeleteClick = useCallback(template => {
    setTemplateToDelete(template);
    setShowDeleteModal(true);
  }, []);

  const handleInfoClick = useCallback(async template => {
    setLoadingTemplateInfo(true);
    setTemplateToShow(template);
    setShowInfoModal(true);

    try {
      // Fetch full template data including variables
      const response = await axios.get(`${ENDPOINTS.EMAIL_TEMPLATES}/${template._id}`);
      setTemplateToShow(response.data.template);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching template details:', error);
      toast.error('Failed to load template details');
    } finally {
      setLoadingTemplateInfo(false);
    }
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (templateToDelete) {
      try {
        await deleteEmailTemplate(templateToDelete._id);
        setShowDeleteModal(false);
        setTemplateToDelete(null);
        toast.success(`Template "${templateToDelete.name}" deleted successfully`);
      } catch (error) {
        toast.error(`Failed to delete template: ${error.message || 'Unknown error'}`);
      }
    }
  }, [templateToDelete, deleteEmailTemplate]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false);
    setTemplateToDelete(null);
  }, []);

  // Retry function for failed API calls

  const formatDate = useCallback(dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const handleSortChange = useCallback((field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page when sorting changes
  }, []);

  const handlePageChange = useCallback(page => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Templates are already sorted and filtered by the API
  const sortedAndFilteredTemplates = useMemo(() => templates, [templates]);

  return (
    <div className="email-template-list">
      {/* Controls Section */}
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
              Showing {sortedAndFilteredTemplates.length} of {totalCount} templates
              {debouncedSearch && ` for "${debouncedSearch}"`}
            </div>
          </Col>
        </Row>
      </div>

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
              ) : loading ? (
                // Skeleton loading rows
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td>
                      <SkeletonLoader width="200px" height="16px" />
                    </td>
                    <td className="d-none d-md-table-cell">
                      <SkeletonLoader width="120px" height="16px" />
                    </td>
                    <td className="d-none d-lg-table-cell">
                      <SkeletonLoader width="100px" height="14px" />
                    </td>
                    <td className="d-none d-lg-table-cell">
                      <SkeletonLoader width="100px" height="14px" />
                    </td>
                    <td className="d-none d-xl-table-cell">
                      <SkeletonLoader width="120px" height="16px" />
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <SkeletonLoader width="32px" height="32px" />
                        <SkeletonLoader width="32px" height="32px" />
                        <SkeletonLoader width="32px" height="32px" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                sortedAndFilteredTemplates
                  .map(template => {
                    if (!template || !template._id) {
                      return null; // Skip invalid templates
                    }

                    return (
                      <tr key={template._id}>
                        <td>
                          <div className="template-name">{template.name || 'Unnamed Template'}</div>
                        </td>
                        <td className="d-none d-md-table-cell">
                          <div className="created-by">
                            {template.created_by &&
                            template.created_by.firstName &&
                            template.created_by.lastName
                              ? `${template.created_by.firstName} ${template.created_by.lastName}`
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
                            template.updated_by.lastName
                              ? `${template.updated_by.firstName} ${template.updated_by.lastName}`
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
                              onClick={() => onEditTemplate(template)}
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
          {totalCount > 5 && (
            <div className="pagination-controls d-flex justify-content-between align-items-center mt-3">
              <div className="pagination-buttons d-flex align-items-center gap-3">
                <Button
                  color="outline-primary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="pagination-text mx-2">
                  Page {currentPage} of {Math.ceil(totalCount / 5)}
                </span>
                <Button
                  color="outline-primary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(totalCount / 5)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
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
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <div className="mt-2">Loading template details...</div>
            </div>
          ) : templateToShow ? (
            <div>
              <div className="mb-3">
                <strong>Template Name:</strong> {templateToShow.name}
              </div>
              <div className="mb-3">
                <strong>Created By:</strong>{' '}
                {templateToShow.created_by
                  ? `${templateToShow.created_by.firstName} ${templateToShow.created_by.lastName}`
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
              {templateToShow.variables && templateToShow.variables.length > 0 && (
                <div className="mb-3">
                  <strong>Variables:</strong>
                  <div className="mt-2">
                    {templateToShow.variables.map((variable, index) => (
                      <Badge key={index} color="secondary" className="me-2 mb-1">
                        {variable.name} ({variable.label})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="mb-3">
                <strong>Subject:</strong> {templateToShow.subject}
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
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowInfoModal(false)}>
            Close
          </Button>
          <Button
            color="primary"
            onClick={() => {
              setShowInfoModal(false);
              onEditTemplate(templateToShow);
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

// PropTypes for type checking
EmailTemplateList.propTypes = {
  templates: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  searchTerm: PropTypes.string,
  totalCount: PropTypes.number,
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
  totalCount: 0,
};

// Memoize the component to prevent unnecessary re-renders
const MemoizedEmailTemplateList = memo(EmailTemplateList);

export default connect(mapStateToProps, mapDispatchToProps)(MemoizedEmailTemplateList);
