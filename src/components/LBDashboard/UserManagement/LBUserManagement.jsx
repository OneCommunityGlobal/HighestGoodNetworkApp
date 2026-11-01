import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
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
} from '../../../actions/lbdashboard/userManagementActions';
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

const isValidEmail = email => {
  const trimmed = String(email || '').trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0 || atIndex !== trimmed.lastIndexOf('@')) return false;
  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  const dotIndex = domain.indexOf('.');
  return (
    !local.includes(' ') && !domain.includes(' ') && dotIndex > 0 && dotIndex < domain.length - 1
  );
};

const validateEditForm = formValues => {
  const validationErrors = {};
  if (!formValues.firstName?.trim()) {
    validationErrors.firstName = 'First name is required.';
  }
  if (!formValues.lastName?.trim()) {
    validationErrors.lastName = 'Last name is required.';
  }
  if (!formValues.email?.trim()) {
    validationErrors.email = 'Email is required.';
  } else if (!isValidEmail(formValues.email)) {
    validationErrors.email = 'Please enter a valid email address.';
  }
  return validationErrors;
};

const cx = (...classes) => classes.filter(Boolean).join(' ');

function ManagementHeader({ darkMode, onBack }) {
  return (
    <header className={styles.headerBar}>
      <div className={styles.headerTitleGroup}>
        <h1 className={cx(styles.pageTitle, darkMode && styles.darkText)}>
          Listing &amp; Bidding Admin User Management
        </h1>
        <p className={cx(styles.pageSubtitle, darkMode && styles.darkSubtext)}>
          View, search, edit, and manage platform users
        </p>
      </div>
      <div className={styles.headerActions}>
        <Button
          size="sm"
          onClick={onBack}
          className={cx(styles.backBtn, darkMode && styles.darkBackBtn)}
        >
          Back to Dashboard
        </Button>
      </div>
    </header>
  );
}

function ErrorBanners({ errorStatus, error, onLogin, onBack, onDismiss, onRetry }) {
  if (errorStatus === 401) {
    return (
      <Alert color="warning" className={styles.authErrorBanner} role="alert">
        <div>
          <strong>401 Unauthorized:</strong>{' '}
          {error || 'Your session has expired or you are not logged in. Please log in again.'}
        </div>
        <div className={styles.authErrorActions}>
          <Button color="primary" size="sm" onClick={onLogin}>
            Go to Login
          </Button>
        </div>
      </Alert>
    );
  }

  if (errorStatus === 403) {
    return (
      <Alert color="danger" className={styles.authErrorBanner} role="alert">
        <div>
          <strong>403 Forbidden — Access Denied:</strong>{' '}
          {error || 'Administrator privileges are required to view or manage users.'}
        </div>
        <div className={styles.authErrorActions}>
          <Button color="secondary" size="sm" onClick={onBack}>
            Return to Dashboard
          </Button>
        </div>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert color="danger" toggle={onDismiss} role="alert">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span>{error}</span>
          <Button color="danger" outline size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </Alert>
    );
  }

  return null;
}

