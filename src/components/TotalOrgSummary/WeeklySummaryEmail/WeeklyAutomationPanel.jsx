import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import hasPermission from '../../../utils/permissions';
import { ENDPOINTS } from '../../../utils/URL';
import styles from './WeeklyAutomationPanel.module.css';

const PERMISSION = 'putUserProfileImportantInfo';
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const pad = n => String(n).padStart(2, '0');

const parseAlertRecipients = text =>
  text
    .split(/[\s,;]+/)
    .map(entry => entry.trim())
    .filter(Boolean);

const toForm = settings => ({
  enabled: Boolean(settings.enabled),
  dayOfWeek: settings.dayOfWeek,
  time: `${pad(settings.hour)}:${pad(settings.minute)}`,
  alertText: (settings.alertRecipients || []).join('\n'),
});

const formatInZone = (value, timezone) =>
  value
    ? moment(value)
        .tz(timezone)
        .format('ddd, MMM D, h:mm A z')
    : 'Not scheduled';

const apiError = (error, fallback) => {
  const data = error?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length) return data.errors.join('. ');
  return data?.error || fallback;
};

export default function WeeklyAutomationPanel() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const canManage = dispatch(hasPermission(PERMISSION));

  const [status, setStatus] = useState(null);
  const [form, setForm] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmingSend, setConfirmingSend] = useState(false);

  const applyStatus = useCallback(next => {
    setStatus(next);
    setForm(toForm(next.settings));
  }, []);

  useEffect(() => {
    if (!canManage) return undefined;
    let cancelled = false;
    axios
      .get(ENDPOINTS.ORG_SUMMARY_EMAIL_STATUS())
      .then(response => {
        if (!cancelled) applyStatus(response.data);
      })
      .catch(error => {
        if (!cancelled)
          setLoadError(apiError(error, 'Could not load the automatic send settings.'));
      });
    return () => {
      cancelled = true;
    };
  }, [canManage, applyStatus]);

  if (!canManage) {
    return (
      <p className={`${styles.readOnly} ${darkMode ? styles.panelDark : ''}`}>
        The weekly Total Org Summary email is sent automatically. Its schedule is managed by an
        administrator.
      </p>
    );
  }

  const panelClass = `${styles.panel} ${darkMode ? styles.panelDark : ''}`;

  if (loadError) {
    return (
      <section className={panelClass}>
        <h2 className={styles.title}>Weekly automatic send</h2>
        <p className={`${styles.error} ${darkMode ? styles.errorDark : ''}`} role="alert">
          {loadError}
        </p>
      </section>
    );
  }

  if (!status || !form) {
    return (
      <section className={panelClass}>
        <h2 className={styles.title}>Weekly automatic send</h2>
        <p className={styles.statusLine}>Loading...</p>
      </section>
    );
  }

  const { settings } = status;
  const alertRecipients = parseAlertRecipients(form.alertText);
  const badAlert = alertRecipients.find(email => !EMAIL_PATTERN.test(email));
  const [hour, minute] = form.time.split(':').map(Number);
  const timeValid = form.time !== '' && Number.isInteger(hour) && Number.isInteger(minute);
  const saved = toForm(settings);
  const unchanged =
    form.enabled === saved.enabled &&
    Number(form.dayOfWeek) === saved.dayOfWeek &&
    form.time === saved.time &&
    alertRecipients.join('\n') === saved.alertText;

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.put(ENDPOINTS.ORG_SUMMARY_EMAIL_SETTINGS(), {
        enabled: form.enabled,
        dayOfWeek: Number(form.dayOfWeek),
        hour,
        minute,
        alertRecipients,
      });
      applyStatus(response.data);
      toast.success('Automatic send settings saved.');
    } catch (error) {
      toast.error(apiError(error, 'Could not save the automatic send settings.'));
    } finally {
      setSaving(false);
    }
  };

  const handleSendNow = async () => {
    setConfirmingSend(false);
    setSending(true);
    try {
      const response = await axios.post(ENDPOINTS.ORG_SUMMARY_EMAIL_SEND(), {});
      const outcome = response.data?.status;
      if (outcome === 'sent') toast.success('Total Org Summary email sent.');
      else if (outcome === 'disabled')
        toast.info('Email sending is switched off in this environment.');
      else toast.info("This week's email has already been sent or is being sent.");
      const refreshed = await axios.get(ENDPOINTS.ORG_SUMMARY_EMAIL_STATUS());
      applyStatus(refreshed.data);
    } catch (error) {
      toast.error(apiError(error, 'Could not send the Total Org Summary email.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={panelClass} aria-label="Weekly automatic send">
      <div className={styles.header}>
        <h2 className={styles.title}>Weekly automatic send</h2>
        <div className="custom-control custom-switch">
          <input
            id="orgSummaryAutoSendEnabled"
            type="checkbox"
            className="custom-control-input"
            checked={form.enabled}
            onChange={e => setForm({ ...form, enabled: e.target.checked })}
          />
          <label className="custom-control-label" htmlFor="orgSummaryAutoSendEnabled">
            {form.enabled ? 'On' : 'Off'}
          </label>
        </div>
      </div>

      <p className={styles.statusLine}>
        Next send:{' '}
        <strong>
          {settings.enabled ? formatInZone(status.nextScheduledSend, settings.timezone) : 'Off'}
        </strong>
        . Goes to {status.recipientCount} recipient{status.recipientCount === 1 ? '' : 's'}.
      </p>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="orgSummaryDay">Day</label>
          <select
            id="orgSummaryDay"
            className="form-control"
            value={form.dayOfWeek}
            onChange={e => setForm({ ...form, dayOfWeek: Number(e.target.value) })}
          >
            {DAYS.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="orgSummaryTime">Time ({settings.timezone})</label>
          <input
            id="orgSummaryTime"
            type="time"
            className="form-control"
            value={form.time}
            onChange={e => setForm({ ...form, time: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.alertField}>
        <label htmlFor="orgSummaryAlerts" className="font-weight-bold">
          Extra failure alert recipients
        </label>
        <textarea
          id="orgSummaryAlerts"
          className="form-control"
          rows={2}
          placeholder="One email per line"
          value={form.alertText}
          onChange={e => setForm({ ...form, alertText: e.target.value })}
        />
        {badAlert && (
          <p className={`${styles.error} ${darkMode ? styles.errorDark : ''}`} role="alert">
            {badAlert} is not a valid email address.
          </p>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || unchanged || Boolean(badAlert) || !timeValid}
        >
          {saving ? 'Saving...' : 'Save schedule'}
        </button>
        {confirmingSend ? (
          <>
            <span>
              Send to {status.recipientCount} recipient{status.recipientCount === 1 ? '' : 's'} now?
            </span>
            <button type="button" className="btn btn-success" onClick={handleSendNow}>
              Yes, send
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirmingSend(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() => setConfirmingSend(true)}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send now'}
          </button>
        )}
      </div>

      {status.recentRuns.length > 0 && (
        <div className={styles.runsScroll}>
          <table className={`${styles.runs} ${darkMode ? styles.runsDark : ''}`}>
            <caption className="sr-only">Recent automatic sends</caption>
            <thead>
              <tr>
                <th scope="col">Week of</th>
                <th scope="col">Result</th>
                <th scope="col">Trigger</th>
                <th scope="col">Detail</th>
              </tr>
            </thead>
            <tbody>
              {status.recentRuns.map(run => (
                <tr key={run.runKey}>
                  <td>{run.runKey}</td>
                  <td>{run.status}</td>
                  <td>{run.trigger}</td>
                  <td>{run.error || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
