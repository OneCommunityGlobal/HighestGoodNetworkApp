import React, { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import styles from './ReportView.module.css';

const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF Document' },
  { value: 'csv', label: 'CSV Spreadsheet' },
];

const ReportDownloadButton = ({
  reportType = 'student',
  classId = null,
  startDate = null,
  endDate = null,
  onDownloadSuccess = null,
  onDownloadError = null,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [error, setError] = useState(null);

  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const authUser = useSelector(state => state.auth?.user);
  const userId = useSelector(state => state.auth?.user?.userid);
  const userProfile = useSelector(state => state.userProfile);

  const educatorName = useMemo(() => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    }
    return authUser?.firstName && authUser?.lastName
      ? `${authUser.firstName} ${authUser.lastName}`
      : 'Current User';
  }, [userProfile, authUser]);

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

    // Validate required parameters
    if (reportType === 'student' && !userId) {
      toast.error('User ID is required for student reports', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }

    if (reportType === 'class' && !classId) {
      toast.error('Class ID is required for class reports', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      toast.info(`Generating ${selectedFormat.toUpperCase()} report...`, {
        position: 'top-right',
        autoClose: 2000,
      });

      const params = {
        studentId: userId,
        classId,
        startDate,
        endDate,
      };

      const url = ENDPOINTS.EDUCATOR_REPORT_EXPORT(reportType, selectedFormat, params);

      // Get token from localStorage or auth state
      const token = localStorage.getItem('token') || authUser?.token;

      const response = await axios.get(url, {
        responseType: 'blob',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      // Create download link
      const blob = new Blob([response.data], {
        type: selectedFormat === 'pdf' ? 'application/pdf' : 'text/csv',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${reportType}_report_${timestamp}.${selectedFormat}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      const metadata = {
        generatedDate: new Date().toLocaleString(),
        educatorName: educatorName,
        reportType: reportType,
        format: selectedFormat,
        fileName: link.download,
      };

      toast.success(`${formattedReportType} report downloaded successfully!`, {
        position: 'top-right',
        autoClose: 3000,
      });

      onDownloadSuccess?.(metadata);
    } catch (error) {
      console.error('Download error:', error);

      let errorMessage = 'Failed to download report. Please try again.';

      if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to download reports.';
      } else if (error.response?.data) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            // Keep default error message
          }
          setError(errorMessage);
          toast.error(errorMessage, {
            position: 'top-right',
            autoClose: 3000,
          });
        };
        reader.readAsText(error.response.data);
        return; // Exit early since we're handling this asynchronously
      }

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
    userId,
    classId,
    startDate,
    endDate,
    educatorName,
    formattedReportType,
    authUser,
    onDownloadSuccess,
    onDownloadError,
  ]);

  const handleFormatChange = useCallback(e => {
    setSelectedFormat(e.target.value);
    setError(null);
  }, []);

  return (
    <div
      className={`${styles.downloadSection} ${darkMode ? styles.darkMode : ''}`}
      role="region"
      aria-label="Report download section"
    >
      <div className={styles.downloadHeader}>
        <h3 className={styles.downloadTitle}>Export Report</h3>
        <p className={styles.downloadSubtitle}>Download your report in your preferred format</p>
      </div>

      <div className={styles.downloadCard}>
        <div className={styles.formatSelection}>
          <label htmlFor="formatSelect" className={styles.formatLabel}>
            <span className={styles.labelIcon}>📄</span>
            Select Format
          </label>
          <div className={styles.selectWrapper}>
            <select
              id="formatSelect"
              value={selectedFormat}
              onChange={handleFormatChange}
              disabled={isLoading}
              className={`${styles.formatSelect} ${darkMode ? styles.darkModeSelect : ''}`}
              aria-label="Select report export format"
            >
              {EXPORT_FORMATS.map(format => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
        </div>

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
              <span>Generating Report...</span>
            </>
          ) : (
            <>
              <svg
                className={styles.downloadIcon}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
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
          <svg
            className={styles.errorIcon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className={`${styles.reportInfo} ${darkMode ? styles.darkModeInfo : ''}`}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Report Type:</span>
          <span className={styles.infoValue}>{formattedReportType}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Generated By:</span>
          <span className={styles.infoValue}>{educatorName}</span>
        </div>
        {startDate && endDate && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Date Range:</span>
            <span className={styles.infoValue}>
              {startDate} to {endDate}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDownloadButton;
