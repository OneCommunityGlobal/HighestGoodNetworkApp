import PropTypes from 'prop-types';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './JobApplicationAnalytics.module.css';

const CHART_COLORS = ['#2563eb', '#0d9488', '#d97706', '#dc2626', '#7c3aed', '#059669', '#db2777'];

function formatCount(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString();
}

function itemLabel(item) {
  return item?.label || item?.name || item?.experience || item?.source || item?._id || 'Unknown';
}

function itemValue(item) {
  const value = item?.count ?? item?.value;
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function toChartData(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map(item => ({
      name: String(itemLabel(item)),
      value: itemValue(item),
    }))
    .filter(item => item.value > 0);
}

function BreakdownChart({ title, items, emptyMessage }) {
  const chartData = toChartData(items);

  return (
    <div className={styles.optionalCard}>
      <h3 className={styles.optionalTitle}>{title}</h3>
      {chartData.length > 0 ? (
        <div className={styles.chartBlock}>
          <div className={styles.chartCanvas} aria-hidden="true">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [formatCount(value), name]}
                  contentStyle={{ borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className={styles.chartLegend}>
            {chartData.map((entry, index) => (
              <li key={entry.name}>
                <span
                  className={styles.legendSwatch}
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className={styles.legendLabel}>{entry.name}</span>
                <strong>{formatCount(entry.value)}</strong>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className={styles.optionalMuted}>{emptyMessage}</p>
      )}
    </div>
  );
}

BreakdownChart.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object),
  emptyMessage: PropTypes.string,
};

BreakdownChart.defaultProps = {
  items: [],
  emptyMessage: 'No data available.',
};

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
            <BreakdownChart
              title="Experience breakdown"
              items={experienceBreakdown}
              emptyMessage="No experience data available."
            />
          )}
          {applicantSources && (
            <BreakdownChart
              title="Applicant sources"
              items={applicantSources}
              emptyMessage="No source data available."
            />
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
