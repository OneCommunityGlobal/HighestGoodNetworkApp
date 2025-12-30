import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ArrowUpDown, ArrowUp, ArrowDown, SquareArrowOutUpRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import mockEvents from './mockData';
import styles from './Participation.module.css';

function NoShowInsights() {
  const [dateFilter, setDateFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('Event type');
  const [sortOrder, setSortOrder] = useState('none');
  const darkMode = useSelector(state => state.theme.darkMode);
  const insightsRef = useRef(null);

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
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
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

  const handleSortClick = () => {
    setSortOrder(prev => {
      if (prev === 'none' || prev === 'desc') return 'asc';
      if (prev === 'asc') return 'desc';
      return 'none';
    });
  };
  const SortIcon = sortOrder === 'none' ? ArrowUpDown : sortOrder === 'asc' ? ArrowUp : ArrowDown;

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
    const filteredEvents = filterByDate(mockEvents);
    const stats = calculateStats(filteredEvents);
    const finalStats =
      sortOrder === 'none'
        ? stats
        : [...stats].sort((a, b) =>
            sortOrder === 'asc' ? a.percentage - b.percentage : b.percentage - a.percentage,
          );

    return finalStats.map(item => (
      <div key={item.label} className={styles.insightItem}>
        <div className={`${styles.insightsLabel} ${darkMode ? styles.insightsLabelDark : ''}`}>
          {item.label}
        </div>
        <div className={styles.insightBar}>
          <div className={styles.insightFill} style={{ width: `${item.percentage}%` }} />
        </div>
        <div
          className={`${styles.insightsPercentage} ${
            darkMode ? styles.insightsPercentageDark : ''
          }`}
        >
          {item.percentage}%
        </div>
      </div>
    ));
  };

  const handleExportPDF = async () => {
    try {
      if (typeof jsPDF === 'undefined' || typeof html2canvas === 'undefined') {
        return;
      }
      if (!insightsRef.current) return;

      const canvas = await html2canvas(insightsRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
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

      const now = new Date();
      const localDate = now.toLocaleDateString('en-CA');
      const filename = `no-show-insights_${dateFilter}_${activeTab}_${localDate}.pdf`;
      pdf.save(filename);
    } catch (pdfError) {
      // eslint-disable-next-line no-console
      console.error('PDF generation failed:', pdfError);
      // eslint-disable-next-line no-alert
      alert(`Error generating PDF: ${pdfError.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div ref={insightsRef} className={`${styles.insights} ${darkMode ? styles.insightsDark : ''}`}>
      <div className={`${styles.insightsHeader} ${darkMode ? styles.insightsHeaderDark : ''}`}>
        <h3>No-show rate insights</h3>
        <div className={`${styles.insightsFilters} ${darkMode ? styles.insightsFiltersDark : ''}`}>
          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
        </div>
      </div>

      <div className={styles.insightsTabsContainer}>
        <div
          className={`${styles.insightsTabs} ${
            darkMode ? styles.insightsTabsDark : styles.insightsTabLight
          }`}
        >
          {['Event type', 'Time', 'Location'].map(tab => (
            <button
              key={tab}
              type="button"
              className={`${styles.insightsTab} ${
                darkMode ? styles.insightsTabDark : styles.insightsTabLight
              } ${activeTab === tab ? styles.activeTab : ''}`}
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
              {sortOrder === 'none' ? 'Default' : sortOrder === 'asc' ? 'Low → High' : 'High → Low'}
            </span>
          </div>
          <div className={styles.tooltipWrapper}>
            <SquareArrowOutUpRight onClick={handleExportPDF} />
            <span className={styles.tooltip}>Export Data</span>
          </div>
        </div>
      </div>

      <div className={styles.insightsContent}>{renderStats()}</div>
    </div>
  );
}

export default NoShowInsights;
