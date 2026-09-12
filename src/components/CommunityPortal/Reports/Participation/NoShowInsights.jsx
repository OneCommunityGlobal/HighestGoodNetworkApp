import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Tooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { ArrowUpDown, ArrowUp, ArrowDown, SquareArrowOutUpRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import mockEvents from './mockData';
import styles from './Participation.module.css';
import { filterEventsByDate } from './FilterByDate';

function NoShowInsights() {
  const [dateFilter, setDateFilter] = useState('This Week');
  const [scopeFilter, setScopeFilter] = useState('My Event');
  const [activeTab, setActiveTab] = useState('Event type');
  const [sortOrder, setSortOrder] = useState('none');
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);
  const insightsRef = useRef(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportError, setExportError] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleSortClick = () => {
    setSortOrder(prev => {
      if (prev === 'none' || prev === 'desc') return 'asc';
      if (prev === 'asc') return 'desc';
      return 'none';
    });
  };
  const SortIcon = sortOrder === 'none' ? ArrowUpDown : sortOrder === 'asc' ? ArrowUp : ArrowDown;

  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const getTooltipContent = () => {
    let categoryDescription;
    if (activeTab === 'Event type') categoryDescription = 'event types';
    else if (activeTab === 'Time') categoryDescription = 'time periods';
    else categoryDescription = 'locations';

    return `Percentages represent the average no-show rate for each ${categoryDescription} (${activeTab}), aggregated from all matching events within the selected time range. Higher percentages indicate a higher likelihood of participants not attending.`;
  };

  const calculateStats = filteredEvents => {
    const statsMap = new Map();

    filteredEvents.forEach(event => {
      let key;
      if (activeTab === 'Event type') key = event.eventType;
      else if (activeTab === 'Time') key = event.eventTime.split(' ')[0];
      else if (activeTab === 'Location') key = event.location;

      const percentage = parseInt(event.noShowRate, 10);

      if (statsMap.has(key)) {
        const existing = statsMap.get(key);
        statsMap.set(key, {
          totalPercentage: existing.totalPercentage + percentage,
          count: existing.count + 1,
        });
      } else {
        statsMap.set(key, { totalPercentage: percentage, count: 1 });
      }
    });

    return Array.from(statsMap.entries()).map(([key, value]) => ({
      label: key,
      percentage: Math.round(value.totalPercentage / value.count),
    }));
  };

  const renderStats = () => {
    const dateFilteredEvents = filterEventsByDate(mockEvents, dateFilter);
    // Placeholder until real ownership/user context is wired in: treat even-id events as "mine".
    const filteredEvents =
      scopeFilter === 'My Event'
        ? dateFilteredEvents.filter(event => event.id % 2 === 0)
        : dateFilteredEvents;
    const stats = calculateStats(filteredEvents);
    const finalStats =
      sortOrder === 'none'
        ? stats
        : [...stats].sort((a, b) =>
            sortOrder === 'asc' ? a.percentage - b.percentage : b.percentage - a.percentage,
          );

    return finalStats.map(item => (
      <div key={item.label} className={styles.insightItem}>
        <div className={`${styles.insightLabel} ${darkMode ? styles.insightLabelDark : ''}`}>
          {item.label}
        </div>
        <div className={`${styles.insightBar}`}>
          <div className={`${styles.insightFill}`} style={{ width: `${item.percentage}%` }} />
        </div>
        <div
          className={`${styles.insightsPercentage} ${
            darkMode ? styles.insightsPercentageDark : ''
          }`}
          style={{ color: 'red' }}
        >
          {item.percentage}%
        </div>
      </div>
    ));
  };

  const buildPdfFromView = async () => {
    try {
      if (typeof jsPDF === 'undefined' || typeof html2canvas === 'undefined') {
        return;
      }
      if (!insightsRef.current) return;

      const canvas = await html2canvas(insightsRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: darkMode ? '#1C2541' : null,
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
      setExportError(pdfError?.message || 'Failed to share PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const getPdfFilename = () => {
    const now = new Date();
    const localDate = now.toLocaleDateString('en-CA');
    const filename = `no-show-insights_${scopeFilter}_${dateFilter}_${activeTab}_${localDate}.pdf`;
    return filename.replace(/\s+/g, '_').toLowerCase();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      setExportError('');
      const pdf = await buildPdfFromView();
      pdf.save(getPdfFilename());
      setIsExportOpen(false);
    } catch (e) {
      setExportError(e?.message || 'Failed to download PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSharePdf = async () => {
    try {
      setIsExporting(true);
      setExportError('');

      const pdf = await buildPdfFromView();
      const blob = pdf.output('blob');
      const file = new File([blob], getPdfFilename(), { type: 'application/pdf' });

      if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
        setExportError(
          'Sharing is not supported in this browser. Please download the PDF instead.',
        );
        return;
      }

      await navigator.share({
        title: 'No-show rate insights',
        text: `Insights (${scopeFilter}, ${dateFilter}, ${activeTab})`,
        files: [file],
      });

      setIsExportOpen(false);
    } catch (e) {
      setExportError(e?.message || 'Failed to share PDF.');
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
              <h4 className={styles.modalTitle}>Export No-show Insights</h4>
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
                  <strong>Scope:</strong> {scopeFilter}
                </div>
                <div>
                  <strong>Filter:</strong> {dateFilter}
                </div>
                <div>
                  <strong>View:</strong> {activeTab}
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

                <button
                  type="button"
                  className={`${
                    darkMode ? styles.exportOptionsButtonsDark : styles.exportOptionsButtons
                  }`}
                  onClick={handleSharePdf}
                  disabled={isExporting}
                >
                  {isExporting ? 'Working…' : 'Share PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        ref={insightsRef}
        className={`${styles.insights} ${darkMode ? styles.insightsDark : ''}`}
      >
        <div className={`${styles.insightsHeader} ${darkMode ? styles.insightsHeaderDark : ''}`}>
          <div className={styles.insightsTitleWrapper}>
            <h3>No-show rate insights</h3>
            <span id="noShowInsightsTooltip" className={styles.infoIcon}>
              <FontAwesomeIcon icon={faInfoCircle} />
            </span>
            <Tooltip
              key={activeTab}
              delay={{ show: 0, hide: 500 }}
              autohide={false}
              placement="right"
              isOpen={tooltipOpen}
              target="noShowInsightsTooltip"
              toggle={toggleTooltip}
            >
              {getTooltipContent()}
            </Tooltip>
          </div>
          <div
            className={`${styles.insightsFilters} ${darkMode ? styles.insightsFiltersDark : ''}`}
          >
            <select value={scopeFilter} onChange={e => setScopeFilter(e.target.value)}>
              <option value="My Event">My Event</option>
              <option value="All Events">All Events</option>
            </select>
            <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Last 3 Months">Last 3 Months</option>
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="Last 12 Months">Last 12 Months</option>
            </select>
          </div>
        </div>

        <div className={styles.insightsTabsContainer}>
          <div className={`${styles.insightsTabs} ${darkMode ? styles.insightsTabsDarkMode : ''}`}>
            {['Event type', 'Time', 'Location'].map(tab => (
              <button
                key={tab}
                type="button"
                className={`
                ${styles.insightsTab} 
                ${darkMode ? styles.insightsTabDarkMode : ''} 
                ${
                  activeTab === tab ? (darkMode ? styles.activeTabDarkMode : styles.activeTab) : ''
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className={styles.icons}>
            <div className={styles.tooltipWrapper}>
              <SortIcon onClick={handleSortClick} className={styles.sortIcon} />
              <span className={styles.tooltip}>
                {sortOrder === 'none'
                  ? 'Default'
                  : sortOrder === 'asc'
                  ? 'Low → High'
                  : 'High → Low'}
              </span>
            </div>
            <div className={styles.tooltipWrapper}>
              <SquareArrowOutUpRight
                onClick={() => {
                  setExportError('');
                  setIsExportOpen(true);
                }}
              />
              <span className={styles.tooltip}>Export Data</span>
            </div>
          </div>
        </div>

        <div className={styles.insightsContent}>{renderStats()}</div>
      </div>
    </>
  );
}

export default NoShowInsights;
