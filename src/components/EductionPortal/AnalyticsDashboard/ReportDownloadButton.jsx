import React, { useState } from 'react';
import { toast } from 'react-toastify';
import styles from './ReportVew.module.css';

const ReportDownloadButton = ({ reportType = 'student', educatorName = 'Current User' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  const handleDownload = async () => {
    try {
      setIsLoading(true);

      const timestamp = new Date().toLocaleString();
      const fileName = `${reportType}_report_${Date.now()}`;

      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.info(`Generating ${selectedFormat.toUpperCase()} report...`, {
        position: 'top-right',
        autoClose: 2000,
      });

      // Mock metadata
      const metadata = {
        generatedDate: timestamp,
        educatorName: educatorName,
        reportType: reportType,
        format: selectedFormat,
      };

      console.log('Export metadata:', metadata);

      setTimeout(() => {
        toast.success(
          `${reportType.charAt(0).toUpperCase() +
            reportType.slice(1)} report (${selectedFormat.toUpperCase()}) downloaded successfully!`,
          {
            position: 'top-right',
            autoClose: 3000,
          },
        );
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      toast.error('Failed to download report. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.downloadButtonContainer}>
      <div className={styles.downloadControlsWrapper}>
        <label htmlFor="formatSelect" className={styles.formatLabel}>
          Export Format:
        </label>
        <select
          id="formatSelect"
          value={selectedFormat}
          onChange={e => setSelectedFormat(e.target.value)}
          disabled={isLoading}
          className={styles.formatSelect}
        >
          <option value="pdf">PDF</option>
          <option value="csv">CSV</option>
        </select>

        <button
          onClick={handleDownload}
          disabled={isLoading}
          className={`${styles.downloadButton} ${isLoading ? styles.loading : ''}`}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner}></span>
              Generating...
            </>
          ) : (
            <>
              <span className={styles.downloadIcon}>⬇</span>
              Download Report
            </>
          )}
        </button>
      </div>

      <div className={styles.reportMetadata}>
        <small>
          Report Type: <strong>{reportType.charAt(0).toUpperCase() + reportType.slice(1)}</strong>
        </small>
      </div>
    </div>
  );
};

export default ReportDownloadButton;
