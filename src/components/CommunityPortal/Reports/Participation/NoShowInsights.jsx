import { useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { SquareArrowOutUpRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import mockEvents from './mockData';
import styles from './Participation.module.css';

function NoShowInsights() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const insightsRef = useRef(null);

  const [dateFilter, setDateFilter] = useState('All');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportError, setExportError] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const filterByDate = events => {
    const today = new Date();

    return events.filter(event => {
      const eventDate = new Date(event.eventDate);

      switch (dateFilter) {
        case 'Today':
          return eventDate.toDateString() === today.toDateString();

        case 'This Week': {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          return eventDate >= startOfWeek && eventDate <= endOfWeek;
        }

        case 'This Month':
          return (
            eventDate.getMonth() === today.getMonth() &&
            eventDate.getFullYear() === today.getFullYear()
          );

        default:
          return true;
      }
    });
  };

  const parsePercent = value => Number(String(value).replace('%', '').trim()) || 0;

  const filteredEvents = useMemo(() => filterByDate(mockEvents), [dateFilter]);

  const pieChartData = useMemo(() => {
    const eventTypeMap = new Map();

    filteredEvents.forEach(event => {
      const currentCount = eventTypeMap.get(event.eventType) || 0;
      eventTypeMap.set(event.eventType, currentCount + 1);
    });

    return Array.from(eventTypeMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredEvents]);

  const barChartData = useMemo(() => {
    const statsMap = new Map();

    filteredEvents.forEach(event => {
      const current = statsMap.get(event.eventType) || {
        totalAttendance: 0,
        totalNoShow: 0,
        count: 0,
      };

      statsMap.set(event.eventType, {
        totalAttendance: current.totalAttendance + (Number(event.attendees) || 0),
        totalNoShow: current.totalNoShow + parsePercent(event.noShowRate),
        count: current.count + 1,
      });
    });

    return Array.from(statsMap.entries()).map(([eventType, data]) => ({
      eventType,
      averageAttendance: Math.round(data.totalAttendance / data.count),
      averageNoShowRate: Math.round(data.totalNoShow / data.count),
    }));
  }, [filteredEvents]);

  const buildPdfFromView = async () => {
    try {
      if (typeof jsPDF === 'undefined' || typeof html2canvas === 'undefined') return;
      if (!insightsRef.current) return;

      const canvas = await html2canvas(insightsRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let y = 0;
      let remainingHeight = imgHeight;

      while (remainingHeight > 0) {
        pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight);
        remainingHeight -= pageHeight;

        if (remainingHeight > 0) {
          pdf.addPage();
          y -= pageHeight;
        }
      }

      return pdf;
    } catch (pdfError) {
      setExportError(pdfError?.message || 'Failed to export analytics.');
    } finally {
      setIsExporting(false);
    }
  };

  const getPdfFilename = () => {
    const now = new Date();
    const localDate = now.toLocaleDateString('en-CA');
    return `event_engagement_insights_${dateFilter}_${localDate}`
      .replace(/\s+/g, '_')
      .toLowerCase();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      setExportError('');

      const pdf = await buildPdfFromView();
      pdf?.save(`${getPdfFilename()}.pdf`);
      setIsExportOpen(false);
    } catch (error) {
      setExportError(error?.message || 'Failed to download PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {isExportOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => !isExporting && setIsExportOpen(false)}
          onKeyDown={() => !isExporting && setIsExportOpen(false)}
          role="button"
          tabIndex={0}
        >
          <div
            className={`${styles.modal} ${darkMode ? styles.modalDark : ''}`}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
            role="button"
            tabIndex={0}
          >
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>Export Engagement Insights</h4>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => !isExporting && setIsExportOpen(false)}
                aria-label="Close export modal"
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalMeta}>
                <div>
                  <strong>Filter:</strong> {dateFilter}
                </div>
              </div>

              {exportError && <div className={styles.modalError}>{exportError}</div>}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={`${
                    darkMode ? styles.exportOptionsButtonsDark : styles.exportOptionsButtons
                  }`}
                  onClick={handleDownloadPdf}
                  disabled={isExporting}
                >
                  {isExporting ? 'Working…' : 'Download PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section
        ref={insightsRef}
        className={`${styles.insights} ${darkMode ? styles.insightsDark : ''}`}
      >
        <div className={`${styles.insightsHeader} ${darkMode ? styles.insightsHeaderDark : ''}`}>
          <div>
            <h3>Event engagement insights</h3>
            <p className={styles.sectionSubtext}>
              Visualize event type popularity and engagement performance across the selected time range.
            </p>
          </div>

          <div
            className={`${styles.insightsFilters} ${darkMode ? styles.insightsFiltersDark : ''}`}
          >
            <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>

            <button
              type="button"
              className={styles.exportIconButton}
              onClick={() => {
                setExportError('');
                setIsExportOpen(true);
              }}
              aria-label="Export engagement insights"
            >
              <SquareArrowOutUpRight size={18} />
            </button>
          </div>
        </div>

        <div className={styles.chartGrid}>
          <div className={`${styles.chartCard} ${darkMode ? styles.chartCardDark : ''}`}>
            <h4 className={styles.chartTitle}>Event type popularity</h4>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${styles.chartCard} ${darkMode ? styles.chartCardDark : ''}`}>
            <h4 className={styles.chartTitle}>Attendance and engagement by event type</h4>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="eventType" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="averageAttendance" name="Avg Attendance" fill="#3b82f6" />
                  <Bar dataKey="averageNoShowRate" name="Avg No-show %" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default NoShowInsights;
