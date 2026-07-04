import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import styles from './RescheduleEvent.module.css';
import { ApiEndpoint } from '~/utils/URL';

function getApiOrigin() {
  try {
    const u = new URL(ApiEndpoint);
    return u.origin;
  } catch {
    return window.location.origin.replace(':5173', ':4500');
  }
}

function fmtHuman(opt, tz) {
  const to12 = hhmm => {
    const [H, M] = hhmm.split(':').map(Number);
    const ap = H >= 12 ? 'PM' : 'AM';
    const h12 = H % 12 || 12;
    return `${h12}:${String(M).padStart(2, '0')} ${ap}`;
  };

  const d = new Date(`${opt.dateISO}T00:00:00`);
  const dateStr = d.toDateString();
  return `${dateStr} • ${to12(opt.start)} – ${to12(opt.end)} (${tz})`;
}

export default function ReschedulePoll() {
  const { search } = useLocation();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const params = new URLSearchParams(search);
  const emailToken = params.get('token') || '';
  const activityId = params.get('a') || '1';
  const pageClassName = `${styles.reschedulePage} ${styles.pollPage} ${
    darkMode ? styles.reschedulePageDark : ''
  }`;

  const [loading, setLoading] = useState(true);
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);

        const origin = getApiOrigin();
        const url = `${origin}/api/communityportal/activities/${activityId}/reschedule/poll?token=${encodeURIComponent(
          emailToken,
        )}`;

        const headers = {};
        const jwt = localStorage.getItem('token');
        if (jwt) headers.Authorization = jwt;

        const res = await fetch(url, { headers });

        const ct = res.headers.get('content-type') || '';
        const payload = ct.includes('application/json')
          ? await res.json()
          : { error: await res.text() };

        if (!res.ok) throw new Error(payload?.message || payload?.error || res.statusText);

        if (!ignore) {
          setPoll(payload);
          setSelected(Number.isInteger(payload.currentVote) ? payload.currentVote : null);
        }
      } catch (e) {
        if (!ignore) setMsg(`Error: ${e.message || String(e)}`);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (activityId) load();
    return () => {
      ignore = true;
    };
  }, [activityId, emailToken]);

  async function onSubmit(e) {
    e.preventDefault();
    if (selected === null) return;

    try {
      setSubmitting(true);
      setMsg('');

      const origin = getApiOrigin();
      const url = `${origin}/api/communityportal/activities/${activityId}/reschedule/vote`;

      const headers = { 'Content-Type': 'application/json' };
      const jwt = localStorage.getItem('token');
      if (jwt) headers.Authorization = jwt;

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          token: emailToken,
          optionIdx: selected,
        }),
      });

      const ct = res.headers.get('content-type') || '';
      const payload = ct.includes('application/json')
        ? await res.json()
        : { error: await res.text() };

      if (!res.ok) throw new Error(payload?.message || payload?.error || res.statusText);

      setMsg('Thanks! Your selection has been recorded.');
    } catch (e) {
      setMsg(`Error: ${e.message || String(e)}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (!activityId) {
    return (
      <div className={pageClassName}>
        <p>Missing activity.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={pageClassName}>
        <p>Loading poll…</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className={pageClassName}>
        <p>{msg || 'No poll found.'}</p>
      </div>
    );
  }

  return (
    <div className={pageClassName}>
      <h2>{poll.activity.title}</h2>
      <div className={styles.muted}>{poll.activity.location}</div>
      {poll.reason ? (
        <p>
          <strong>Reason:</strong> {poll.reason}
        </p>
      ) : null}
      <form onSubmit={onSubmit}>
        <fieldset>
          <legend>Choose one time</legend>
          {poll.options.map((opt, idx) => (
            <label className={styles.pollOption} key={`${opt.dateISO}-${opt.start}-${opt.end}`}>
              <input
                type="radio"
                name="opt"
                value={idx}
                checked={selected === idx}
                onChange={() => setSelected(idx)}
              />
              {fmtHuman(opt, poll.timezone)}
            </label>
          ))}
        </fieldset>
        <div className={styles.pollActions}>
          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={selected === null || submitting}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </form>
      {msg && (
        <p className={msg.startsWith('Error:') ? styles.errorMessage : styles.successMessage}>
          {msg}
        </p>
      )}
    </div>
  );
}
