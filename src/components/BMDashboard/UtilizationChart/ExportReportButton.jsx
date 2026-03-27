import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../../utils/URL';
import { EXPORT_FORMATS } from './constants';
import styles from './UtilizationChart.module.css';

function ExportReportButton({ tool, project, startDate, endDate }) {
  const [exportingFormat, setExportingFormat] = useState(null);

  const handleExport = async format => {
    setExportingFormat(format);
    try {
      const params = {
        format,
        tool,
        project,
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(endDate && { endDate: endDate.toISOString() }),
      };
      const response = await axios.get(ENDPOINTS.BM_TOOL_UTILIZATION_EXPORT, {
        params,
        headers: { Authorization: localStorage.getItem('token') },
        responseType: 'blob',
      });

      const contentDisposition = response.headers['content-disposition'] || '';
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch ? filenameMatch[1] : `tool-utilization-report.${format}`;

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error(`Failed to export ${format.toUpperCase()} report.`);
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className={styles.exportSection}>
      <span className={styles.exportLabel}>Export Report:</span>
      <button
        type="button"
        className={styles.exportButton}
        onClick={() => handleExport(EXPORT_FORMATS.PDF)}
        disabled={exportingFormat !== null}
        aria-label="Export as PDF"
      >
        {exportingFormat === EXPORT_FORMATS.PDF ? 'Exporting...' : 'PDF'}
      </button>
      <button
        type="button"
        className={styles.exportButton}
        onClick={() => handleExport(EXPORT_FORMATS.CSV)}
        disabled={exportingFormat !== null}
        aria-label="Export as CSV"
      >
        {exportingFormat === EXPORT_FORMATS.CSV ? 'Exporting...' : 'CSV'}
      </button>
    </div>
  );
}

export default ExportReportButton;
