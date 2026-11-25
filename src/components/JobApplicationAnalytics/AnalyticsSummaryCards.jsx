import PropTypes from 'prop-types';
import {
  Area,
  AreaChart,
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

/** Soft CRM palette — distinct hues per series, not one flat blue. */
const CHART_COLORS = ['#22c55e', '#38bdf8', '#f59e0b', '#f43f5e', '#14b8a6', '#818cf8', '#fb7185'];

const CHART_CURSOR = { fill: 'currentColor', opacity: 0.06 };

function formatCount(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString();
}

/** Theme-aware tooltip — uses page CSS vars so light/dark stay readable. */
function ChartTooltip({ active, payload, label, formatValue }) {
  if (!active || !payload?.length) return null;

  return (
    <div className={styles.chartTooltip}>
      {label != null && String(label) !== '' ? (
        <div className={styles.chartTooltipLabel}>{label}</div>
      ) : null}
      {payload.map(entry => {
        const formatted = formatValue
          ? formatValue(entry.value, entry.name, entry)
          : [formatCount(entry.value), entry.name];
        const [displayValue, displayName] = Array.isArray(formatted)
          ? formatted
          : [formatted, entry.name];

        return (
          <div key={String(entry.dataKey || entry.name)} className={styles.chartTooltipRow}>
            <span className={styles.chartTooltipName}>{displayName}</span>
            <span className={styles.chartTooltipValue}>{displayValue}</span>
          </div>
        );
      })}
    </div>
  );
}

ChartTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  formatValue: PropTypes.func,
};

ChartTooltip.defaultProps = {
  active: false,
  payload: [],
  label: '',
  formatValue: null,
};

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

