import { useState, useEffect } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import { ApiEndpoint } from '~/utils/URL';
import styles from './RescheduleEvent.module.css';

function RescheduleEvent({ activity }) {
  const { activityId: routeActivityId } = useParams();
  const history = useHistory();
  const location = useLocation();

  const routedActivity = location.state?.activity;

  const eventInfo = activity ||
    routedActivity || {
      _id: routeActivityId,
      id: routeActivityId,
      name: 'Event',
      location: '',
      link: '',
    };
  const activityId = eventInfo._id || eventInfo.id || routeActivityId;

  const darkMode = useSelector(state => state.theme?.darkMode);

  const [confirmStep, setConfirmStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [options, setOptions] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const closeModal = () => {
    setConfirmStep(false);
    setSelectedDate(null);
    setSelectedTime('');
    setReason('');
    setOptions([]);
    history.push('/communityportal/activities');
  };

  const formatTime = hour24 => {
    const hour = ((hour24 % 24) + 24) % 24;
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour < 12 ? 'AM' : 'PM';
    return `${String(h12).padStart(2, '0')}:00 ${period}`;
  };

  const getTimeSlots = (startHour = 8, endHour = 24, step = 2) => {
    const slots = [];
    for (let h = startHour; h + step <= endHour; h += step) {
      const end = h + step;
      slots.push(`${formatTime(h)} - ${formatTime(end)}`);
    }
    return slots;
  };

  const toISODate = d => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const addOption = () => {
    if (!selectedDate || !selectedTime) return;

    const dateISO = toISODate(selectedDate);
    const dateLabel = selectedDate.toDateString();
    const timeSlot = selectedTime;

    const exists = options.some(opt => opt.dateISO === dateISO && opt.timeSlot === timeSlot);

    if (exists) {
      // eslint-disable-next-line no-alert
      alert('That date & time is already in the poll list.');
      return;
    }

    if (options.length >= 5) {
      // eslint-disable-next-line no-alert
      alert('You can add up to 5 options.');
      return;
    }

    setOptions(prev =>
      [...prev, { dateISO, dateLabel, timeSlot }].sort(
        (a, b) => new Date(a.dateISO) - new Date(b.dateISO),
      ),
    );

    setSelectedTime('');
  };

  const removeOption = idx => {
    setOptions(prev => prev.filter((_, i) => i !== idx));
  };

  const parse12to24 = label => {
    const [time, ap] = label.split(' ');
    let [h, m] = time.split(':').map(Number);

    if (ap === 'PM' && h !== 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const buildBackendOptions = opts =>
    opts.map(opt => {
      const [startLabel, endLabel] = opt.timeSlot.split(' - ');
      return {
        dateISO: opt.dateISO,
        start: parse12to24(startLabel),
        end: parse12to24(endLabel),
      };
    });

  const sendRescheduleRequest = async (id, payload) => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = token;
    }

    const res = await fetch(`${ApiEndpoint}/communityportal/activities/${id}/reschedule/notify`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }

    return res.json();
  };

  const handleCreateAndNotify = async () => {
    setLoading(true);

    try {
      const beOptions = buildBackendOptions(options);

      const json = await sendRescheduleRequest(activityId, {
        options: beOptions,
        reason: reason || '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      const successMessage =
        json.emailMode === 'dry-run'
          ? `Poll created successfully. Email delivery was skipped locally for ${json.skipped} participants.`
          : `Notification sent to ${json.notified} participants.`;

      setLoading(false);
      history.replace('/communityportal/activities');

      window.setTimeout(() => {
        // eslint-disable-next-line no-alert
        alert(successMessage);
      }, 0);
    } catch (e) {
      setLoading(false);

      // eslint-disable-next-line no-alert
      alert(`Error: ${e.message}`);
    }
  };

  return (
    <RescheduleModal
      darkMode={darkMode}
      eventInfo={eventInfo}
      confirmStep={confirmStep}
      setConfirmStep={setConfirmStep}
      closeModal={closeModal}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      selectedTime={selectedTime}
      setSelectedTime={setSelectedTime}
      reason={reason}
      setReason={setReason}
      options={options}
      addOption={addOption}
      removeOption={removeOption}
      getTimeSlots={getTimeSlots}
      handleCreateAndNotify={handleCreateAndNotify}
      loading={loading}
    />
  );
}

function RescheduleModal(props) {
  const {
    darkMode,
    eventInfo,
    confirmStep,
    setConfirmStep,
    closeModal,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    reason,
    setReason,
    options,
    addOption,
    removeOption,
    getTimeSlots,
    handleCreateAndNotify,
    loading,
  } = props;

  return (
    <div className={`${styles.reschedulePage} ${darkMode ? styles.reschedulePageDark : ''}`}>
      <div className={styles.eventSummary}>
        <div>
          <strong>{eventInfo.name || 'Event'}</strong>
        </div>
        <div className={styles.muted}>{eventInfo.location}</div>
      </div>

      <div
        className={`${styles.modalBackdrop} ${darkMode ? styles.modalBackdropDark : ''}`}
        role="presentation"
        onClick={e => {
          if (e.target === e.currentTarget) closeModal();
        }}
        onKeyDown={e => {
          if (e.key === 'Escape') closeModal();
        }}
      >
        <dialog
          className={`${styles.modalContent} ${darkMode ? styles.modalContentDark : ''}`}
          aria-modal="true"
          aria-labelledby="reschedule-title"
          open
          onCancel={e => {
            e.preventDefault();
            closeModal();
          }}
        >
          <button
            type="button"
            aria-label="Close reschedule dialog"
            className={styles.modalCloseBtn}
            onClick={closeModal}
          >
            &times;
          </button>

          {confirmStep ? (
            <>
              <div className={styles.modalHeader}>
                <h3 id="reschedule-title" className={styles.modalTitle}>
                  Confirm reschedule poll
                </h3>
              </div>

              <div className={styles.modalBody}>
                <div className={`${styles.formPanel} ${styles.confirmDetails}`}>
                  <p>
                    <strong>Event:</strong> {eventInfo.name || eventInfo.title || 'Event'}
                  </p>

                  <p>
                    <strong>Reason:</strong> {reason || 'No reason provided'}
                  </p>

                  <p>
                    <strong>Proposed options:</strong>
                  </p>

                  <div className={styles.optionsList}>
                    {options.map(option => (
                      <div
                        key={`${option.dateISO}-${option.timeSlot}`}
                        className={`${styles.optionButton} ${
                          darkMode ? styles.optionButtonDark : ''
                        }`}
                      >
                        {option.dateLabel} &bull; {option.timeSlot}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleCreateAndNotify}
                  disabled={loading}
                >
                  {loading ? 'Sending\u2026' : 'Create & Notify'}
                </button>

                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setConfirmStep(false)}
                  disabled={loading}
                >
                  Back
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.modalHeader}>
                <h3 id="reschedule-title" className={styles.modalTitle}>
                  Reschedule this event
                </h3>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formPanel}>
                  <label className={styles.fieldLabel} htmlFor="timeSelect">
                    Time (for selected date)
                  </label>

                  <select
                    id="timeSelect"
                    value={selectedTime}
                    onChange={e => setSelectedTime(e.target.value)}
                    className={`${styles.timeDropdown} ${darkMode ? styles.timeDropdownDark : ''}`}
                  >
                    <option value="">Select time</option>
                    {getTimeSlots(8, 24, 2).map(slot => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>

                  <button type="button" className={styles.primaryBtn} onClick={addOption}>
                    Add option
                  </button>

                  <label className={styles.fieldLabel} htmlFor="rescheduleReason">
                    Reason
                  </label>
                  <textarea
                    id="rescheduleReason"
                    className={`${styles.textArea} ${darkMode ? styles.textAreaDark : ''}`}
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Share why this event needs to be rescheduled."
                  />
                </div>

                <div className={styles.datePanel}>
                  <DatePicker
                    selected={selectedDate}
                    onChange={date => setSelectedDate(date)}
                    inline
                    minDate={new Date()}
                    calendarClassName={darkMode ? styles.datepickerDark : styles.datepicker}
                  />
                </div>

                <div className={styles.optionsList} aria-live="polite">
                  {options.map((opt, idx) => (
                    <button
                      type="button"
                      className={`${styles.optionButton} ${
                        darkMode ? styles.optionButtonDark : ''
                      }`}
                      key={`${opt.dateISO}-${opt.timeSlot}`}
                      onClick={() => removeOption(idx)}
                    >
                      {opt.dateLabel} &bull; {opt.timeSlot}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => setConfirmStep(true)}
                  disabled={options.length === 0}
                >
                  Continue
                </button>
                <button type="button" className={styles.secondaryBtn} onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </dialog>
      </div>
    </div>
  );
}

RescheduleEvent.propTypes = {
  activity: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    location: PropTypes.string,
    link: PropTypes.string,
  }),
};

RescheduleModal.propTypes = {
  darkMode: PropTypes.bool,
  eventInfo: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    location: PropTypes.string,
    link: PropTypes.string,
  }),
  confirmStep: PropTypes.bool,
  setConfirmStep: PropTypes.func,
  closeModal: PropTypes.func,
  selectedDate: PropTypes.instanceOf(Date),
  setSelectedDate: PropTypes.func,
  selectedTime: PropTypes.string,
  setSelectedTime: PropTypes.func,
  reason: PropTypes.string,
  setReason: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      dateISO: PropTypes.string,
      dateLabel: PropTypes.string,
      timeSlot: PropTypes.string,
    }),
  ),
  addOption: PropTypes.func,
  removeOption: PropTypes.func,
  getTimeSlots: PropTypes.func,
  handleCreateAndNotify: PropTypes.func,
  loading: PropTypes.bool,
};

export default RescheduleEvent;
