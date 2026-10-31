import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  Container,
  Table,
  Button,
  Input,
  Label,
  Form,
  FormGroup,
  FormFeedback,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Spinner,
} from 'reactstrap';
import { toast } from 'react-toastify';
import {
  fetchLBUsers,
  updateLBUser,
  deleteLBUser,
  clearLBUsersError,
} from '../../../actions/lbDashboard/userManagementActions';
import styles from './LBUserManagement.module.css';

const LIMIT_OPTIONS = [5, 10, 20, 50];

const getUserId = user => user?._id || user?.id;

const formatCreatedAt = value => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LBUserManagement() {
  const dispatch = useDispatch();
  const history = useHistory();

  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const reduxUserMgmt = useSelector(state => state.lbUserManagement);

  const [users, setUsers] = useState(() => reduxUserMgmt?.users || []);
  const [page, setPage] = useState(() => reduxUserMgmt?.page || 1);
  const [limit, setLimit] = useState(() => reduxUserMgmt?.limit || 10);
  const [total, setTotal] = useState(() => reduxUserMgmt?.total || 0);
  const [totalPages, setTotalPages] = useState(() => reduxUserMgmt?.totalPages || 1);
  const [search, setSearch] = useState(() => reduxUserMgmt?.search || '');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(() => reduxUserMgmt?.error || null);
  const [errorStatus, setErrorStatus] = useState(() => reduxUserMgmt?.errorStatus || null);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [editErrors, setEditErrors] = useState({});
  const [modalError, setModalError] = useState(null);

  // Delete Confirmation Modal State
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const lastFetchKeyRef = useRef(null);

  // Sync with Redux state when updated externally
  useEffect(() => {
    if (!reduxUserMgmt) return;
    if (Array.isArray(reduxUserMgmt.users)) {
      setUsers(reduxUserMgmt.users);
    }
    if (typeof reduxUserMgmt.total === 'number') {
      setTotal(reduxUserMgmt.total);
    }
    if (typeof reduxUserMgmt.totalPages === 'number') {
      setTotalPages(reduxUserMgmt.totalPages);
    }
    if (reduxUserMgmt.error !== undefined) {
      setError(reduxUserMgmt.error);
    }
    if (reduxUserMgmt.errorStatus !== undefined) {
      setErrorStatus(reduxUserMgmt.errorStatus);
    }
  }, [
    reduxUserMgmt?.users,
    reduxUserMgmt?.total,
    reduxUserMgmt?.totalPages,
    reduxUserMgmt?.error,
    reduxUserMgmt?.errorStatus,
  ]);

  const loadUsers = useCallback(
    async (targetPage = page, targetLimit = limit, targetSearch = search) => {
      setLoading(true);
      setError(null);
      setErrorStatus(null);

      const result = await dispatch(
        fetchLBUsers({
          page: targetPage,
          limit: targetLimit,
          search: targetSearch,
        }),
      );

      setLoading(false);

      if (result && result.success && result.data) {
        setUsers(result.data.users || []);
        setTotal(result.data.total ?? 0);
        setTotalPages(result.data.totalPages ?? 1);
      } else if (result && !result.success) {
        setError(result.message || 'Failed to load users.');
        setErrorStatus(result.status || null);
        if (result.status === 401 && history?.push) {
          history.push('/lbdashboard/login');
        }
      }
    },
    [dispatch, history, page, limit, search],
  );

  useEffect(() => {
    const fetchKey = `${page}:${limit}:${search}`;
    if (lastFetchKeyRef.current === fetchKey) return;
    lastFetchKeyRef.current = fetchKey;
    loadUsers(page, limit, search);
  }, [page, limit, search, loadUsers]);

  const handleSearchChange = e => {
    const nextSearch = e.target.value;
    setSearch(nextSearch);
    setPage(1);
  };

  const handleSearchSubmit = e => {
    e.preventDefault();
    const fetchKey = `1:${limit}:${search}`;
    lastFetchKeyRef.current = fetchKey;
    if (page !== 1) {
      setPage(1);
    }
    loadUsers(1, limit, search);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
  };

  const handleLimitChange = e => {
    const nextLimit = Number(e.target.value) || 10;
    setLimit(nextLimit);
    setPage(1);
  };

  const handlePageChange = nextPage => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPage(nextPage);
  };

  // --- Edit User Handlers ---
  const openEditModal = user => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
    });
    setEditErrors({});
    setModalError(null);
  };

  const closeEditModal = () => {
    if (actionLoading) return;
    setEditingUser(null);
    setEditErrors({});
    setModalError(null);
  };

  const validateEditForm = formValues => {
    const validationErrors = {};
    if (!formValues.firstName || !formValues.firstName.trim()) {
      validationErrors.firstName = 'First name is required.';
    }
    if (!formValues.lastName || !formValues.lastName.trim()) {
      validationErrors.lastName = 'Last name is required.';
    }
    if (!formValues.email || !formValues.email.trim()) {
      validationErrors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(formValues.email.trim())) {
      validationErrors.email = 'Please enter a valid email address.';
    }
    return validationErrors;
  };

  const handleEditInputChange = e => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    if (!editingUser) return;

    const validationErrors = validateEditForm(editForm);
    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      return;
    }

    const userId = getUserId(editingUser);
    const payload = {
      firstName: editForm.firstName.trim(),
      lastName: editForm.lastName.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone ? editForm.phone.trim() : '',
    };

    setActionLoading(true);
    setModalError(null);

    const result = await dispatch(updateLBUser(userId, payload));
    setActionLoading(false);

    if (result && result.success) {
      const updatedUser = result.data || { ...editingUser, ...payload };
      setUsers(prev =>
        prev.map(u => (String(getUserId(u)) === String(userId) ? { ...u, ...updatedUser } : u)),
      );
      toast.success('User details updated successfully.');
      setEditingUser(null);
    } else {
      const errMsg = result?.message || 'Failed to update user details.';
      setModalError(errMsg);
      if (result?.status === 401 || result?.status === 403) {
        setError(errMsg);
        setErrorStatus(result.status);
        setEditingUser(null);
        if (result.status === 401 && history?.push) {
          history.push('/lbdashboard/login');
        }
      } else {
        toast.error(errMsg);
      }
    }
  };

  // --- Delete User Handlers ---
  const openDeleteModal = user => {
    setDeletingUser(user);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    if (actionLoading) return;
    setDeletingUser(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    const userId = getUserId(deletingUser);

    setActionLoading(true);
    setDeleteError(null);

    const result = await dispatch(deleteLBUser(userId));
    setActionLoading(false);

    if (result && result.success) {
      const remaining = users.filter(u => String(getUserId(u)) !== String(userId));
      setUsers(remaining);
      setTotal(prev => Math.max(0, prev - 1));
      toast.success('User deleted successfully.');
      setDeletingUser(null);

      if (remaining.length === 0 && page > 1) {
        setPage(page - 1);
      }
    } else {
      const errMsg = result?.message || 'Failed to delete user.';
      setDeleteError(errMsg);
      if (result?.status === 401 || result?.status === 403) {
        setError(errMsg);
        setErrorStatus(result.status);
        setDeletingUser(null);
        if (result.status === 401 && history?.push) {
          history.push('/lbdashboard/login');
        }
      } else {
        toast.error(errMsg);
      }
    }
  };

  const handleBack = () => {
    if (history?.push) {
      history.push('/lbdashboard');
    } else {
      globalThis.history.back();
    }
  };

  const handleDismissError = () => {
    setError(null);
    setErrorStatus(null);
    dispatch(clearLBUsersError());
  };

  const startIndex = users.length > 0 ? (page - 1) * limit + 1 : 0;
  const endIndex = users.length > 0 ? startIndex + users.length - 1 : 0;
  const effectiveTotal = Math.max(total, endIndex);

  return (
    <Container
      fluid
      className={`${styles.pageContainer} ${darkMode ? styles.darkContainer : ''}`}
      data-testid="lb-user-management"
    >
      {/* Header */}
      <header className={styles.headerBar}>
        <div className={styles.headerTitleGroup}>
          <h1 className={`${styles.pageTitle} ${darkMode ? styles.darkText : ''}`}>
            Listing &amp; Bidding Admin User Management
          </h1>
          <p className={`${styles.pageSubtitle} ${darkMode ? styles.darkSubtext : ''}`}>
            View, search, edit, and manage platform users
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button
            size="sm"
            onClick={handleBack}
            className={`${styles.backBtn} ${darkMode ? styles.darkBackBtn : ''}`}
          >
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* 401 Unauthorized State */}
      {errorStatus === 401 && (
        <Alert color="warning" className={styles.authErrorBanner} role="alert">
          <div>
            <strong>401 Unauthorized:</strong>{' '}
            {error || 'Your session has expired or you are not logged in. Please log in again.'}
          </div>
          <div className={styles.authErrorActions}>
            <Button color="primary" size="sm" onClick={() => history.push('/lbdashboard/login')}>
              Go to Login
            </Button>
          </div>
        </Alert>
      )}

      {/* 403 Forbidden State */}
      {errorStatus === 403 && (
        <Alert color="danger" className={styles.authErrorBanner} role="alert">
          <div>
            <strong>403 Forbidden — Access Denied:</strong>{' '}
            {error || 'Administrator privileges are required to view or manage users.'}
          </div>
          <div className={styles.authErrorActions}>
            <Button color="secondary" size="sm" onClick={handleBack}>
              Return to Dashboard
            </Button>
          </div>
        </Alert>
      )}

      {/* Generic Error Banner */}
      {error && errorStatus !== 401 && errorStatus !== 403 && (
        <Alert color="danger" toggle={handleDismissError} role="alert">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span>{error}</span>
            <Button color="danger" outline size="sm" onClick={() => loadUsers(page, limit, search)}>
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {/* Search & Page Size Controls */}
      <section className={`${styles.controlsCard} ${darkMode ? styles.darkCard : ''}`}>
        <div className={styles.controlsRow}>
          <Form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <div className={styles.searchInputWrapper}>
              <Input
                type="text"
                name="search"
                id="lb-user-search"
                aria-label="Search users"
                placeholder="Search by name or email..."
                value={search}
                onChange={handleSearchChange}
                className={`${styles.searchInput} ${darkMode ? styles.darkInput : ''}`}
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className={styles.clearSearchBtn}
                  aria-label="Clear search"
                  title="Clear search"
                >
                  &times;
                </button>
              )}
            </div>
            <Button type="submit" className={styles.searchSubmitBtn}>
              Search
            </Button>
          </Form>

          <div className={styles.limitControl}>
            <Label for="limit-select" className={`mb-0 ${darkMode ? styles.darkText : ''}`}>
              Rows per page:
            </Label>
            <Input
              type="select"
              id="limit-select"
              name="limit"
              aria-label="Rows per page"
              value={limit}
              onChange={handleLimitChange}
              className={`${styles.limitSelect} ${darkMode ? styles.darkInput : ''}`}
            >
              {LIMIT_OPTIONS.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Input>
          </div>
        </div>
      </section>

      {/* Users Data Table */}
      <section className={`${styles.tableCard} ${darkMode ? styles.darkCard : ''}`}>
        <div className={styles.tableResponsive}>
          <Table hover className={`${styles.usersTable} ${darkMode ? styles.darkTable : ''}`}>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className={styles.statusStateBox}>
                    <Spinner size="sm" color="primary" className="mr-2" />
                    <span className={darkMode ? styles.darkText : ''}>Loading users...</span>
                  </td>
                </tr>
              )}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan="6" className={styles.statusStateBox}>
                    <span className={darkMode ? styles.darkText : ''}>
                      No users found{search ? ` matching "${search}"` : ''}.
                    </span>
                  </td>
                </tr>
              )}

              {!loading &&
                users.map(user => {
                  const uid = getUserId(user) || user.email;
                  return (
                    <tr key={uid} data-testid={`user-row-${uid}`}>
                      <td>{user.firstName || '—'}</td>
                      <td>{user.lastName || '—'}</td>
                      <td>{user.email || '—'}</td>
                      <td>{user.phone || '—'}</td>
                      <td>{formatCreatedAt(user.createdAt || user.createdDate)}</td>
                      <td>
                        <div className={styles.actionCell}>
                          <Button
                            size="sm"
                            className={styles.editBtn}
                            onClick={() => openEditModal(user)}
                            aria-label={`Edit ${user.firstName || ''} ${user.lastName ||
                              ''}`.trim()}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            className={styles.deleteBtn}
                            onClick={() => openDeleteModal(user)}
                            aria-label={`Delete ${user.firstName || ''} ${user.lastName ||
                              ''}`.trim()}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div
          className={`${styles.paginationFooter} ${darkMode ? styles.darkPaginationFooter : ''}`}
        >
          <div className={`${styles.paginationSummary} ${darkMode ? styles.darkSubtext : ''}`}>
            {users.length > 0 ? (
              <span>
                Showing {startIndex} to {endIndex} of {effectiveTotal} users
              </span>
            ) : (
              <span>0 users</span>
            )}
          </div>

          <div className={styles.paginationControls}>
            <Button
              size="sm"
              color="secondary"
              outline={!darkMode}
              disabled={page <= 1 || loading}
              onClick={() => handlePageChange(page - 1)}
              className={styles.pageBtn}
              aria-label="Previous page"
            >
              Previous
            </Button>

            <span className={`${styles.pageIndicator} ${darkMode ? styles.darkText : ''}`}>
              Page {page} of {Math.max(1, totalPages)}
            </span>

            <Button
              size="sm"
              color="secondary"
              outline={!darkMode}
              disabled={page >= totalPages || loading}
              onClick={() => handlePageChange(page + 1)}
              className={styles.pageBtn}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        </div>
      </section>

      {/* Edit User Modal */}
      <Modal
        isOpen={Boolean(editingUser)}
        toggle={closeEditModal}
        centered
        contentClassName={darkMode ? styles.modalContentDark : ''}
      >
        <ModalHeader toggle={closeEditModal}>Edit User Details</ModalHeader>
        <Form noValidate onSubmit={handleEditSubmit}>
          <ModalBody>
            {modalError && (
              <Alert color="danger" role="alert">
                {modalError}
              </Alert>
            )}

            <FormGroup>
              <Label for="edit-firstName">First Name</Label>
              <Input
                id="edit-firstName"
                name="firstName"
                type="text"
                value={editForm.firstName}
                onChange={handleEditInputChange}
                invalid={Boolean(editErrors.firstName)}
                className={darkMode ? styles.darkInput : ''}
              />
              {editErrors.firstName && <FormFeedback>{editErrors.firstName}</FormFeedback>}
            </FormGroup>

            <FormGroup>
              <Label for="edit-lastName">Last Name</Label>
              <Input
                id="edit-lastName"
                name="lastName"
                type="text"
                value={editForm.lastName}
                onChange={handleEditInputChange}
                invalid={Boolean(editErrors.lastName)}
                className={darkMode ? styles.darkInput : ''}
              />
              {editErrors.lastName && <FormFeedback>{editErrors.lastName}</FormFeedback>}
            </FormGroup>

            <FormGroup>
              <Label for="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleEditInputChange}
                invalid={Boolean(editErrors.email)}
                className={darkMode ? styles.darkInput : ''}
              />
              {editErrors.email && <FormFeedback>{editErrors.email}</FormFeedback>}
            </FormGroup>

            <FormGroup>
              <Label for="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                name="phone"
                type="text"
                value={editForm.phone}
                onChange={handleEditInputChange}
                invalid={Boolean(editErrors.phone)}
                className={darkMode ? styles.darkInput : ''}
              />
              {editErrors.phone && <FormFeedback>{editErrors.phone}</FormFeedback>}
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={closeEditModal} disabled={actionLoading}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingUser)}
        toggle={closeDeleteModal}
        centered
        contentClassName={darkMode ? styles.modalContentDark : ''}
      >
        <ModalHeader toggle={closeDeleteModal}>Confirm Delete User</ModalHeader>
        <ModalBody>
          {deleteError && (
            <Alert color="danger" role="alert">
              {deleteError}
            </Alert>
          )}
          <p className="mb-0">
            Are you sure you want to delete{' '}
            <strong>
              {deletingUser?.firstName} {deletingUser?.lastName}
            </strong>{' '}
            ({deletingUser?.email})? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeDeleteModal} disabled={actionLoading}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleConfirmDelete} disabled={actionLoading}>
            {actionLoading ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
}

export default LBUserManagement;
