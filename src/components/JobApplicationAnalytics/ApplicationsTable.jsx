import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Popover, PopoverBody, PopoverHeader } from 'reactstrap';
import { ENDPOINTS } from '~/utils/URL';
import styles from './JobApplicationAnalytics.module.css';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
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
}) {
  const darkMode = useSelector(state => state.theme?.darkMode);
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 25)));
  const popoverThemeClass = darkMode ? styles.answersPopoverDark : styles.answersPopoverLight;

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
      return undefined;
    }

    let cancelled = false;
    const loadDetail = async () => {
      setDetailLoading(true);
      setDetailError('');
      setDetail(null);
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

  const toggleView = applicationId => {
    setOpenId(prev => (prev === applicationId ? null : applicationId));
  };

  return (
    <section className={styles.tableSection} aria-label="Job applications">
      <div className={styles.tableHeader}>
        <h3 className={styles.panelTitle}>All applications</h3>
        <p className={styles.panelSubtitle}>
          Search and filter live JobApplications across forms. Use View to open formatted answers.
        </p>
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
                <th scope="col">View</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const buttonId = `jaa-view-${item._id}`;
                const isOpen = openId === item._id;
                return (
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
                      <button
                        id={buttonId}
                        type="button"
                        className={styles.viewBtn}
                        aria-expanded={isOpen}
                        aria-controls={`jaa-answers-${item._id}`}
                        onClick={() => toggleView(item._id)}
                      >
                        {isOpen ? 'Hide' : 'View'}
                      </button>
                      <Popover
                        placement="left"
                        isOpen={isOpen}
                        target={buttonId}
                        toggle={() => toggleView(item._id)}
                        trigger="legacy"
                        className={`${styles.answersPopover} ${popoverThemeClass}`}
                        popperClassName={`${styles.answersPopoverPopper} ${popoverThemeClass}`}
                      >
                        <PopoverHeader className={styles.answersPopoverHeader}>
                          Application answers
                        </PopoverHeader>
                        <PopoverBody
                          id={`jaa-answers-${item._id}`}
                          className={styles.answersPopoverBody}
                          data-testid="application-detail"
                        >
                          {detailLoading && (
                            <p className={styles.popoverStatus}>Loading answers…</p>
                          )}
                          {!detailLoading && detailError && (
                            <p className={styles.popoverError} role="alert">
                              {detailError}
                            </p>
                          )}
                          {!detailLoading && !detailError && detail && (
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
                                        <span className={styles.answerIndex}>{index + 1}.</span>{' '}
                                        {qa.questionText}
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
                        </PopoverBody>
                      </Popover>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
};

ApplicationsTable.defaultProps = {
  items: [],
  total: 0,
  page: 1,
  limit: 25,
  loading: false,
  error: '',
  forms: [],
};

export default ApplicationsTable;
