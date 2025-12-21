import React from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import styles from './ProjectManagerNotification.module.css';

const DRAFT_KEY = 'pm_notif_draft';

const api = axios.create({
  baseURL: process.env.REACT_APP_APIENDPOINT || '',
});

function getToken() {
  const raw = localStorage.getItem('token') || '';
  return String(raw)
    .replace(/^"(.*)"$/, '$1')
    .trim();
}

async function POST(url, data) {
  const token = getToken();
  const headers = token ? { Authorization: token } : {};
  try {
    return await api.post(url, data, { headers });
  } catch (err) {
    if (err?.response?.status === 401) {
      const body = new URLSearchParams();
      Object.entries(data || {}).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(x => body.append(`${k}[]`, x));
        else body.append(k, v);
      });
      if (token) body.set('token', token);
      return api.post(url, body);
    }
    throw err;
  }
}

async function previewNotification(payload) {
  const res = await POST('/pm/notifications/preview', payload);
  return res?.data;
}

async function sendNotification(payload) {
  const res = await POST('/pm/notifications', payload);
  return res?.data ?? { ok: true };
}

export default function ProjectManagerNotification({ educators, onClose, onSent }) {
  const darkMode = useSelector(s => s.theme?.darkMode);

  const [selected, setSelected] = React.useState([]);
  const [message, setMessage] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) setMessage(saved);
  }, []);

  React.useEffect(() => {
    localStorage.setItem(DRAFT_KEY, message);
  }, [message]);

  React.useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const allChecked = selected.length === educators.length && educators.length > 0;
  const someChecked = selected.length > 0 && selected.length < educators.length;

  const toggleAll = () => setSelected(allChecked ? [] : educators.map(e => e.id));

  const toggleOne = id =>
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  async function handleSend() {
    setSending(true);
    setError(null);
    try {
      const trimmed = message.trim();
      if (!trimmed) throw new Error('Enter a message.');
      if (selected.length === 0) throw new Error('Select at least one educator.');

      const preview = await previewNotification({
        educatorIds: selected,
        message: trimmed,
      });

      const mode = preview?.mode;
      const validLen = preview?.summary?.willSendTo ?? preview?.summary?.validIds?.length ?? 0;
      const allFlag = !!preview?.summary?.all;

      if (mode === 'real' && validLen === 0 && !allFlag) {
        const unknown = preview?.summary?.unknownIds || [];
        throw new Error(
          unknown.length
            ? `No valid recipients. Unknown IDs: ${unknown.join(', ')}`
            : 'No valid recipients.',
        );
      }

      const resp = await sendNotification({
        educatorIds: selected,
        message: trimmed,
      });

      localStorage.removeItem(DRAFT_KEY);
      onSent({ educatorIds: selected, message: trimmed, resp });
    } catch (e) {
      setError(e.message || 'Failed to send.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className={`${styles.overlay} ${darkMode ? styles.dark : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="composer-title"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 id="composer-title" className={styles.title}>
            New Announcement
          </h3>
          <button className={styles.iconBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Recipients</div>

            <div className={styles.checkAll}>
              <input
                id="select-all-educators"
                type="checkbox"
                checked={allChecked}
                ref={el => el && (el.indeterminate = someChecked)}
                onChange={toggleAll}
              />
              <label htmlFor="select-all-educators">Select all</label>
            </div>

            <div className={styles.list}>
              {educators.map(e => (
                <div key={e.id} className={styles.item}>
                  <input
                    id={`educator-${e.id}`}
                    type="checkbox"
                    checked={selected.includes(e.id)}
                    onChange={() => toggleOne(e.id)}
                  />
                  <label htmlFor={`educator-${e.id}`} className={styles.itemText}>
                    <span className={styles.itemName}>{e.name}</span>
                    <span className={styles.itemMeta}> • {e.subject}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionLabel}>Message</div>
            <textarea
              className={styles.textarea}
              placeholder="Write your announcement to teachers…"
              rows={6}
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={1000}
            />
            <div className={styles.counter}>{message.length}/1000</div>
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtnNotify} onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button className={styles.primaryBtn} onClick={handleSend} disabled={sending}>
            {sending ? 'Sending…' : 'Send Announcement'}
          </button>
        </div>
      </div>
    </div>
  );
}