function totalOf(items) {
  return toChartData(items).reduce((sum, row) => sum + row.value, 0);
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

function DonutCard({ title, subtitle, items, emptyMessage, error, colors }) {
  const chartData = toChartData(items);
  const total = totalOf(items);
  const palette = colors || CHART_COLORS;

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
                  innerRadius={50}
                  outerRadius={74}
                  paddingAngle={3}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={entry.name} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip
                  cursor={CHART_CURSOR}
                  content={
                    <ChartTooltip
                      formatValue={(value, name) => {
                        const pct = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                        return [`${formatCount(value)} (${pct}%)`, name];
                      }}
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className={styles.legendList}>
            {chartData.map((entry, index) => {
              const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
              return (
                <li key={entry.name}>
                  <span
                    className={styles.legendSwatch}
                    style={{ backgroundColor: palette[index % palette.length] }}
                  />
                  <span className={styles.legendLabel}>
                    {entry.name}
                    <span className={styles.legendPct}> {pct}%</span>
                  </span>
                </li>
              );
            })}
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
  colors: PropTypes.arrayOf(PropTypes.string),
};

DonutCard.defaultProps = {
  subtitle: '',
  items: [],
  emptyMessage: 'No data available for this chart yet.',
  error: '',
  colors: null,
};

function VerticalBarCard({ title, subtitle, items, emptyMessage, error, colors, compact }) {
  const chartData = toChartData(items);
  const palette = colors || CHART_COLORS;

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
              <Tooltip
                cursor={CHART_CURSOR}
                content={
                  <ChartTooltip formatValue={value => [formatCount(value), 'Applications']} />
                }
              />
              <Bar dataKey="value" radius={[7, 7, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={palette[index % palette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </Panel>
  );
}

VerticalBarCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object),
  emptyMessage: PropTypes.string,
  error: PropTypes.string,
  colors: PropTypes.arrayOf(PropTypes.string),
  compact: PropTypes.bool,
};

VerticalBarCard.defaultProps = {
  subtitle: '',
  items: [],
  emptyMessage: 'No timing data available yet.',
  error: '',
  colors: null,
  compact: false,
};

function HorizontalBarCard({ title, subtitle, items, emptyMessage, error, colors }) {
  const chartData = toChartData(items);
  const palette = colors || CHART_COLORS;

  return (
    <Panel title={title} subtitle={subtitle} error={error}>
      {chartData.length > 0 ? (
        <div className={styles.chartWrapCompact} aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="currentColor"
                opacity={0.12}
              />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={96}
                tick={{ fontSize: 11 }}
                interval={0}
              />
              <Tooltip
                cursor={CHART_CURSOR}
                content={<ChartTooltip formatValue={value => [formatCount(value), 'Applicants']} />}
              />
              <Bar dataKey="value" radius={[0, 7, 7, 0]} barSize={16}>
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={palette[index % palette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </Panel>
  );
}

HorizontalBarCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object),
  emptyMessage: PropTypes.string,
  error: PropTypes.string,
  colors: PropTypes.arrayOf(PropTypes.string),
};

HorizontalBarCard.defaultProps = {
  subtitle: '',
  items: [],
  emptyMessage: 'No data available yet.',
  error: '',
  colors: null,
};

function AreaCard({ title, subtitle, items, emptyMessage, error, stroke, fill }) {
  const chartData = toChartData(items);

  return (
    <Panel title={title} subtitle={subtitle} error={error}>
      {chartData.length > 0 ? (
        <div className={styles.chartWrapCompact} aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="jaaAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={fill || '#22c55e'} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={fill || '#22c55e'} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                opacity={0.12}
              />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                cursor={CHART_CURSOR}
                content={
                  <ChartTooltip formatValue={value => [formatCount(value), 'Applications']} />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={stroke || '#16a34a'}
                strokeWidth={2.5}
                fill="url(#jaaAreaFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </Panel>
  );
}

AreaCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object),
  emptyMessage: PropTypes.string,
  error: PropTypes.string,
  stroke: PropTypes.string,
  fill: PropTypes.string,
};

AreaCard.defaultProps = {
  subtitle: '',
  items: [],
  emptyMessage: 'No timing data available yet.',
  error: '',
  stroke: '',
  fill: '',
};

function TopFormsCard({ forms }) {
  const max = Math.max(...forms.map(form => Number(form.count) || 0), 1);

  return (
    <Panel
      title="Top forms by applications"
      subtitle="Highest-volume roles across live JobApplications"
    >
      {forms.length > 0 ? (
        <ul className={styles.progressList}>
          {forms.map((form, index) => {
            const count = Number(form.count) || 0;
            const width = `${Math.max(8, Math.round((count / max) * 100))}%`;
            return (
              <li
                key={String(form.formId || form.formTitle || index)}
                className={styles.progressItem}
              >
                <div className={styles.progressMeta}>
                  <span className={styles.progressLabel}>{form.formTitle || 'Untitled form'}</span>
                  <span className={styles.progressValue}>{formatCount(count)}</span>
                </div>
                <div className={styles.progressTrack} aria-hidden="true">
                  <div
                    className={styles.progressFill}
                    style={{
                      width,
                      backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState message="No form submission rankings yet." />
      )}
    </Panel>
  );
}

TopFormsCard.propTypes = {
  forms: PropTypes.arrayOf(
    PropTypes.shape({
      formId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      formTitle: PropTypes.string,
      count: PropTypes.number,
    }),
  ),
};

TopFormsCard.defaultProps = {
  forms: [],
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
          <TopFormsCard forms={topForms} />
          <VerticalBarCard
            title="When people apply most"
            subtitle={
              peakHour?.value || peakHour?.count
                ? `Peak hour so far: ${itemLabel(peakHour)}`
                : 'Applications by day of week'
            }
            items={weekdayData}
            colors={['#22c55e', '#4ade80', '#86efac', '#38bdf8', '#0ea5e9', '#f59e0b', '#fb7185']}
            emptyMessage="Not enough submission timestamps to chart application timing yet."
          />
        </div>
      </section>

      <section className={styles.section} aria-label="Applicant expectations">
        <h2 className={styles.sectionTitle}>Applicant expectations</h2>
        <div className={styles.deepGrid}>
          <HorizontalBarCard
            title="Expected weekly hours"
            subtitle="Preferred time applicants say they can work"
            items={summary?.hoursPerWeekBreakdown}
            colors={['#38bdf8', '#22c55e', '#f59e0b', '#f43f5e']}
            emptyMessage="No hours-per-week answers found in applicant profiles yet."
          />
          <DonutCard
            title="Expected commitment"
            subtitle="How long applicants plan to stay engaged"
            items={summary?.commitmentBreakdown}
            colors={['#14b8a6', '#38bdf8', '#f59e0b', '#818cf8']}
            emptyMessage="No commitment / months-volunteer answers found yet."
          />
          <HorizontalBarCard
            title="Expected joining window"
            subtitle="Start / join / availability answers from form questions"
            items={summary?.joiningExpectations}
            colors={['#f59e0b', '#fb7185', '#38bdf8', '#22c55e', '#818cf8']}
            emptyMessage="No joining-date style answers found yet. Add start/join questions to forms to populate this card."
          />
          <AreaCard
            title="Applications by hour"
            subtitle="UTC hour-of-day pattern across all submissions"
            items={hourData}
            stroke="#0ea5e9"
            fill="#38bdf8"
            emptyMessage="No hourly timing data available yet."
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
            colors={['#22c55e', '#38bdf8', '#f59e0b', '#f43f5e']}
            emptyMessage="No experience breakdown data available."
            error={experienceError}
          />
          <DonutCard
            title="Applicant sources"
            subtitle="Where applicants report finding the opportunity"
            items={applicantSources}
            colors={['#818cf8', '#14b8a6', '#f59e0b', '#fb7185']}
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
