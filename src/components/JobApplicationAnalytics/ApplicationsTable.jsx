import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
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
  const [expandedId, setExpandedId] = useState(null);
  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 25)));

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

  const expandedItem = items.find(item => item._id === expandedId);

  return (
    <section className={styles.tableSection} aria-label="Job applications">
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
                    <button
                      type="button"
                      className={styles.viewBtn}
                      onClick={() => setExpandedId(prev => (prev === item._id ? null : item._id))}
                    >
                      {expandedId === item._id ? 'Hide' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {expandedItem && (
        <div className={styles.detailPanel} data-testid="application-detail">
          <div>
            <strong>{expandedItem.respondent || 'Anonymous'}</strong>
            {expandedItem.email ? ` · ${expandedItem.email}` : ''}
          </div>
          <div>Form: {expandedItem.formTitle || 'Untitled form'}</div>
          <div>Submitted: {formatDate(expandedItem.submittedAt)}</div>
          <div>Answers recorded: {expandedItem.answerCount ?? 0}</div>
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
