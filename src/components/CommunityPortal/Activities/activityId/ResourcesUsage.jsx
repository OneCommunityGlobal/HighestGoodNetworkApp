import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './ResourcesUsage.module.css';
import * as XLSX from 'xlsx';

function ResourcesUsage() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const data = [
    {
      sNo: 1,
      name: 'Harsh Kadyan',
      materials: '????',
      facilities: 'Software Engineer Team',
      status: { text: 'Debited', color: 'green' },
      dueDate: '05 January 2026', // ❌ Overdue
    },
    {
      sNo: 2,
      name: 'John Doe',
      materials: '????',
      facilities: 'HR Facilities',
      status: { text: 'Partially Debited', color: 'yellow' },
      dueDate: '22 January 2026', // ⏰ Due Soon (within 7 days)
    },
    {
      sNo: 3,
      name: 'Jane Smith',
      materials: '????',
      facilities: 'IT Equipment',
      status: { text: 'Not Debited', color: 'red' },
      dueDate: '30 January 2026', // ✅ On Track
    },
    {
      sNo: 4,
      name: 'Alex Brown',
      materials: '????',
      facilities: 'Admin Facilities',
      status: { text: 'Debited', color: 'green' },
      dueDate: '10 January 2026', // ❌ Overdue
    },
  ];

  /* -------------------- EXPORT STATE (EXISTING) -------------------- */
  const [isExporting, setIsExporting] = useState(false);

  const exportColumns = [
    { key: 'sNo', label: 'S.No' },
    { key: 'name', label: 'Name' },
    { key: 'materials', label: 'Materials' },
    { key: 'facilities', label: 'Facilities' },
    { key: 'status', label: 'Status' },
    { key: 'dueDate', label: 'Due Date' },
  ];

  const getExportData = () =>
    data.map(row => ({
      ...row,
      status: row.status.text,
    }));

  const exportCSV = () => {
    setIsExporting(true);

    const rows = getExportData();
    const header = exportColumns.map(col => col.label).join(',');
    const body = rows
      .map(row => exportColumns.map(col => `"${row[col.key] ?? ''}"`).join(','))
      .join('\n');

    const blob = new Blob([`${header}\n${body}`], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resource-usage_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setIsExporting(false);
  };

  const exportXLSX = () => {
    setIsExporting(true);

    const rows = getExportData().map(row => {
      const formatted = {};
      exportColumns.forEach(col => {
        formatted[col.label] = row[col.key];
      });
      return formatted;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resource Usage');

    XLSX.writeFile(workbook, `resource-usage_${new Date().toISOString().slice(0, 10)}.xlsx`);

    setIsExporting(false);
  };
  /* --------------------------------------------------------------- */

  /* -------------------- DUE DATE LOGIC (NEW) ---------------------- */
  const getDueDateStatus = dueDateStr => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = (dueDate - today) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) {
      return { type: 'overdue', label: 'Overdue', icon: '⚠️' };
    }

    if (diffDays <= 7) {
      return { type: 'dueSoon', label: 'Due Soon', icon: '⏰' };
    }

    return { type: 'onTrack', label: 'On Track', icon: '' };
  };
  /* --------------------------------------------------------------- */

  return (
    <div className={styles.resourcesUsage}>
      <div className={styles.headerRow}>
        <h2 className={styles.resourceTitle}>Resource Usage Monitoring</h2>
        <div className={styles.exportButtons}>
          <button
            type="button"
            className={styles.exportButton}
            onClick={exportCSV}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting…' : 'Export CSV'}
          </button>
          <button
            type="button"
            className={styles.exportButton}
            onClick={exportXLSX}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting…' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* header for column */}
      <div className={`${styles.resourceRow} ${darkMode ? styles.headerDark : styles.header}`}>
        <div className={styles.column}>S.No</div>
        <div className={styles.column}>Name</div>
        <div className={styles.column}>Materials</div>
        <div className={styles.column}>Facilities</div>
        <div className={styles.column}>Status</div>
        <div className={styles.column}>Due Date</div>
        <div className={styles.column}>Actions</div>
      </div>

      {/* data for each row */}
      {data.map(row => {
        const dueStatus = getDueDateStatus(row.dueDate);

        return (
          <div
            key={row.sNo}
            className={`${styles.resourceRow} ${
              dueStatus.type === 'overdue'
                ? styles.rowOverdue
                : dueStatus.type === 'dueSoon'
                ? styles.rowDueSoon
                : ''
            }`}
          >
            <div className={styles.column}>{row.sNo}</div>
            <div className={styles.column}>{row.name}</div>
            <div className={styles.column}>{row.materials}</div>
            <div className={styles.column}>{row.facilities}</div>

            <div className={`${styles.column} ${styles[`status${row.status.color}`]}`}>
              {row.status.text}
            </div>

            <div className={`${styles.column} ${styles.dueDateColumn}`} title={dueStatus.label}>
              {dueStatus.icon && (
                <span className={styles.dueIcon} aria-label={dueStatus.label}>
                  {dueStatus.icon}
                </span>
              )}
              <span>{row.dueDate}</span>
              {dueStatus.label !== 'On Track' && (
                <span className={styles.dueText}>({dueStatus.label})</span>
              )}
            </div>

            <div className={`${styles.column} ${styles.actionColumn}`}>
              <button
                type="button"
                className={`${darkMode ? styles.viewDetailsButtonDark : styles.viewDetails}`}
              >
                View Details
              </button>
            </div>
          </div>
        );
      })}

      <div className={styles.tickBox}>
        <label className={styles.tickLabel}>
          <input type="checkbox" id="tickAll" /> Tick off All Selected Items
        </label>
      </div>
    </div>
  );
}

export default ResourcesUsage;
