import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './EventManagementPage.module.css';
import { getEvent, updateEventDescription, updateEventMeta } from '../../../../../api/events';
import EventInfoCard from './components/EventInfoCard';
import Tabs from './components/Tabs';
import DescriptionEditor from './components/DescriptionEditor';
import CalendarView from './components/CalendarView';
import DateSelector from './components/DateSelector';

export default function EventOrganizerPage() {
  const { activityId } = useParams();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getEvent(activityId);
        if (mounted) setEvent(data);
      } catch (e) {
        setError(e.message || 'Load failed');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activityId]);

  const tabs = useMemo(
    () => [
      { key: 'description', label: 'Description' },
      { key: 'analysis', label: 'Analysis' },
      { key: 'resource', label: 'Resource' },
      { key: 'engagement', label: 'Engagement' },
    ],
    [],
  );

  async function handleSaveDescription(next) {
    try {
      setSaving(true);
      const updated = await updateEventDescription(activityId, next);
      setEvent(prev => ({ ...prev, ...updated }));
    } catch (e) {
      alert(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleMetaChange(nextMeta) {
    try {
      const updated = await updateEventMeta(activityId, nextMeta);
      setEvent(prev => ({ ...prev, ...updated }));
    } catch (e) {
      alert(e.message || 'Update failed');
    }
  }

  if (loading)
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  if (error)
    return (
      <div className={styles.page}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  if (!event)
    return (
      <div className={styles.page}>
        <div className={styles.error}>Event not found</div>
      </div>
    );

  return (
    <div className={styles.page} data-testid="event-organizer-page">
      <header className={styles.topbar}>
        <div className={styles.logo}>HGN</div>
        <nav className={styles.nav}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/bmdashboard">BM Dashboard</Link>
          <Link to="/timeline">Timeline</Link>
          <Link to="/project">Project</Link>
          <Link to="/reports">Reports</Link>
        </nav>
        <div className={styles.user}>Welcome, BM’s Name</div>
      </header>

      <main className={styles.main}>
        <section className={styles.grid}>
          <div className={styles.left}>
            <EventInfoCard event={event} onMetaChange={handleMetaChange} />

            <div className={styles.controlsRow}>
              <DateSelector
                value={event.selectedDate}
                dates={event.availableDates}
                onChange={d => handleMetaChange({ selectedDate: d })}
              />
              <CalendarView
                highlightedDates={event.availableDates}
                currentMonth={event.calendarMonth}
                onPickDate={d => handleMetaChange({ selectedDate: d })}
              />
            </div>
          </div>

          <div className={styles.right}>
            <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
            {activeTab === 'description' && (
              <DescriptionEditor
                initialValue={event.description}
                onSubmit={handleSaveDescription}
                isSubmitting={saving}
              />
            )}
            {activeTab === 'analysis' && <div className={styles.placeholder}>Analysis (TBD)</div>}
            {activeTab === 'resource' && <div className={styles.placeholder}>Resource (TBD)</div>}
            {activeTab === 'engagement' && (
              <div className={styles.placeholder}>Engagement (TBD)</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
