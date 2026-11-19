import PropTypes from 'prop-types';
import styles from './JobApplicationAnalytics.module.css';

function formatCount(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString();
}

function AnalyticsSummaryCards({ summary, loading, experienceBreakdown, applicantSources }) {
  const cards = [
    { label: 'Total applications', value: summary?.totalApplications },
    { label: 'Last 7 days', value: summary?.applicationsLast7Days },
    { label: 'Last 30 days', value: summary?.applicationsLast30Days },
    { label: 'Unique applicants', value: summary?.uniqueApplicants },
    { label: 'Active forms', value: summary?.activeForms },
    { label: 'Forms with submissions', value: summary?.formsWithSubmissions },
  ];

  return (
    <>
      <div className={styles.cardsGrid} data-testid="analytics-summary-cards">
        {cards.map(card => (
          <div key={card.label} className={styles.card}>
            <span className={styles.cardLabel}>{card.label}</span>
            <span className={styles.cardValue}>{loading ? '…' : formatCount(card.value)}</span>
          </div>
        ))}
      </div>

      {Array.isArray(summary?.topForms) && summary.topForms.length > 0 && (
        <section className={styles.topForms} aria-label="Top forms by applications">
          <h2 className={styles.topFormsTitle}>Top forms by applications</h2>
          <ul className={styles.topFormsList}>
            {summary.topForms.map(form => (
              <li key={String(form.formId)} className={styles.topFormItem}>
                <span>{form.formTitle || 'Untitled form'}</span>
                <strong>{formatCount(form.count)}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(experienceBreakdown || applicantSources) && (
        <div className={styles.optionalRow}>
          {experienceBreakdown && (
            <div className={styles.optionalCard}>
              <h3 className={styles.optionalTitle}>Experience breakdown</h3>
              {Array.isArray(experienceBreakdown) && experienceBreakdown.length > 0 ? (
                <ul className={styles.topFormsList}>
                  {experienceBreakdown.slice(0, 5).map(item => (
                    <li
                      key={item.label || item.experience || item._id || JSON.stringify(item)}
                      className={styles.topFormItem}
                    >
                      <span>{item.label || item.experience || item._id || 'Unknown'}</span>
                      <strong>{formatCount(item.count || item.value)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.optionalMuted}>No experience data available.</p>
              )}
            </div>
          )}
          {applicantSources && (
            <div className={styles.optionalCard}>
              <h3 className={styles.optionalTitle}>Applicant sources</h3>
              {Array.isArray(applicantSources) && applicantSources.length > 0 ? (
                <ul className={styles.topFormsList}>
                  {applicantSources.slice(0, 5).map(item => (
                    <li
                      key={item.label || item.source || item._id || JSON.stringify(item)}
                      className={styles.topFormItem}
                    >
                      <span>{item.label || item.source || item._id || 'Unknown'}</span>
                      <strong>{formatCount(item.count || item.value)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.optionalMuted}>No source data available.</p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

AnalyticsSummaryCards.propTypes = {
  summary: PropTypes.shape({
    totalApplications: PropTypes.number,
    applicationsLast7Days: PropTypes.number,
    applicationsLast30Days: PropTypes.number,
    uniqueApplicants: PropTypes.number,
    activeForms: PropTypes.number,
    formsWithSubmissions: PropTypes.number,
    topForms: PropTypes.arrayOf(
      PropTypes.shape({
        formId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        formTitle: PropTypes.string,
        count: PropTypes.number,
      }),
    ),
  }),
  loading: PropTypes.bool,
  experienceBreakdown: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  applicantSources: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
};

AnalyticsSummaryCards.defaultProps = {
  summary: null,
  loading: false,
  experienceBreakdown: null,
  applicantSources: null,
};

export default AnalyticsSummaryCards;
