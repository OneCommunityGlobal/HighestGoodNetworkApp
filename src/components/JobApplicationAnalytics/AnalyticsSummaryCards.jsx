import PropTypes from 'prop-types';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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

function Panel({ title, subtitle, children, error }) {
  return (
    <article className={styles.panel}>
      <header className={styles.panelHeader}>
        <div>
          <h3 className={styles.panelTitle}>{title}</h3>
          {subtitle ? <p className={styles.panelSubtitle}>{subtitle}</p> : null}
        </div>
      </header>
      {error ? (
        <p className={styles.errorBanner} role="alert">
          {error}
        </p>
      ) : null}
      {children}
    </article>
  );
}

Panel.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
  error: PropTypes.string,
};

Panel.defaultProps = {
  subtitle: '',
  children: null,
  error: '',
};

function EmptyState({ message }) {
  return <p className={styles.emptyState}>{message}</p>;
}

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
};

function DonutCard({ title, subtitle, items, emptyMessage, error }) {
  const chartData = toChartData(items);

  return (
    <Panel title={title} subtitle={subtitle} error={error}>
      {chartData.length > 0 ? (
        <div className={styles.donutRow}>
          <div className={styles.chartWrapCompact} aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [formatCount(value), name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className={styles.legendList}>
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
        <EmptyState message={emptyMessage} />
      )}
    </Panel>
  );
}

DonutCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object),
  emptyMessage: PropTypes.string,
  error: PropTypes.string,
};

DonutCard.defaultProps = {
  subtitle: '',
  items: [],
  emptyMessage: 'No data available for this chart yet.',
  error: '',
};

function BarCard({ title, subtitle, items, emptyMessage, error, compact }) {
  const chartData = toChartData(items);

  return (
    <Panel title={title} subtitle={subtitle} error={error}>
      {chartData.length > 0 ? (
        <div className={compact ? styles.chartWrapCompact : styles.chartWrap} aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                opacity={0.12}
              />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={value => [formatCount(value), 'Applications']} />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </Panel>
  );
}

BarCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object),
  emptyMessage: PropTypes.string,
  error: PropTypes.string,
  compact: PropTypes.bool,
};

BarCard.defaultProps = {
  subtitle: '',
  items: [],
  emptyMessage: 'No timing data available yet.',
  error: '',
  compact: false,
};