function SearchAndLimitBar({
  darkMode,
  search,
  limit,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onLimitChange,
}) {
  return (
    <section className={cx(styles.controlsCard, darkMode && styles.darkCard)}>
      <div className={styles.controlsRow}>
        <Form onSubmit={onSearchSubmit} className={styles.searchForm}>
          <div className={styles.searchInputWrapper}>
            <Input
              type="text"
              name="search"
              id="lb-user-search"
              aria-label="Search users"
              placeholder="Search by name or email..."
              value={search}
              onChange={onSearchChange}
              className={cx(styles.searchInput, darkMode && styles.darkInput)}
            />
            {search && (
              <button
                type="button"
                onClick={onClearSearch}
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
          <Label for="limit-select" className={cx('mb-0', darkMode && styles.darkText)}>
            Rows per page:
          </Label>
          <Input
            type="select"
            id="limit-select"
            name="limit"
            aria-label="Rows per page"
            value={limit}
            onChange={onLimitChange}
            className={cx(styles.limitSelect, darkMode && styles.darkInput)}
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
  );
}

function UsersTableRows({ loading, users, search, darkMode, onEdit, onDelete }) {
  if (loading) {
    return (
      <tr>
        <td colSpan="6" className={styles.statusStateBox}>
          <Spinner size="sm" color="primary" className="mr-2" />
          <span className={darkMode ? styles.darkText : ''}>Loading users...</span>
        </td>
      </tr>
    );
  }

  if (users.length === 0) {
    const emptyMsg = search ? `No users found matching "${search}".` : 'No users found.';
    return (
      <tr>
        <td colSpan="6" className={styles.statusStateBox}>
          <span className={darkMode ? styles.darkText : ''}>{emptyMsg}</span>
        </td>
      </tr>
    );
  }

  return users.map(user => {
    const uid = getUserId(user) || user.email;
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    const editLabel = fullName ? `Edit ${fullName}` : 'Edit';
    const deleteLabel = fullName ? `Delete ${fullName}` : 'Delete';

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
              onClick={() => onEdit(user)}
              aria-label={editLabel}
            >
              Edit
            </Button>
            <Button
              size="sm"
              className={styles.deleteBtn}
              onClick={() => onDelete(user)}
              aria-label={deleteLabel}
            >
              Delete
            </Button>
          </div>
        </td>
      </tr>
    );
  });
}

function PaginationBar({
  darkMode,
  usersCount,
  page,
  limit,
  total,
  totalPages,
  loading,
  onPageChange,
}) {
  const startIndex = usersCount > 0 ? (page - 1) * limit + 1 : 0;
  const endIndex = usersCount > 0 ? startIndex + usersCount - 1 : 0;
  const effectiveTotal = Math.max(total, endIndex);

  return (
    <div className={cx(styles.paginationFooter, darkMode && styles.darkPaginationFooter)}>
      <div className={cx(styles.paginationSummary, darkMode && styles.darkSubtext)}>
        {usersCount > 0 ? (
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
          onClick={() => onPageChange(page - 1)}
          className={styles.pageBtn}
          aria-label="Previous page"
        >
          Previous
        </Button>

        <span className={cx(styles.pageIndicator, darkMode && styles.darkText)}>
          Page {page} of {Math.max(1, totalPages)}
        </span>

        <Button
          size="sm"
          color="secondary"
          outline={!darkMode}
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(page + 1)}
          className={styles.pageBtn}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function EditUserModal({
  editingUser,
  editForm,
  editErrors,
  modalError,
  actionLoading,
  darkMode,
  onClose,
  onInputChange,
  onSubmit,
}) {
  const inputClass = darkMode ? styles.darkInput : '';
  return (
    <Modal
      isOpen={Boolean(editingUser)}
      toggle={onClose}
      centered
      contentClassName={darkMode ? styles.modalContentDark : ''}
    >
      <ModalHeader toggle={onClose}>Edit User Details</ModalHeader>
      <Form noValidate onSubmit={onSubmit}>
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
              onChange={onInputChange}
              invalid={Boolean(editErrors.firstName)}
              className={inputClass}
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
              onChange={onInputChange}
              invalid={Boolean(editErrors.lastName)}
              className={inputClass}
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
              onChange={onInputChange}
              invalid={Boolean(editErrors.email)}
              className={inputClass}
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
              onChange={onInputChange}
              invalid={Boolean(editErrors.phone)}
              className={inputClass}
            />
            {editErrors.phone && <FormFeedback>{editErrors.phone}</FormFeedback>}
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={onClose} disabled={actionLoading}>
            Cancel
          </Button>
          <Button color="primary" type="submit" disabled={actionLoading}>
            {actionLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

function DeleteUserModal({
  deletingUser,
  deleteError,
  actionLoading,
  darkMode,
  onClose,
  onConfirm,
}) {
  return (
    <Modal
      isOpen={Boolean(deletingUser)}
      toggle={onClose}
      centered
      contentClassName={darkMode ? styles.modalContentDark : ''}
    >
      <ModalHeader toggle={onClose}>Confirm Delete User</ModalHeader>
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
        <Button color="secondary" onClick={onClose} disabled={actionLoading}>
          Cancel
        </Button>
        <Button color="danger" onClick={onConfirm} disabled={actionLoading}>
          {actionLoading ? 'Deleting...' : 'Confirm Delete'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

ManagementHeader.propTypes = {
  darkMode: PropTypes.bool,
  onBack: PropTypes.func.isRequired,
};

ErrorBanners.propTypes = {
  errorStatus: PropTypes.number,
  error: PropTypes.string,
  onLogin: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
};

SearchAndLimitBar.propTypes = {
  darkMode: PropTypes.bool,
  search: PropTypes.string.isRequired,
  limit: PropTypes.number.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onSearchSubmit: PropTypes.func.isRequired,
  onClearSearch: PropTypes.func.isRequired,
  onLimitChange: PropTypes.func.isRequired,
};

UsersTableRows.propTypes = {
  loading: PropTypes.bool,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  search: PropTypes.string,
  darkMode: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

PaginationBar.propTypes = {
  darkMode: PropTypes.bool,
  usersCount: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  onPageChange: PropTypes.func.isRequired,
};

EditUserModal.propTypes = {
  editingUser: PropTypes.object,
  editForm: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
  }).isRequired,
  editErrors: PropTypes.object.isRequired,
  modalError: PropTypes.string,
  actionLoading: PropTypes.bool,
  darkMode: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

DeleteUserModal.propTypes = {
  deletingUser: PropTypes.object,
  deleteError: PropTypes.string,
  actionLoading: PropTypes.bool,
  darkMode: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export function LBUserManagement() {
  const dispatch = useDispatch();
  const history = useHistory();

  const darkMode = useSelector(state => Boolean(state.theme?.darkMode));
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

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [editErrors, setEditErrors] = useState({});
  const [modalError, setModalError] = useState(null);

  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const lastFetchKeyRef = useRef(null);

  const handleAuthRedirect = useCallback(
    status => {
      if (status === 401 && history?.push) {
        history.push('/lbdashboard/login');
      }
    },
    [history],
  );

  const applyMutationFailure = useCallback(
    (result, fallbackMessage, setLocalError, closeModalFn) => {
      const errMsg = result?.message || fallbackMessage;
      setLocalError(errMsg);
      const status = result?.status;
      if (status === 401 || status === 403) {
        setError(errMsg);
        setErrorStatus(status);
        closeModalFn(null);
        handleAuthRedirect(status);
      } else {
        toast.error(errMsg);
      }
    },
    [handleAuthRedirect],
  );

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

      if (result?.success && result.data) {
        setUsers(result.data.users || []);
        setTotal(result.data.total ?? 0);
        setTotalPages(result.data.totalPages ?? 1);
        return;
      }

      if (result && !result.success) {
        setError(result.message || 'Failed to load users.');
        setErrorStatus(result.status || null);
        handleAuthRedirect(result.status);
      }
    },
    [dispatch, handleAuthRedirect, page, limit, search],
  );

  useEffect(() => {
    const fetchKey = `${page}:${limit}:${search}`;
    if (lastFetchKeyRef.current === fetchKey) return;
    lastFetchKeyRef.current = fetchKey;
    loadUsers(page, limit, search);
  }, [page, limit, search, loadUsers]);

  const handleSearchChange = e => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSearchSubmit = e => {
    e.preventDefault();
    lastFetchKeyRef.current = `1:${limit}:${search}`;
    setPage(1);
    loadUsers(1, limit, search);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
  };

  const handleLimitChange = e => {
    setLimit(Number(e.target.value) || 10);
    setPage(1);
  };

  const handlePageChange = nextPage => {
    if (nextPage >= 1 && nextPage <= totalPages && nextPage !== page) {
      setPage(nextPage);
    }
  };

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
    if (!actionLoading) {
      setEditingUser(null);
      setEditErrors({});
      setModalError(null);
    }
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
      phone: editForm.phone?.trim() || '',
    };

    setActionLoading(true);
    setModalError(null);
    const result = await dispatch(updateLBUser(userId, payload));
    setActionLoading(false);

    if (result?.success) {
      const updatedUser = result.data || { ...editingUser, ...payload };
      setUsers(prev =>
        prev.map(u => (String(getUserId(u)) === String(userId) ? { ...u, ...updatedUser } : u)),
      );
      toast.success('User details updated successfully.');
      setEditingUser(null);
    } else {
      applyMutationFailure(result, 'Failed to update user details.', setModalError, setEditingUser);
    }
  };

  const openDeleteModal = user => {
    setDeletingUser(user);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    if (!actionLoading) {
      setDeletingUser(null);
      setDeleteError(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    const userId = getUserId(deletingUser);

    setActionLoading(true);
    setDeleteError(null);
    const result = await dispatch(deleteLBUser(userId));
    setActionLoading(false);

    if (result?.success) {
      const remaining = users.filter(u => String(getUserId(u)) !== String(userId));
      setUsers(remaining);
      setTotal(prev => Math.max(0, prev - 1));
      toast.success('User deleted successfully.');
      setDeletingUser(null);
      if (remaining.length === 0 && page > 1) {
        setPage(page - 1);
      }
    } else {
      applyMutationFailure(result, 'Failed to delete user.', setDeleteError, setDeletingUser);
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

  return (
    <Container
      fluid
      className={cx(styles.pageContainer, darkMode && styles.darkContainer)}
      data-testid="lb-user-management"
    >
      <ManagementHeader darkMode={darkMode} onBack={handleBack} />

      <ErrorBanners
        errorStatus={errorStatus}
        error={error}
        onLogin={() => history.push('/lbdashboard/login')}
        onBack={handleBack}
        onDismiss={handleDismissError}
        onRetry={() => loadUsers(page, limit, search)}
      />

      <SearchAndLimitBar
        darkMode={darkMode}
        search={search}
        limit={limit}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onLimitChange={handleLimitChange}
      />

      <section className={cx(styles.tableCard, darkMode && styles.darkCard)}>
        <div className={styles.tableResponsive}>
          <Table hover className={cx(styles.usersTable, darkMode && styles.darkTable)}>
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
              <UsersTableRows
                loading={loading}
                users={users}
                search={search}
                darkMode={darkMode}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            </tbody>
          </Table>
        </div>

        <PaginationBar
          darkMode={darkMode}
          usersCount={users.length}
          page={page}
          limit={limit}
          total={total}
          totalPages={totalPages}
          loading={loading}
          onPageChange={handlePageChange}
        />
      </section>

      <EditUserModal
        editingUser={editingUser}
        editForm={editForm}
        editErrors={editErrors}
        modalError={modalError}
        actionLoading={actionLoading}
        darkMode={darkMode}
        onClose={closeEditModal}
        onInputChange={handleEditInputChange}
        onSubmit={handleEditSubmit}
      />

      <DeleteUserModal
        deletingUser={deletingUser}
        deleteError={deleteError}
        actionLoading={actionLoading}
        darkMode={darkMode}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </Container>
  );
}

export default LBUserManagement;
