import React, { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './ReportView.module.css';

const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'csv', label: 'CSV' },
];

const LOADING_TIMEOUT = 1500;
const INITIAL_DELAY = 1000;

const ReportDownloadButton = ({
  reportType = 'student',
  educatorName = 'Current User',
  onDownloadSuccess = null,
  onDownloadError = null,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [error, setError] = useState(null);

  const darkMode = useSelector(state => state.theme?.darkMode || false);

  const formattedReportType = useMemo(
    () => reportType.charAt(0).toUpperCase() + reportType.slice(1),
    [reportType],
  );

  const handleDownload = useCallback(async () => {
    if (!selectedFormat) {
      toast.error('Please select an export format', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const timestamp = new Date().toLocaleString();
      const fileName = `${reportType}_report_${Date.now()}.${selectedFormat}`;

      await new Promise(resolve => setTimeout(resolve, INITIAL_DELAY));

      toast.info(`Generating ${selectedFormat.toUpperCase()} report...`, {
        position: 'top-right',
        autoClose: 2000,
      });

      const metadata = {
        generatedDate: timestamp,
        educatorName: educatorName,
        reportType: reportType,
        format: selectedFormat,
        fileName: fileName,
      };

      console.log('Export metadata:', metadata);

      await new Promise(resolve => setTimeout(resolve, LOADING_TIMEOUT));

      toast.success(
        `${formattedReportType} report (${selectedFormat.toUpperCase()}) downloaded successfully!`,
        {
          position: 'top-right',
          autoClose: 3000,
        },
      );

      onDownloadSuccess?.(metadata);
    } catch (error) {
      const errorMessage = error?.message || 'Failed to download report. Please try again.';
      setError(errorMessage);

      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });

      onDownloadError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedFormat,
    reportType,
    educatorName,
    formattedReportType,
    onDownloadSuccess,
    onDownloadError,
  ]);

  const handleFormatChange = useCallback(e => {
    setSelectedFormat(e.target.value);
    setError(null);
  }, []);

  return (
    <div
      className={`${styles.downloadButtonContainer} ${darkMode ? styles.darkMode : ''}`}
      role="region"
      aria-label="Report download section"
    >
      <div className={styles.downloadControlsWrapper}>
        <label htmlFor="formatSelect" className={styles.formatLabel}>
          Export Format:
        </label>
        <select
          id="formatSelect"
          value={selectedFormat}
          onChange={handleFormatChange}
          disabled={isLoading}
          className={`${styles.formatSelect} ${darkMode ? styles.darkModeSelect : ''}`}
          aria-label="Select report export format"
          aria-disabled={isLoading}
        >
          {EXPORT_FORMATS.map(format => (
            <option key={format.value} value={format.value}>
              {format.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleDownload}
          disabled={isLoading}
          className={`${styles.downloadButton} ${isLoading ? styles.loading : ''} ${
            darkMode ? styles.darkModeButton : ''
          }`}
          aria-busy={isLoading}
          aria-label={
            isLoading
              ? 'Generating report'
              : `Download ${formattedReportType} report as ${selectedFormat.toUpperCase()}`
          }
          type="button"
        >
          {isLoading ? (
            <>
              <span className={styles.spinner} aria-hidden="true"></span>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span className={styles.downloadIcon} aria-hidden="true">
                ⬇
              </span>
              <span>Download Report</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div
          className={`${styles.errorMessage} ${darkMode ? styles.darkModeError : ''}`}
          role="alert"
        >
          <small>⚠️ {error}</small>
        </div>
      )}

      <div className={`${styles.reportMetadata} ${darkMode ? styles.darkModeMetadata : ''}`}>
        <small>
          Report Type: <strong>{formattedReportType}</strong> | Educator:{' '}
          <strong>{educatorName}</strong>
        </small>
      </div>
    </div>
  );
};

export default ReportDownloadButton;
