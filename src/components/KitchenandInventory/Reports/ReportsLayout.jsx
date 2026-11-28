import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Download, FileText } from 'lucide-react';
import reportSettings from './preservationReport.mock.json';
import styles from './PreservationEfficiency.module.css';

export default function ReportsLayout({
  period,
  onPeriodChange,
  onExportCsv,
  onExportPdf,
  isDemo = true,
  children,
}) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const periodLabel = reportSettings.periods.find(option => option.value === period)?.label;
  return (
    <main
      className={`${styles.page} ${darkMode ? styles.darkMode : ''}`}
      data-theme={darkMode ? 'dark' : 'light'}
    >
      <div className={styles.pageHeader}>
        <div>
          <h1>{reportSettings.title}</h1>
          <p className={styles.description}>{reportSettings.description}</p>
        </div>
        <div className={styles.controls}>
          <select
            aria-label="Report period"
            value={period}
            onChange={event => onPeriodChange(event.target.value)}
          >
            {reportSettings.periods.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={onExportPdf}>
            <Download size={16} aria-hidden="true" />
            Export PDF
          </button>
          <button type="button" onClick={onExportCsv}>
            <FileText size={16} aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>
      <nav className={styles.tabs} aria-label="Report categories">
        <span title="Overview report is not available yet">Overview</span>
        <span title="Sustainability report is not available yet">Sustainability Dashboard</span>
        <NavLink to="/kitchenandinventory/reports/preservation-efficiency">
          Preservation Efficiency
        </NavLink>
        <NavLink id="forecast-tab" to="/kitchenandinventory/reports/forecast-accuracy">
          Forecast Accuracy
        </NavLink>
      </nav>
      {isDemo && (
        <output className={styles.demoNote}>
          Sample data · {periodLabel} preview. Changing the period keeps the same illustrative
          records.
        </output>
      )}
      {children}
    </main>
  );
}
