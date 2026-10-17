import { useCallback, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';

const EXPORT_CONFIG = {
  pdf: {
    url: ENDPOINTS.KITCHEN_REPORTS_EXPORT_PDF,
    mimeType: 'application/pdf',
    fileName: 'report-overview.pdf',
  },
  csv: {
    url: ENDPOINTS.KITCHEN_REPORTS_EXPORT_CSV,
    mimeType: 'text/csv',
    fileName: 'report-overview.csv',
  },
};

export default function useReportExport() {
  const [loadingFormat, setLoadingFormat] = useState(null);

  const exportReport = useCallback(async (format, dateRange) => {
    const config = EXPORT_CONFIG[format];
    setLoadingFormat(format);

    try {
      const response = await axios.get(config.url(), {
        params: { dateRange },
        responseType: 'blob',
      });

      if (!response.data || response.data.size === 0) {
        throw new Error('Received an empty report file.');
      }

      const blob = new Blob([response.data], { type: config.mimeType });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = config.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`${format.toUpperCase()} report downloaded successfully!`);
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()} report. Please try again.`);
    } finally {
      setLoadingFormat(null);
    }
  }, []);

  return { exportReport, loadingFormat };
}
