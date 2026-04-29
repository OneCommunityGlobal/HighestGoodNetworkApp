/* eslint-disable react/jsx-one-expression-per-line */
'use client';

import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useSelector } from 'react-redux';
import { events, getAttendanceByEvent, getAttendanceInsights } from './mockData';
import styles from './AttendanceNoShowCharts.module.css';

const attendanceColors = ['#0b84c6', '#d6ecf8'];
const participationColors = ['#3f8c12', '#cbe7a5'];
const popularityColors = ['#c97a0a', '#ead0a7'];

const statusColors = {
  Upcoming: '#9ca3af',
  'In Progress': '#3b82f6',
  Completed: '#22c55e',
};

function AttendanceNoShowCharts() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [selectedId, setSelectedId] = useState(events[0]?.id || '');
  const [activeTab, setActiveTab] = useState('Analysis');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedEvent = useMemo(() => events.find(event => event.id === selectedId), [selectedId]);

  const attendanceLogs = useMemo(() => {
    if (!selectedId) return [];
    return getAttendanceByEvent(selectedId);
  }, [selectedId]);

  const insights = useMemo(() => {
    if (!selectedId) {
      return {
        totalRegistered: 0,
        totalAttended: 0,
        totalNoShow: 0,
        noShowRate: 0,
      };
    }
    return getAttendanceInsights(selectedId);
  }, [selectedId]);

  const filteredLogs = useMemo(() => {
    return attendanceLogs.filter(log => {
      const matchesStatus = statusFilter ? log.status === statusFilter : true;
      const q = searchTerm.trim().toLowerCase();

      const matchesSearch = q
        ? log.name.toLowerCase().includes(q) ||
          log.email.toLowerCase().includes(q) ||
          log.participantId.toLowerCase().includes(q)
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [attendanceLogs, statusFilter, searchTerm]);

  const calculatePercentageValue = (value, total) => {
    if (!total || total === 0) return 0;
    return Number(((value / total) * 100).toFixed(1));
  };

  const formatDateTime = value => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleString();
  };

  const formatDisplayDate = value => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCalendarData = value => {
    const baseDate = value ? new Date(value) : new Date();
    if (Number.isNaN(baseDate.getTime())) {
      const fallback = new Date();
      return {
        monthLabel: fallback.toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        }),
        activeDay: fallback.getDate(),
        daysInMonth: new Date(fallback.getFullYear(), fallback.getMonth() + 1, 0).getDate(),
        firstDayOfMonth: new Date(fallback.getFullYear(), fallback.getMonth(), 1).getDay(),
      };
    }

    return {
      monthLabel: baseDate.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      }),
      activeDay: baseDate.getDate(),
      daysInMonth: new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate(),
      firstDayOfMonth: new Date(baseDate.getFullYear(), baseDate.getMonth(), 1).getDay(),
    };
  };

  const handleShareAvailability = async () => {
    if (!selectedEvent) return;

    const shareText = `${selectedEvent.name} | ${formatDisplayDate(selectedEvent.date)} | ${
      selectedEvent.time
    } | ${selectedEvent.link}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: selectedEvent.name,
          text: `${selectedEvent.name} - ${formatDisplayDate(selectedEvent.date)} - ${
            selectedEvent.time
          }`,
          url: selectedEvent.link,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        alert('Event details copied to clipboard');
      } else {
        window.open(selectedEvent.link, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      // user cancelled or share failed
    }
  };

  if (!selectedEvent) {
    return (
      <div className={`${styles.pageContainer} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.emptyState}>No event data available</div>
      </div>
    );
  }

  const attendanceRate = calculatePercentageValue(insights.totalAttended, insights.totalRegistered);

  const participationRate = calculatePercentageValue(
    selectedEvent.completed || insights.totalAttended,
    insights.totalRegistered,
  );

  const popularityRate = calculatePercentageValue(
    selectedEvent.registrations,
    selectedEvent.capacity,
  );

  const attendanceRateData = [
    { name: 'showUp', value: attendanceRate },
    { name: 'remaining', value: 100 - attendanceRate },
  ];

  const participationRateData = [
    { name: 'participated', value: participationRate },
    { name: 'remaining', value: 100 - participationRate },
  ];

  const popularityRateData = [
    { name: 'popular', value: popularityRate },
    { name: 'remaining', value: 100 - popularityRate },
  ];

  const stayBreakdown = [
    { label: '2.5-3 h', value: 87, color: '#6ad3b2' },
    { label: '1-2 h', value: 3, color: '#f3b63f' },
    { label: '< 1 h', value: 13, color: '#ff4d4f' },
    { label: 'Walkouts', value: 5, color: '#7a74b8' },
  ];

  const currentStatus = selectedEvent.status || 'Unknown';
  const statusColor = statusColors[currentStatus] || '#9ca3af';

  const { monthLabel, activeDay, daysInMonth, firstDayOfMonth } = getCalendarData(
    selectedEvent.date,
  );

  const calendarLeadingBlanks = Array.from({ length: firstDayOfMonth }, (_, i) => (
    <span key={`blank-${i}`} className={styles.calendarBlank} />
  ));

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => (
    <span
      key={i + 1}
      className={`${styles.calendarDay} ${i + 1 === activeDay ? styles.calendarActiveDay : ''}`}
    >
      {i + 1}
    </span>
  ));

  const renderDonutCard = (title, subtitle, data, colors, footerLeft, footerRight) => (
    <div className={styles.metricCard}>
      <div className={styles.metricDots}>•••</div>
      <div className={styles.metricChart}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={72}
              outerRadius={94}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`${title}-${entry.name}`} fill={colors[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className={styles.metricCenterLabel}>{title}</div>
      </div>
      <div className={styles.metricSubtitle}>{subtitle}</div>
      <div className={styles.metricLegendRow}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: colors[0] }} />
          {footerLeft}
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: colors[1] }} />
          {footerRight}
        </span>
      </div>
    </div>
  );

  return (
    <div className={`${styles.pageContainer} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.contentWrapper}>
        <div className={styles.selectorRow}>
          <select
            className={styles.eventSelect}
            onChange={e => setSelectedId(e.target.value)}
            value={selectedId}
          >
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.heroCard}>
          <div className={styles.heroLeft}>
            <div className={styles.heroPoster} />
            <div className={styles.heroBadge}>
              {currentStatus === 'Completed' ? 'Finished' : currentStatus}
            </div>
          </div>

          <div className={styles.heroCenter}>
            <p className={styles.heroEyebrow}>Event or Course / In-person or Remote</p>
            <h1 className={styles.heroTitle}>{selectedEvent.name}</h1>
            <p className={styles.heroLink}>{selectedEvent.link}</p>

            <div className={styles.heroMetaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Date</span>
                <span className={styles.metaValue}>{formatDisplayDate(selectedEvent.date)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Time</span>
                <span className={styles.metaValue}>{selectedEvent.time}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Organizer</span>
                <span className={styles.metaValue}>{selectedEvent.organizer}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Capacity</span>
                <span className={styles.metaValue}>
                  {selectedEvent.registrations}/{selectedEvent.capacity}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Overall Rating</span>
                <span className={styles.metaValue}>
                  {'★'.repeat(Math.max(1, Math.round(selectedEvent.overallRating || 0)))}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Status</span>
                <span
                  className={styles.statusPill}
                  style={{ backgroundColor: `${statusColor}22`, color: statusColor }}
                >
                  {currentStatus}
                </span>
              </div>
            </div>

            <div className={styles.heroFooter}>
              <div className={styles.avatarRow}>
                <span className={styles.avatar}>A</span>
                <span className={styles.avatar}>B</span>
                <span className={styles.avatar}>C</span>
                <span className={styles.avatar}>D</span>
                <span className={styles.avatarCount}>
                  +{Math.max(0, insights.totalAttended - 4)}
                </span>
              </div>
              <button
                type="button"
                className={styles.shareButton}
                onClick={handleShareAvailability}
              >
                Share Availability
              </button>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.calendarCard}>
              <div className={styles.calendarHeader}>{monthLabel}</div>
              <div className={styles.calendarGrid}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <span key={day} className={styles.calendarDayName}>
                    {day}
                  </span>
                ))}
                {calendarLeadingBlanks}
                {calendarDays}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tabsRow}>
          {['Description', 'Analysis', 'Participates', 'Comments'].map(tab => (
            <button
              key={tab}
              type="button"
              className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Description' && (
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Description</h2>
            <p className={styles.sectionText}>
              This event dashboard tracks attendance, participation, and no-show insights for
              improved event management. It summarizes registrations, attendees, completion, and
              engagement quality in one place.
            </p>
          </div>
        )}

        {activeTab === 'Analysis' && (
          <>
            <div className={styles.metricGrid}>
              {renderDonutCard(
                'Attendance\nRate',
                `${attendanceRate}% registered showed up`,
                attendanceRateData,
                attendanceColors,
                'show up',
                'all',
              )}

              {renderDonutCard(
                'Participation',
                `${participationRate}% residents attended the event`,
                participationRateData,
                participationColors,
                'attended',
                'all',
              )}

              {renderDonutCard(
                'Popularity',
                'among all workshops',
                popularityRateData,
                popularityColors,
                'more',
                'less',
              )}
            </div>

            <div className={styles.sectionCard}>
              <div className={styles.barHeader}>
                <span className={styles.sectionTitle}>
                  Participants stay length record analysis
                </span>
                <span className={styles.barTag}>stay for 2.5-3 h</span>
              </div>

              <div className={styles.stackedBar}>
                {stayBreakdown.map(item => (
                  <div
                    key={item.label}
                    className={styles.stackedSegment}
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.color,
                    }}
                    title={`${item.label}: ${item.value}%`}
                  >
                    {item.value}%
                  </div>
                ))}
              </div>

              <div className={styles.legendWrap}>
                {stayBreakdown.map(item => (
                  <div key={item.label} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ backgroundColor: item.color }} />
                    {item.label}
                  </div>
                ))}
              </div>

              <div className={styles.statGrid}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Total Leads</span>
                  <span className={styles.statValue}>{selectedEvent.registrations}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Converted Leads</span>
                  <span className={styles.statValue}>{insights.totalAttended}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Assigned Leads</span>
                  <span className={styles.statValue}>{selectedEvent.completed}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Dropped Leads</span>
                  <span className={styles.statValue}>{insights.totalNoShow}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Participates' && (
          <div className={styles.sectionCard}>
            <div className={styles.filterRow}>
              <input
                type="text"
                placeholder="Search by name, email, or participant ID"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={styles.filterInput}
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All</option>
                <option value="Attended">Attended</option>
                <option value="No-Show">No-Show</option>
              </select>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Attendance ID</th>
                    <th>Participant ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Check-In Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map(log => (
                      <tr key={log.attendanceId}>
                        <td>{log.attendanceId}</td>
                        <td>{log.participantId}</td>
                        <td>{log.name}</td>
                        <td>{log.email}</td>
                        <td>{formatDateTime(log.checkInTime)}</td>
                        <td>
                          <span
                            className={`${styles.tableStatus} ${
                              log.status === 'Attended'
                                ? styles.attendedStatus
                                : styles.noShowStatus
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className={styles.noRows}>
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Comments' && (
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Comments</h2>
            <p className={styles.sectionText}>
              Comments and feedback can be shown here for future enhancement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceNoShowCharts;
