import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './KitchenReports.module.css';
import { REPORT_TABS, DATE_RANGE_OPTIONS } from './kitchenReportsData';
import useReportExport from './useReportExport';

export function KitchenReports() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dm = darkMode ? styles.dark : '';

  const [activeTab, setActiveTab] = useState(REPORT_TABS[0].id);
  const [dateRange, setDateRange] = useState(DATE_RANGE_OPTIONS[0].value);
  const { exportReport, loadingFormat } = useReportExport();

  const activeTabLabel = REPORT_TABS.find(tab => tab.id === activeTab)?.label;

  return (
    <div className={`${styles.pageWrapper} ${dm}`}>
      <div className={`${styles.container} ${dm}`}>
        <div className={styles.header}>
          <div className={styles.titleBlock}>
            <h1>Reports &amp; Analytics</h1>
            <p>Comprehensive insights on usage, spending, waste, and sustainability</p>
          </div>

          <div className={styles.controls}>
            <select
              className={`${styles.dateSelect} ${dm}`}
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              aria-label="Select date range"
            >
              {DATE_RANGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className={`${styles.exportButton} ${dm}`}
              onClick={() => exportReport('pdf', dateRange)}
              disabled={loadingFormat !== null}
              aria-busy={loadingFormat === 'pdf'}
            >
              {loadingFormat === 'pdf' ? 'Exporting...' : 'Export PDF'}
            </button>

            <button
              type="button"
              className={`${styles.exportButton} ${dm}`}
              onClick={() => exportReport('csv', dateRange)}
              disabled={loadingFormat !== null}
              aria-busy={loadingFormat === 'csv'}
            >
              {loadingFormat === 'csv' ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        <div className={`${styles.tabs} ${dm}`} role="tablist">
          {REPORT_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`${styles.tabButton} ${dm} ${
                activeTab === tab.id ? `${styles.active} ${dm}` : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={`${styles.tabPanel} ${dm}`} role="tabpanel">
          {activeTabLabel} content coming soon.
        </div>
      </div>
    </div>
  );
}

export default KitchenReports;
