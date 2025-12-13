import { useEffect, useState } from 'react';
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
  const params = new URLSearchParams(search);
  const emailToken = params.get('token') || '';
  const activityId = params.get('a') || '1';

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

        if (!res.ok)
          throw new Error(
            payload?.message || payload?.error || res.statusText,
          );

        if (!ignore) {
          setPoll(payload);
          setSelected(
            Number.isInteger(payload.currentVote)
              ? payload.currentVote
              : null,
          );
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

      if (!res.ok)
        throw new Error(
          payload?.message || payload?.error || res.statusText,
        );

      setMsg('Thanks! Your selection has been recorded.');
    } catch (e) {
      setMsg(`Error: ${e.message || String(e)}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (!activityId) {
    return (
      <div className={styles.reschedulePage}>
        <p>Missing activity.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.reschedulePage}>
        <p>Loading poll…</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className={styles.reschedulePage}>
        <p>{msg || 'No poll found.'}</p>
      </div>
    );
  }

  return (
    <div
      className={styles.reschedulePage}
      style={{ maxWidth: 640, margin: '24px auto' }}
    >
      <h2 style={{ marginBottom: 4 }}>{poll.activity.title}</h2>
      <div className="muted" style={{ marginBottom: 16 }}>
        {poll.activity.location}
      </div>
      {poll.reason ? (
        <p>
          <strong>Reason:</strong> {poll.reason}
        </p>
      ) : null}
      <form onSubmit={onSubmit}>
        <fieldset
          style={{ border: '1px solid #d0d7de', borderRadius: 8, padding: 12 }}
        >
          <legend style={{ padding: '0 6px' }}>Choose one time</legend>
          {poll.options.map((opt, idx) => (
            <label
              key={idx}
              style={{
                display: 'block',
                margin: '8px 0',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="opt"
                value={idx}
                checked={selected === idx}
                onChange={() => setSelected(idx)}
                style={{ marginRight: 8 }}
              />
              {fmtHuman(opt, poll.timezone)}
            </label>
          ))}
        </fieldset>
        <div style={{ marginTop: 12 }}>
          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={selected === null || submitting}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </form>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
