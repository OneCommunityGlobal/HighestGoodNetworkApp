import { useState } from 'react';
import { Archive, Trash2, Target, TrendingUp, Leaf, Download, FileText } from 'lucide-react';
import mockReport from './preservationReport.mock.json';
import styles from './PreservationEfficiency.module.css';

const icons = { Archive, Trash2, Target };
const percent = value => `${Math.round(value * 100)}%`;
const formatMetric = (value, format) => {
  if (format === 'percent') return percent(value);
  return `${value.toLocaleString()}${format === 'weight' ? ' lbs' : ''}`;
};

function MetricCard({ metric, value }) {
  const Icon = icons[metric.icon];
  return (
    <article className={styles.metricCard}>
      <div>
        <h2>{metric.label}</h2>
        <p>{formatMetric(value, metric.format)}</p>
      </div>
      <Icon className={styles[metric.tone]} size={28} aria-hidden="true" />
    </article>
  );
}

function PreservationImpact({ report }) {
  const achievement = report.achievementTemplate
    .replaceAll('{totalPreserved}', report.totalPreserved.toLocaleString())
    .replaceAll('{wasteSavedLbs}', report.wasteSavedLbs.toLocaleString());
  return (
    <section className={styles.impactCard} aria-labelledby="preservation-impact-title">
      <h2 id="preservation-impact-title">{report.impactTitle}</h2>
      <p className={styles.description}>{report.impactDescription}</p>
      <h3 className={styles.itemsTitle}>{report.popularItemsTitle}</h3>
      <ul className={styles.chips}>
        {report.popularItems.map(item => (
          <li key={item}>
            <Archive size={14} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
      <div className={styles.panels}>
        <section className={`${styles.panel} ${styles.achievement}`}>
          <h3>
            <TrendingUp size={20} aria-hidden="true" />
            {report.achievementTitle}
          </h3>
          <p>{achievement}</p>
          <dl className={styles.achievementMetrics}>
            <div>
              <dt>{report.successRateLabel}</dt>
              <dd>{percent(report.efficiencyRate)}</dd>
            </div>
            <div>
              <dt>{report.jarsUsedLabel}</dt>
              <dd>{report.jarsUsed.toLocaleString()}</dd>
            </div>
          </dl>
        </section>
        <section className={`${styles.panel} ${styles.environment}`}>
          <h3>
            <Leaf size={20} aria-hidden="true" />
            {report.environmentTitle}
          </h3>
          <p>{report.environmentDescription}</p>
          <dl className={styles.environmentMetrics}>
            <div>
              <dt>{report.shelfLifeLabel}</dt>
              <dd>{report.shelfLifeExtension}</dd>
            </div>
            <div>
              <dt>{report.purchasesLabel}</dt>
              <dd className={styles.green}>{report.purchaseReductionPct}%</dd>
            </div>
          </dl>
        </section>
      </div>
    </section>
  );
}

// The report prop is the integration boundary for a future API response.
export default function PreservationEfficiency({ report = mockReport }) {
  const [period, setPeriod] = useState(report.period);
  const [activeTab, setActiveTab] = useState('Preservation Efficiency');
  const exportCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ...report.metrics.map(metric => [
        metric.label,
        formatMetric(report[metric.key], metric.format),
      ]),
    ];
    const csv = rows
      .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `preservation-efficiency-${period}-mock.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>{report.title}</h1>
          <p className={styles.description}>{report.description}</p>
        </div>
        <div className={styles.controls}>
          <select
            aria-label="Report period (mock data)"
            value={period}
            onChange={event => setPeriod(event.target.value)}
          >
            {report.periods.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => window.print()}>
            <Download size={16} aria-hidden="true" />
            Export PDF
          </button>
          <button type="button" onClick={exportCsv}>
            <FileText size={16} aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>
      <nav className={styles.tabs} aria-label="Report categories">
        {report.tabs.map(tab => (
          <button
            key={tab}
            type="button"
            aria-current={tab === activeTab ? 'page' : undefined}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
      <div className={styles.metrics}>
        {report.metrics.map(metric => (
          <MetricCard key={metric.key} metric={metric} value={report[metric.key]} />
        ))}
      </div>
      <PreservationImpact report={report} />
    </main>
  );
}