function AnalyticsSummaryCards({
  summary,
  loading,
  summaryError,
  experienceBreakdown,
  applicantSources,
  experienceError,
  sourcesError,
}) {
  const cards = [
    { label: 'Total applications', value: summary?.totalApplications, icon: 'Σ' },
    { label: 'Last 7 days', value: summary?.applicationsLast7Days, icon: '7d' },
    { label: 'Last 30 days', value: summary?.applicationsLast30Days, icon: '30' },
    { label: 'Unique applicants', value: summary?.uniqueApplicants, icon: 'U' },
    { label: 'Active forms', value: summary?.activeForms, icon: 'F' },
    { label: 'Forms with submissions', value: summary?.formsWithSubmissions, icon: 'S' },
  ];

  const topForms = Array.isArray(summary?.topForms) ? summary.topForms : [];
  const weekdayData = Array.isArray(summary?.applicationsByWeekday)
    ? summary.applicationsByWeekday
    : [];
  const hourData = Array.isArray(summary?.applicationsByHour) ? summary.applicationsByHour : [];
  const peakHour = [...hourData].sort((a, b) => itemValue(b) - itemValue(a))[0];

  return (
    <div data-testid="analytics-summary-cards">
      <section className={styles.section} aria-label="Overview metrics">
        <h2 className={styles.sectionTitle}>Overview</h2>
        {summaryError ? (
          <p className={styles.errorBanner} role="alert">
            {summaryError}
          </p>
        ) : null}
        <div className={styles.kpiGrid}>
          {cards.map(card => (
            <div key={card.label} className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>{card.label}</span>
                <span className={styles.kpiIcon} aria-hidden="true">
                  {card.icon}
                </span>
              </div>
              <span className={styles.kpiValue}>{loading ? '…' : formatCount(card.value)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-label="Pipeline insights">
        <h2 className={styles.sectionTitle}>Pipeline insights</h2>
        <div className={styles.insightsGrid}>
          <Panel
            title="Top forms by applications"
            subtitle="Highest-volume roles across live JobApplications"
          >
            {topForms.length > 0 ? (
              <ul className={styles.rankList}>
                {topForms.map((form, index) => (
                  <li
                    key={String(form.formId || form.formTitle || index)}
                    className={styles.rankItem}
                  >
                    <span className={styles.rankIndex}>{index + 1}</span>
                    <span className={styles.rankLabel}>{form.formTitle || 'Untitled form'}</span>
                    <strong className={styles.rankValue}>{formatCount(form.count)}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState message="No form submission rankings yet." />
            )}
          </Panel>

          <BarCard
            title="When people apply most"
            subtitle={
              peakHour?.value || peakHour?.count
                ? `Peak hour so far: ${itemLabel(peakHour)}`
                : 'Applications by day of week from submittedAt timestamps'
            }
            items={weekdayData}
            emptyMessage="Not enough submission timestamps to chart application timing yet."
          />
        </div>
      </section>

      <section className={styles.section} aria-label="Applicant expectations">
        <h2 className={styles.sectionTitle}>Applicant expectations</h2>
        <div className={styles.deepGrid}>
          <BarCard
            title="Expected weekly hours"
            subtitle="Preferred time applicants say they can work"
            items={summary?.hoursPerWeekBreakdown}
            emptyMessage="No hours-per-week answers found in applicant profiles yet."
            compact
          />
          <BarCard
            title="Expected commitment"
            subtitle="How long applicants plan to stay engaged"
            items={summary?.commitmentBreakdown}
            emptyMessage="No commitment / months-volunteer answers found yet."
            compact
          />
          <BarCard
            title="Expected joining window"
            subtitle="Start / join / availability answers from form questions"
            items={summary?.joiningExpectations}
            emptyMessage="No joining-date style answers found yet. Add start/join questions to forms to populate this card."
            compact
          />
          <BarCard
            title="Applications by hour"
            subtitle="UTC hour-of-day pattern across all submissions"
            items={hourData}
            emptyMessage="No hourly timing data available yet."
            compact
          />
        </div>
      </section>

      <section className={styles.section} aria-label="Audience breakdown">
        <h2 className={styles.sectionTitle}>Audience breakdown</h2>
        <div className={styles.deepGrid}>
          <DonutCard
            title="Experience breakdown"
            subtitle="From applicant analytics experience data"
            items={experienceBreakdown}
            emptyMessage="No experience breakdown data available."
            error={experienceError}
          />
          <DonutCard
            title="Applicant sources"
            subtitle="Where applicants report finding the opportunity"
            items={applicantSources}
            emptyMessage="No applicant source data available."
            error={sourcesError}
          />
        </div>
      </section>
    </div>
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
    applicationsByWeekday: PropTypes.arrayOf(PropTypes.object),
    applicationsByHour: PropTypes.arrayOf(PropTypes.object),
    hoursPerWeekBreakdown: PropTypes.arrayOf(PropTypes.object),
    commitmentBreakdown: PropTypes.arrayOf(PropTypes.object),
    joiningExpectations: PropTypes.arrayOf(PropTypes.object),
  }),
  loading: PropTypes.bool,
  summaryError: PropTypes.string,
  experienceBreakdown: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  applicantSources: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  experienceError: PropTypes.string,
  sourcesError: PropTypes.string,
};

AnalyticsSummaryCards.defaultProps = {
  summary: null,
  loading: false,
  summaryError: '',
  experienceBreakdown: null,
  applicantSources: null,
  experienceError: '',
  sourcesError: '',
};

export default AnalyticsSummaryCards;
