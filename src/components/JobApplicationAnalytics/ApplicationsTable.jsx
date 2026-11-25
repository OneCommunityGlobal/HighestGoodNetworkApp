import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { ENDPOINTS } from '~/utils/URL';
import styles from './JobApplicationAnalytics.module.css';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function emptyCreateForm() {
  return {
    formId: '',
    respondent: '',
    email: '',
    resumeUrl: '',
    answers: [],
  };
}

function ApplicationsTable({
  items,
  total,
  page,
  limit,
  loading,
  error,
  forms,
  filters,
  onFiltersChange,
  onApplyFilters,
  onPageChange,
  onApplicationUpdated,
  onApplicationDeleted,
  onApplicationCreated,
}) {
  const darkMode = useSelector(state => state.theme?.darkMode);
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState(emptyCreateForm);
  const [createQuestions, setCreateQuestions] = useState([]);
  const [createLoadingQuestions, setCreateLoadingQuestions] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 25)));
  const modalThemeClass = darkMode ? styles.answersModalDark : styles.answersModalLight;

  const formOptions = useMemo(
    () =>
      (forms || [])
        .map(form => ({
          id: form._id || form.id,
          title: form.title || form.formTitle || 'Untitled form',
        }))
        .filter(form => form.id),
    [forms],
  );

  useEffect(() => {
    if (!openId) {
      setDetail(null);
      setDetailError('');
      setDetailLoading(false);
      setEditMode(false);
      setEditDraft(null);
      setActionError('');
      return undefined;
    }

    let cancelled = false;
    const loadDetail = async () => {
      setDetailLoading(true);
      setDetailError('');
      setDetail(null);
      setEditMode(false);
      setEditDraft(null);
      setActionError('');
      try {
        const { data } = await axios.get(ENDPOINTS.JOB_APPLICATION_DETAIL(openId));
        if (!cancelled) setDetail(data);
      } catch (err) {
        if (!cancelled) {
          setDetailError(
            err?.response?.data?.message || 'Unable to load application answers right now.',
          );
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [openId]);

  useEffect(() => {
    if (!createOpen || !createDraft.formId) {
      setCreateQuestions([]);
      return undefined;
    }

    let cancelled = false;
    const loadQuestions = async () => {
      setCreateLoadingQuestions(true);
      try {
        const { data } = await axios.get(ENDPOINTS.GET_JOB_FORM(createDraft.formId));
        const questions = Array.isArray(data?.form?.questions) ? data.form.questions : [];
        if (!cancelled) {
          setCreateQuestions(questions);
          setCreateDraft(prev => ({
            ...prev,
            answers: questions.map(q => ({
              questionId: q._id,
              questionText: q.questionText || 'Question',
              answer: '',
            })),
          }));
        }
      } catch {
        if (!cancelled) {
          setCreateQuestions([]);
          setCreateDraft(prev => ({ ...prev, answers: [] }));
        }
      } finally {
        if (!cancelled) setCreateLoadingQuestions(false);
      }
    };

    loadQuestions();
    return () => {
      cancelled = true;
    };
  }, [createOpen, createDraft.formId]);

  const closeModal = () => {
    if (saving) return;
    setOpenId(null);
  };

  const startEdit = () => {
    if (!detail) return;
    setEditMode(true);
    setActionError('');
    setEditDraft({
      respondent: detail.respondent || '',
      email: detail.email || '',
      resumeUrl: detail.resumeUrl || '',
      answers: (detail.answers || []).map(qa => ({
        questionId: qa.questionId,
        questionText: qa.questionText,
        answer: qa.displayValue === '—' ? '' : qa.displayValue || '',
      })),
    });
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditDraft(null);
    setActionError('');
  };

  const saveEdit = async () => {
    if (!openId || !editDraft) return;
    setSaving(true);
    setActionError('');
    try {
      const { data } = await axios.put(ENDPOINTS.UPDATE_JOB_APPLICATION(openId), {
        respondent: editDraft.respondent,
        email: editDraft.email,
        resumeUrl: editDraft.resumeUrl,
        answers: editDraft.answers.map(qa => ({
          questionId: qa.questionId,
          answer: qa.answer,
        })),
      });
      setDetail(data);
      setEditMode(false);
      setEditDraft(null);
      onApplicationUpdated?.(data);
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Unable to save application changes.');
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setCreateDraft(emptyCreateForm());
    setCreateQuestions([]);
    setActionError('');
    setCreateOpen(true);
  };

  const closeCreate = () => {
    if (saving) return;
    setCreateOpen(false);
    setActionError('');
  };

  const saveCreate = async () => {
    if (!createDraft.formId || !createDraft.email.trim()) {
      setActionError('Form and email are required.');
      return;
    }
    setSaving(true);
    setActionError('');
    try {
      const { data } = await axios.post(ENDPOINTS.CREATE_JOB_APPLICATION, {
        formId: createDraft.formId,
        respondent: createDraft.respondent,
        email: createDraft.email.trim(),
        resumeUrl: createDraft.resumeUrl,
        answers: createDraft.answers
          .filter(qa => qa.questionId)
          .map(qa => ({
            questionId: qa.questionId,
            answer: qa.answer,
          })),
      });
      setCreateOpen(false);
      setCreateDraft(emptyCreateForm());
      onApplicationCreated?.(data);
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Unable to create application.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    const deletedId = deleteTarget._id;
    setSaving(true);
    setActionError('');
    try {
      await axios.delete(ENDPOINTS.DELETE_JOB_APPLICATION(deletedId));
      if (openId === deletedId) setOpenId(null);
      setDeleteTarget(null);
      onApplicationDeleted?.(deletedId);
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Unable to delete application.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.tableSection} aria-label="Job applications">
      <div className={styles.tableHeaderRow}>
        <div className={styles.tableHeader}>
          <h3 className={styles.panelTitle}>All applications</h3>
          <p className={styles.panelSubtitle}>
            Search, view, edit, or remove live JobApplications across forms.
          </p>
        </div>
        <button type="button" className={styles.applyBtn} onClick={openCreate}>
          Add application
        </button>
      </div>
      <div className={styles.filters}>
        <div className={styles.filterField}>
          <label htmlFor="jaa-search">Search</label>
          <input
            id="jaa-search"
            type="search"
            placeholder="Name or email"
            value={filters.q}
            onChange={e => onFiltersChange({ ...filters, q: e.target.value })}
            onKeyDown={e => {
              if (e.key === 'Enter') onApplyFilters();
            }}
          />
        </div>
        <div className={styles.filterField}>
          <label htmlFor="jaa-form">Form / role</label>
          <select
            id="jaa-form"
            value={filters.formId}
            onChange={e => onFiltersChange({ ...filters, formId: e.target.value })}
          >
            <option value="">All forms</option>
            {formOptions.map(form => (
              <option key={form.id} value={form.id}>
                {form.title}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterField}>
          <label htmlFor="jaa-from">From</label>
          <input
            id="jaa-from"
            type="date"
            value={filters.from}
            onChange={e => onFiltersChange({ ...filters, from: e.target.value })}
          />
        </div>
        <div className={styles.filterField}>
          <label htmlFor="jaa-to">To</label>
          <input
            id="jaa-to"
            type="date"
            value={filters.to}
            onChange={e => onFiltersChange({ ...filters, to: e.target.value })}
          />
        </div>
        <button
          type="button"
          className={styles.applyBtn}
          onClick={onApplyFilters}
          disabled={loading}
        >
          Apply
        </button>
      </div>

      {error && <p className={`${styles.statusMsg} ${styles.errorMsg}`}>{error}</p>}
      {loading && !error && <p className={styles.statusMsg}>Loading applications…</p>}

      {!loading && !error && items.length === 0 && (
        <p className={styles.statusMsg}>No applications match the current filters.</p>
      )}

      {!loading && items.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Submitted</th>
                <th scope="col">Applicant</th>
                <th scope="col">Email</th>
                <th scope="col">Form / role</th>
                <th scope="col">Answers</th>
                <th scope="col">Resume</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id}>
                  <td>{formatDate(item.submittedAt)}</td>
                  <td>{item.respondent || 'Anonymous'}</td>
                  <td>{item.email || '—'}</td>
                  <td>{item.formTitle || 'Untitled form'}</td>
                  <td>{item.answerCount ?? 0}</td>
                  <td>
                    {item.resumeUrl ? (
                      <a
                        className={styles.resumeLink}
                        href={item.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        aria-label={`View or edit application for ${item.respondent ||
                          'applicant'}`}
                        aria-haspopup="dialog"
                        aria-expanded={openId === item._id}
                        onClick={() => setOpenId(item._id)}
                      >
                        <FontAwesomeIcon icon={faEye} aria-hidden="true" />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        aria-label={`Delete application for ${item.respondent || 'applicant'}`}
                        onClick={() => {
                          setActionError('');
                          setDeleteTarget(item);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} aria-hidden="true" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={Boolean(openId)}
        toggle={closeModal}
        centered
        size="lg"
        scrollable
        className={`${styles.answersModal} ${modalThemeClass}`}
        contentClassName={`${styles.answersModalContent} ${modalThemeClass}`}
        backdropClassName={styles.answersModalBackdrop}
      >
        <ModalHeader toggle={closeModal} className={styles.answersModalHeader}>
          <span className={styles.answersModalTitleRow}>
            <span>{editMode ? 'Edit application' : 'Application'}</span>
            {!detailLoading && !detailError && detail && !editMode ? (
              <button
                type="button"
                className={styles.editHintBtn}
                onClick={startEdit}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faPen} aria-hidden="true" />
                <span>Click here to edit</span>
              </button>
            ) : null}
          </span>
        </ModalHeader>
        <ModalBody className={styles.answersModalBody} data-testid="application-detail">
          {detailLoading && <p className={styles.popoverStatus}>Loading answers…</p>}
          {!detailLoading && detailError && (
            <p className={styles.popoverError} role="alert">
              {detailError}
            </p>
          )}
          {actionError && openId && !deleteTarget && (
            <p className={styles.popoverError} role="alert">
              {actionError}
            </p>
          )}
          {!detailLoading && !detailError && detail && !editMode && (
            <>
              <div className={styles.answersMeta}>
                <div>
                  <strong>{detail.respondent || 'Anonymous'}</strong>
                  {detail.email ? ` · ${detail.email}` : ''}
                </div>
                <div>{detail.formTitle || 'Untitled form'}</div>
                <div>Submitted: {formatDate(detail.submittedAt)}</div>
                {detail.resumeUrl ? (
                  <a
                    className={styles.resumeLink}
                    href={detail.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open resume
                  </a>
                ) : null}
              </div>
              {Array.isArray(detail.answers) && detail.answers.length > 0 ? (
                <ol className={styles.answersList}>
                  {detail.answers.map((qa, index) => (
                    <li
                      key={String(qa.questionId || `${detail._id}-${index}`)}
                      className={styles.answerItem}
                    >
                      <p className={styles.answerQuestion}>
                        <span className={styles.answerIndex}>{index + 1}.</span> {qa.questionText}
                      </p>
                      <p className={styles.answerValue}>{qa.displayValue}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={styles.popoverStatus}>
                  No question answers were recorded for this application.
                </p>
              )}
            </>
          )}
          {!detailLoading && !detailError && detail && editMode && editDraft && (
            <div className={styles.crudForm}>
              <div className={styles.filterField}>
                <label htmlFor="jaa-edit-name">Applicant name</label>
                <input
                  id="jaa-edit-name"
                  type="text"
                  value={editDraft.respondent}
                  onChange={e => setEditDraft({ ...editDraft, respondent: e.target.value })}
                />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="jaa-edit-email">Email</label>
                <input
                  id="jaa-edit-email"
                  type="email"
                  value={editDraft.email}
                  onChange={e => setEditDraft({ ...editDraft, email: e.target.value })}
                />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="jaa-edit-resume">Resume URL</label>
                <input
                  id="jaa-edit-resume"
                  type="url"
                  value={editDraft.resumeUrl}
                  onChange={e => setEditDraft({ ...editDraft, resumeUrl: e.target.value })}
                />
              </div>
              {editDraft.answers.map((qa, index) => (
                <div key={String(qa.questionId || index)} className={styles.filterField}>
                  <label htmlFor={`jaa-edit-answer-${index}`}>
                    {index + 1}. {qa.questionText}
                  </label>
                  <textarea
                    id={`jaa-edit-answer-${index}`}
                    rows={3}
                    value={qa.answer}
                    onChange={e => {
                      const next = [...editDraft.answers];
                      next[index] = { ...qa, answer: e.target.value };
                      setEditDraft({ ...editDraft, answers: next });
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        {!detailLoading && !detailError && detail && (
          <ModalFooter className={styles.answersModalFooter}>
            {editMode ? (
              <>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.applyBtn}
                  onClick={saveEdit}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </>
            ) : (
              <button type="button" className={styles.secondaryBtn} onClick={closeModal}>
                Close
              </button>
            )}
          </ModalFooter>
        )}
      </Modal>

      <Modal
        isOpen={createOpen}
        toggle={closeCreate}
        centered
        size="lg"
        scrollable
        className={`${styles.answersModal} ${modalThemeClass}`}
        contentClassName={`${styles.answersModalContent} ${modalThemeClass}`}
        backdropClassName={styles.answersModalBackdrop}
      >
        <ModalHeader toggle={closeCreate} className={styles.answersModalHeader}>
          Add application
        </ModalHeader>
        <ModalBody className={styles.answersModalBody}>
          {actionError && createOpen && (
            <p className={styles.popoverError} role="alert">
              {actionError}
            </p>
          )}
          <div className={styles.crudForm}>
            <div className={styles.filterField}>
              <label htmlFor="jaa-create-form">Form / role</label>
              <select
                id="jaa-create-form"
                value={createDraft.formId}
                onChange={e =>
                  setCreateDraft(prev => ({
                    ...prev,
                    formId: e.target.value,
                    answers: [],
                  }))
                }
              >
                <option value="">Select a form</option>
                {formOptions.map(form => (
                  <option key={form.id} value={form.id}>
                    {form.title}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterField}>
              <label htmlFor="jaa-create-name">Applicant name</label>
              <input
                id="jaa-create-name"
                type="text"
                value={createDraft.respondent}
                onChange={e => setCreateDraft({ ...createDraft, respondent: e.target.value })}
              />
            </div>
            <div className={styles.filterField}>
              <label htmlFor="jaa-create-email">Email</label>
              <input
                id="jaa-create-email"
                type="email"
                value={createDraft.email}
                onChange={e => setCreateDraft({ ...createDraft, email: e.target.value })}
              />
            </div>
            <div className={styles.filterField}>
              <label htmlFor="jaa-create-resume">Resume URL (optional)</label>
              <input
                id="jaa-create-resume"
                type="url"
                value={createDraft.resumeUrl}
                onChange={e => setCreateDraft({ ...createDraft, resumeUrl: e.target.value })}
              />
            </div>
            {createLoadingQuestions && (
              <p className={styles.popoverStatus}>Loading form questions…</p>
            )}
            {!createLoadingQuestions && createDraft.formId && createQuestions.length === 0 && (
              <p className={styles.popoverStatus}>This form has no questions yet.</p>
            )}
            {createDraft.answers.map((qa, index) => (
              <div key={String(qa.questionId || index)} className={styles.filterField}>
                <label htmlFor={`jaa-create-answer-${index}`}>
                  {index + 1}. {qa.questionText}
                </label>
                <textarea
                  id={`jaa-create-answer-${index}`}
                  rows={3}
                  value={qa.answer}
                  onChange={e => {
                    const next = [...createDraft.answers];
                    next[index] = { ...qa, answer: e.target.value };
                    setCreateDraft({ ...createDraft, answers: next });
                  }}
                />
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter className={styles.answersModalFooter}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={closeCreate}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="button" className={styles.applyBtn} onClick={saveCreate} disabled={saving}>
            {saving ? 'Creating…' : 'Create application'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        toggle={() => !saving && setDeleteTarget(null)}
        centered
        className={`${styles.answersModal} ${modalThemeClass}`}
        contentClassName={`${styles.answersModalContent} ${modalThemeClass}`}
        backdropClassName={styles.answersModalBackdrop}
      >
        <ModalHeader
          toggle={() => !saving && setDeleteTarget(null)}
          className={styles.answersModalHeader}
        >
          Delete application
        </ModalHeader>
        <ModalBody className={styles.answersModalBody}>
          {actionError && deleteTarget && (
            <p className={styles.popoverError} role="alert">
              {actionError}
            </p>
          )}
          <p className={styles.popoverStatus}>
            Permanently delete the application from{' '}
            <strong>{deleteTarget?.respondent || 'Anonymous'}</strong>
            {deleteTarget?.email ? ` (${deleteTarget.email})` : ''}? This cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter className={styles.answersModalFooter}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => setDeleteTarget(null)}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.dangerBtn}
            onClick={confirmDelete}
            disabled={saving}
          >
            {saving ? 'Deleting…' : 'Delete'}
          </button>
        </ModalFooter>
      </Modal>

      <div className={styles.pagination}>
        <span>
          Page {page} of {totalPages} · {total} total
        </span>
        <div className={styles.paginationButtons}>
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={loading || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

ApplicationsTable.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      formTitle: PropTypes.string,
      respondent: PropTypes.string,
      email: PropTypes.string,
      submittedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      resumeUrl: PropTypes.string,
      answerCount: PropTypes.number,
    }),
  ),
  total: PropTypes.number,
  page: PropTypes.number,
  limit: PropTypes.number,
  loading: PropTypes.bool,
  error: PropTypes.string,
  forms: PropTypes.arrayOf(PropTypes.object),
  filters: PropTypes.shape({
    q: PropTypes.string,
    formId: PropTypes.string,
    from: PropTypes.string,
    to: PropTypes.string,
  }).isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  onApplyFilters: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onApplicationUpdated: PropTypes.func,
  onApplicationDeleted: PropTypes.func,
  onApplicationCreated: PropTypes.func,
};

ApplicationsTable.defaultProps = {
  items: [],
  total: 0,
  page: 1,
  limit: 25,
  loading: false,
  error: '',
  forms: [],
  onApplicationUpdated: undefined,
  onApplicationDeleted: undefined,
  onApplicationCreated: undefined,
};

export default ApplicationsTable;
