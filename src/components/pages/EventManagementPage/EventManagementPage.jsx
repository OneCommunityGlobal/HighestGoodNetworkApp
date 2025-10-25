import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import styles from './EventOrganizerPage.module.css';
import {
  getEvent,
  getEngagement,
  updateDescription,
  updateRating,
  updateStatus,
  uploadMedia,
} from '../../api/events';
import EventInfoCard from './components/EventInfoCard';
import StatusRating from './components/StatusRating';
import DateSelector from './components/DateSelector';
import CalendarView from './components/CalendarView';
import DescriptionEditor from './components/DescriptionEditor';
import Tabs from './components/Tabs';

export default function EventOrganizerPage() {
  const { activityid } = useParams();
  const location = useLocation();
  const history = useHistory();

  const params = new URLSearchParams(location.search);
  const dateParam = params.get('date') || undefined;

  const [loading, setLoading] = useState(true);
  const [evt, setEvt] = useState(null);
  const [eng, setEng] = useState(null);
  const [activeTab, setActiveTab] = useState('Description');

  const selectedDate = useMemo(() => dateParam || (evt && evt.dates && evt.dates[0]), [
    dateParam,
    evt?.dates,
  ]);

  useEffect(() => {
    if (!activityid) return;
    setLoading(true);
    Promise.all([getEvent(activityid, dateParam), getEngagement(activityid, dateParam)])
      .then(([e, en]) => {
        setEvt(e);
        setEng(en);
      })
      .finally(() => setLoading(false));
  }, [activityid, dateParam]);

  function onSwitchDate(nextISO) {
    const next = new URLSearchParams(location.search);
    next.set('date', nextISO);
    history.push({ search: next.toString() });
  }

  async function onSaveDescription(description) {
    if (!activityid || !selectedDate) return;
    await updateDescription(activityid, { date: selectedDate, description });
    const refreshed = await getEvent(activityid, selectedDate);
    setEvt(refreshed);
  }

  async function onUpload(file) {
    if (!activityid) return;
    return uploadMedia(activityid, file);
  }

  async function onSetStatus(status) {
    if (!activityid) return;
    await updateStatus(activityid, status);
    const refreshed = await getEvent(activityid, selectedDate);
    setEvt(refreshed);
  }

  async function onSetRating(r) {
    if (!activityid) return;
    await updateRating(activityid, r);
    const refreshed = await getEvent(activityid, selectedDate);
    setEvt(refreshed);
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!evt) return <div style={{ padding: 24 }}>Event not found.</div>;

  return (
    <div className={styles.wrapper}>
      {/* Left column */}
      <div className={styles.leftCol}>
        <div className={styles.card}>
          <EventInfoCard event={evt} />
        </div>

        <div className={styles.card}>
          <div className={styles.sectionHeader}>Status & Rating</div>
          <StatusRating
            status={evt.status}
            rating={evt.rating ?? 0}
            onChangeStatus={onSetStatus}
            onChangeRating={onSetRating}
          />
        </div>

        <div className={styles.card}>
          <div className={styles.sectionHeader}>Date & Time Selection</div>
          <DateSelector dates={evt.dates} selected={selectedDate} onChange={onSwitchDate} />
        </div>

        <div className={styles.card}>
          <div className={styles.sectionHeader}>Calendar</div>
          <CalendarView dates={evt.dates} selected={selectedDate} onSelect={onSwitchDate} />
        </div>
      </div>

      {/* Right column */}
      <div className={styles.rightCol}>
        <div className={styles.card}>
          <Tabs
            tabs={['Description', 'Analysis', 'Resource', 'Engagement']}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {activeTab === 'Description' && (
          <div className={styles.card}>
            <DescriptionEditor
              initialValue={evt.description || ''}
              onSave={onSaveDescription}
              onUpload={onUpload}
            />
          </div>
        )}

        {activeTab === 'Engagement' && (
          <div className={styles.card}>
            <div className={styles.sectionHeader}>Engagement (summary)</div>
            <div>Views: {eng?.totalViews ?? 0}</div>
            <div>Unique attendees: {eng?.uniqueAttendees ?? 0}</div>
            <div>
              Last updated: {eng?.lastUpdated ? new Date(eng.lastUpdated).toLocaleString() : '—'}
            </div>
          </div>
        )}

        {activeTab === 'Analysis' && <div className={styles.card}>Analysis: coming soon</div>}
        {activeTab === 'Resource' && <div className={styles.card}>Resource: coming soon</div>}
      </div>
    </div>
  );
}
