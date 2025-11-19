import { useMemo, useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUserAlt,
  FaUsers,
  FaChartPie,
  FaRegCalendarCheck,
} from 'react-icons/fa';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import moment from 'moment-timezone';
import {
  getEventById,
  getAttendanceByEvent,
  getAttendanceSummary,
  getMockAttendanceForEvent,
} from '~/actions/attendanceActions';
import styles from './LogAttendance.module.css';

const tabs = ['Description', 'Analysis', 'Participates', 'Comments'];
const statusFilters = ['all', 'checked_in', 'no_show', 'pending'];

function LogAttendance() {
  const { activityId } = useParams();
  const darkMode = useSelector(state => state.theme.darkMode);
  const [activeTab, setActiveTab] = useState('Analysis');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'checkInTime', direction: 'desc' });
  const [eventDetails, setEventDetails] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  const isFetchingRef = useRef(false);
  const fetchedActivityIdRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      // Prevent duplicate calls - if already fetching or already fetched this activityId
      if (isFetchingRef.current || fetchedActivityIdRef.current === activityId) {
        return;
      }

      isFetchingRef.current = true;
      fetchedActivityIdRef.current = activityId;
      setLoading(true);
      setError(null);

      try {
        // Fetch event details
        const eventResponse = await getEventById(activityId);
        if (eventResponse.status && eventResponse.status >= 400) {
          throw new Error(eventResponse.message || 'Failed to fetch event');
        }
        const event = eventResponse.data;

        // Format event details
        const formattedEvent = {
          id: event._id || event.id,
          name: event.title,
          organizer: event.resources?.[0]?.name || 'Unknown',
          type: `${event.type} / ${event.location}`,
          status: event.status || 'New',
          date: moment(event.date).format('dddd, MMM D'),
          time: `${moment(event.startTime).format('h:mm A')} - ${moment(event.endTime).format(
            'h:mm A',
          )}`,
          capacity: event.maxAttendees,
          seatsFilled: event.currentAttendees || 0,
          location: event.location,
          description: event.description,
          link: event.resources?.[0]?.location || '',
        };
        setEventDetails(formattedEvent);

        // Try to fetch real attendance data, fallback to mock if it fails
        let attendanceResponse = await getAttendanceByEvent(activityId);
        if (attendanceResponse.status && attendanceResponse.status >= 400) {
          // If no real data, use mock data
          attendanceResponse = await getMockAttendanceForEvent(activityId);
          if (attendanceResponse.status && attendanceResponse.status >= 400) {
            throw new Error(attendanceResponse.message || 'Failed to fetch attendance data');
          }
          setUseMockData(true);
        }

        // Transform attendance records
        const records = (attendanceResponse.data || []).map(record => ({
          id: record.attendanceCode || record._id,
          participantName: record.participantName,
          participantId:
            record.participantId?._id || record.participantId || record.participantExternalId,
          email: record.participantEmail || record.participantId?.email || '',
          checkInTime: record.checkInTime ? moment(record.checkInTime).format('h:mm A') : '—',
          status:
            record.status === 'checked_in'
              ? 'Checked In'
              : record.status === 'no_show'
              ? 'No Show'
              : 'Pending',
          rawStatus: record.status,
        }));
        setAttendanceRecords(records);

        // Fetch summary
        const summaryResponse = await getAttendanceSummary(activityId, formattedEvent.seatsFilled);
        if (summaryResponse.data) {
          setAttendanceSummary(summaryResponse.data);
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading data');
        fetchedActivityIdRef.current = null; // Reset on error to allow retry
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    if (activityId) {
      fetchData();
    }

    // Reset refs when activityId changes
    return () => {
      if (fetchedActivityIdRef.current !== activityId) {
        fetchedActivityIdRef.current = null;
        isFetchingRef.current = false;
      }
    };
  }, [activityId]);

  const filteredRecords = useMemo(() => {
    if (statusFilter === 'all') {
      return attendanceRecords;
    }
    if (statusFilter === 'checked_in') {
      return attendanceRecords.filter(record => record.status === 'Checked In');
    }
    if (statusFilter === 'no_show') {
      return attendanceRecords.filter(record => record.status === 'No Show');
    }
    return attendanceRecords.filter(record => record.status === 'Pending');
  }, [attendanceRecords, statusFilter]);

  const sortedRecords = useMemo(() => {
    if (!sortConfig?.key) {
      return filteredRecords;
    }
    const sorted = [...filteredRecords].sort((a, b) => {
      const first = a[sortConfig.key];
      const second = b[sortConfig.key];
      if (first === second) return 0;
      if (first === '—') return 1;
      if (second === '—') return -1;
      if (first > second) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return sortConfig.direction === 'asc' ? -1 : 1;
    });
    return sorted;
  }, [filteredRecords, sortConfig]);

  const handleSort = key => {
    setSortConfig(previous => {
      if (previous.key === key) {
        return {
          key,
          direction: previous.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const attendanceStats = useMemo(() => {
    if (!attendanceSummary && attendanceRecords.length === 0) {
      return {
        attended: 0,
        noShows: 0,
        pending: 0,
        registered: eventDetails?.seatsFilled || 0,
        attendanceRate: 0,
        participationRate: 0,
        noShowRate: 0,
      };
    }

    // Use summary data if available, otherwise calculate from records
    if (attendanceSummary) {
      const registered = attendanceSummary.denominator || eventDetails?.seatsFilled || 0;
      return {
        attended: attendanceSummary.totals?.checkedIn || 0,
        noShows: attendanceSummary.totals?.noShow || 0,
        pending: attendanceSummary.totals?.pending || 0,
        registered,
        attendanceRate: attendanceSummary.attendanceRate || 0,
        participationRate: attendanceSummary.participationRate || 0,
        noShowRate: attendanceSummary.noShowRate || 0,
      };
    }

    // Fallback calculation from records
    const attended = attendanceRecords.filter(record => record.status === 'Checked In').length;
    const noShows = attendanceRecords.filter(record => record.status === 'No Show').length;
    const pending = attendanceRecords.filter(record => record.status === 'Pending').length;
    const registered = eventDetails?.seatsFilled || attendanceRecords.length || 1;
    const attendanceRate = Math.round((attended / registered) * 100);
    const participationRate =
      attendanceRecords.length > 0 ? Math.round((attended / attendanceRecords.length) * 100) : 0;
    const noShowRate = Math.round((noShows / registered) * 100);
    return {
      attended,
      noShows,
      pending,
      registered,
      attendanceRate,
      participationRate,
      noShowRate,
    };
  }, [attendanceRecords, attendanceSummary, eventDetails]);

  const totalLogged = attendanceRecords.length;

  const popularityPeers = useMemo(() => {
    const more = Math.max(attendanceStats.attended - 2, 0);
    const less = Math.max(attendanceStats.registered - more, 0);
    return { more, less };
  }, [attendanceStats.attended, attendanceStats.registered]);

  const insightConfig = useMemo(
    () => [
      {
        title: 'Attendance Rate',
        value: attendanceStats.attendanceRate,
        details: [
          { label: 'show up', value: attendanceStats.attended },
          { label: 'All', value: attendanceStats.registered },
        ],
        colors: ['#0f8fd5', '#c2e8ff'],
      },
      {
        title: 'Participation',
        value: attendanceStats.participationRate,
        details: [
          { label: 'attended', value: attendanceStats.attended },
          { label: 'All', value: totalLogged },
        ],
        colors: ['#2f7f2f', '#c5e5c9'],
      },
      {
        title: 'Popularity',
        value: 64,
        details: [
          { label: 'more', value: popularityPeers.more },
          { label: 'less', value: popularityPeers.less },
        ],
        colors: ['#b6712b', '#ecd1b1'],
      },
    ],
    [
      attendanceStats.attendanceRate,
      attendanceStats.participationRate,
      attendanceStats.attended,
      attendanceStats.registered,
      totalLogged,
      popularityPeers.more,
      popularityPeers.less,
    ],
  );

  const containerClass = `${styles.page} ${darkMode ? styles.darkMode : ''}`;

  if (loading) {
    return (
      <div className={containerClass}>
        <div className={styles.loadingContainer}>
          <p>Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClass}>
        <div className={styles.errorContainer}>
          <p>Error: {error}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!eventDetails) {
    return (
      <div className={containerClass}>
        <div className={styles.errorContainer}>
          <p>Event not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {useMockData && (
        <div className={styles.mockDataNotice}>
          <p>
            Using mock data for demonstration. Real attendance data will appear once records are
            created.
          </p>
        </div>
      )}
      <section className={styles.summaryCard}>
        <div className={styles.heroLeft}>
          <div className={styles.ribbon}>Finished</div>
          <div className={styles.eventHeader}>
            <div>
              <span className={styles.eventType}>{eventDetails.type}</span>
              <h1>{eventDetails.name}</h1>
              <a href={eventDetails.link} target="_blank" rel="noreferrer">
                {eventDetails.link}
              </a>
            </div>
            <button type="button" className={styles.shareBtn}>
              Share Availability
            </button>
          </div>
          <div className={styles.metaGrid}>
            <MetaRow icon={<FaCalendarAlt />} label="Date" value={eventDetails.date} />
            <MetaRow icon={<FaClock />} label="Time" value={eventDetails.time} />
            <MetaRow icon={<FaUserAlt />} label="Organizer" value={eventDetails.organizer} />
            <MetaRow icon={<FaMapMarkerAlt />} label="Location" value={eventDetails.location} />
          </div>
          <div className={styles.metaBottom}>
            <MetaRow
              icon={<FaUsers />}
              label="Capacity"
              value={`${eventDetails.seatsFilled}/${eventDetails.capacity}`}
            />
            <MetaRow icon={<FaChartPie />} label="Overall Rating" value="★★★★☆" />
            <div className={styles.avatarStack}>
              {['AL', 'TR', 'LB', 'SM', '+3'].map(avatar => (
                <span key={avatar}>{avatar}</span>
              ))}
            </div>
            <span className={styles.statusBadge}>{eventDetails.status}</span>
          </div>
        </div>
        <div className={styles.heroRight}>
          <MiniCalendar />
        </div>
      </section>

      <section className={styles.tabs}>
        {tabs.map(tab => (
          <button
            type="button"
            key={tab}
            className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </section>

      {activeTab !== 'Analysis' ? (
        <section className={styles.placeholder}>
          <p>
            The <strong>{activeTab}</strong> section is coming soon. Stay tuned!
          </p>
        </section>
      ) : (
        <>
          <section className={styles.analyticsCards}>
            {insightConfig.map(card => (
              <RingCard key={card.title} config={card} />
            ))}
          </section>

          <section className={styles.progressPanel}>
            <header>
              <h2>Participants stay length record analysis</h2>
              <div className={styles.stayPill}>stay for 2.5-3 h</div>
            </header>
            <div className={styles.progressBar}>
              <div className={styles.segmentBlue} style={{ width: '87%' }}>
                87% Stayed
              </div>
              <div className={styles.segmentAmber} style={{ width: '3%' }}>
                3% Late
              </div>
              <div className={styles.segmentPink} style={{ width: '18%' }}>
                18% Early exit
              </div>
              <div className={styles.segmentPurple} style={{ width: '8%' }}>
                8% Unknown
              </div>
            </div>
            <footer className={styles.leadsBreakdown}>
              <div>
                <span>Total Leads : 6570</span>
                <span>Converted Leads 650</span>
              </div>
              <div>
                <span>Assigned Leads 650</span>
                <span>Dropped Leads 650</span>
              </div>
            </footer>
          </section>

          <section className={styles.attendancePanel}>
            <header className={styles.panelHeader}>
              <div>
                <h2>Attendance Log</h2>
                <p>Track arrivals, no-shows, and pending participants in real time.</p>
              </div>
              <div className={styles.controls}>
                <label htmlFor="status-filter">
                  Status Filter
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={event => setStatusFilter(event.target.value)}
                  >
                    {statusFilters.map(filter => (
                      <option key={filter} value={filter}>
                        {filter === 'all'
                          ? 'All Statuses'
                          : filter === 'checked_in'
                          ? 'Checked In'
                          : filter === 'no_show'
                          ? 'No Shows'
                          : 'Pending'}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </header>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <SortableHeader
                      label="Attendance ID"
                      sortKey="id"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Participant"
                      sortKey="participantName"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    <th>Participant ID</th>
                    <th>Email</th>
                    <SortableHeader
                      label="Check-in Time"
                      sortKey="checkInTime"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Status"
                      sortKey="status"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </tr>
                </thead>
                <tbody>
                  {sortedRecords.map(record => (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>{record.participantName}</td>
                      <td>{record.participantId}</td>
                      <td>{record.email}</td>
                      <td>{record.checkInTime}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            record.status === 'Checked In'
                              ? styles.statusSuccess
                              : record.status === 'Pending'
                              ? styles.statusPending
                              : styles.statusDanger
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function MetaRow({ icon, label, value }) {
  return (
    <div className={styles.metaRow}>
      {icon}
      <div>
        <p>{label}</p>
        <span>{value}</span>
      </div>
    </div>
  );
}

function MiniCalendar() {
  const weeks = [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    ['29', '30', '31', '1', '2', '3', '4'],
    ['5', '6', '7', '8', '9', '10', '11'],
    ['12', '13', '14', '15', '16', '17', '18'],
    ['19', '20', '21', '22', '23', '24', '25'],
    ['26', '27', '28', '29', '30', '1', '2'],
  ];
  return (
    <div className={styles.calendarShell}>
      <header>
        <div>
          <p>September 2024</p>
          <span>Event Status</span>
        </div>
        <button type="button">
          <HiOutlineDotsHorizontal />
        </button>
      </header>
      <div className={styles.finishedBadge}>Finished</div>
      <div className={styles.calendarGrid}>
        {weeks.map((row, index) => (
          <div key={row.join('-')} className={styles.calendarRow}>
            {row.map(day => (
              <span
                key={`${day}-${index}`}
                className={day === '9' || day === '10' || day === '11' ? styles.calendarActive : ''}
              >
                {day}
              </span>
            ))}
          </div>
        ))}
      </div>
      <footer>
        <FaRegCalendarCheck />
        <span>Share availability</span>
      </footer>
    </div>
  );
}

function RingCard({ config }) {
  const { title, value, details = [], colors } = config;
  return (
    <article className={styles.ringCard}>
      <header>
        <h3>{title}</h3>
        <button type="button" aria-label={`More options for ${title}`}>
          <HiOutlineDotsHorizontal />
        </button>
      </header>
      <div className={styles.ringWrapper}>
        <div
          className={styles.ring}
          style={{
            background: `conic-gradient(${colors[0]} ${value * 3.6}deg, ${colors[1]} 0)`,
          }}
        >
          <span>{value}%</span>
        </div>
      </div>
      <div className={styles.legend}>
        {details.map(item => (
          <div key={`${title}-${item.label}`} className={styles.legendItem}>
            <span>{item.value}</span>
            <p>{item.label}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function SortableHeader({ label, sortKey, sortConfig, onSort }) {
  return (
    <th>
      <button type="button" onClick={() => onSort(sortKey)} className={styles.sortButton}>
        {label}
        {sortConfig.key === sortKey && (
          <span aria-live="polite" className={styles.sortDirection}>
            {sortConfig.direction === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </button>
    </th>
  );
}

export default LogAttendance;
