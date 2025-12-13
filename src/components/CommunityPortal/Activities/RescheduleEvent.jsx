import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './RescheduleEvent.module.css';
import { useSelector } from 'react-redux';
import { ApiEndpoint } from '~/utils/URL';

function RescheduleEvent({ activity }) {
  const eventInfo =
    activity || {
      _id: '1',
      name: 'Event Name',
      location: 'San Francisco, CA 94108',
      link: 'Event Link',
    };

  const darkMode = useSelector(state => state.theme?.darkMode);

  const [showModal, setShowModal] = useState(true); // open modal on load
  const [confirmStep, setConfirmStep] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');

  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Automatically scroll to modal top when it opens
    if (showModal) window.scrollTo(0, 0);
  }, [showModal]);

  const closeModal = () => {
    setShowModal(false);
    setConfirmStep(false);
    setSelectedDate(null);
    setSelectedTime('');
    setReason('');
    setOptions([]);
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

  const toISODate = d => d.toISOString().slice(0, 10);

  const addOption = () => {
    if (!selectedDate || !selectedTime) return;

    const dateISO = toISODate(selectedDate);
    const dateLabel = selectedDate.toDateString();
    const timeSlot = selectedTime;

    const exists = options.some(
      opt => opt.dateISO === dateISO && opt.timeSlot === timeSlot
    );
    if (exists) {
      alert('That date & time is already in the poll list.');
      return;
    }
    if (options.length >= 5) {
      alert('You can add up to 5 options.');
      return;
    }

    setOptions(prev =>
      [...prev, { dateISO, dateLabel, timeSlot }].sort(
        (a, b) => new Date(a.dateISO) - new Date(b.dateISO)
      )
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

  const sendRescheduleRequest = async (eventId, payload) => {
    const token = localStorage.getItem('token');
    const res = await fetch(
      `${ApiEndpoint}/communityportal/activities/${eventId}/reschedule/notify`,
      {
        method: 'POST',
        headers: { Authorization: token, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

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

      const json = await sendRescheduleRequest(eventInfo._id, {
        options: beOptions,
        reason: reason || '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      alert(`Notification sent to ${json.notified} participants.`);
      closeModal();
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

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
    <div
      className={`${styles.reschedulePage} ${
        darkMode ? 'bg-oxford-blue text-light' : ''
      }`}
    >
      <div style={{ position: 'absolute', top: 16, left: 16, opacity: 0.9 }}>
        <div>
          <strong>{eventInfo.name || 'Event'}</strong>
        </div>
        <div className="muted">{eventInfo.location}</div>
      </div>

      {/* Modal opens automatically — no button shown */}
      <div
        className={`${styles.modalBackdrop} ${
          darkMode ? styles.modalBackdropDark : ''
        }`}
        role="button"
        tabIndex={0}
        onClick={e => e.target === e.currentTarget && closeModal()}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.target === e.currentTarget && closeModal();
          }
        }}
      >
        <div
          className={`${styles.modalContent} ${
            darkMode ? styles.modalContentDark : ''
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reschedule-title"
        >
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={closeModal}
          >
            &times;
          </button>

          {!confirmStep ? (
            <>
              <div className={styles.modalHeader}>
                <h3 id="reschedule-title" className={styles.modalTitle}>
                  Reschedule this event
                </h3>
              </div>

              <div className={styles.modalBody}>
                <label className={styles.fieldLabel} htmlFor="timeSelect">
                  Time (for selected date)
                </label>
                <select
                  id="timeSelect"
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                  className={`${styles.timeDropdown} ${
                    darkMode ? styles.timeDropdownDark : ''
                  }`}
                >
                  <option value="">Select time</option>
                  {getTimeSlots(8, 24, 2).map(slot => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={addOption}
                >
                  Add option
                </button>

                <textarea
                  className={`${styles.textArea} ${
                    darkMode ? styles.textAreaDark : ''
                  }`}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />

                <DatePicker
                  selected={selectedDate}
                  onChange={date => setSelectedDate(date)}
                  inline
                  minDate={new Date()}
                  className={
                    darkMode ? 'react-datepicker dark' : 'react-datepicker'
                  }
                />

                {options.map((opt, idx) => (
                  <button key={idx} onClick={() => removeOption(idx)}>
                    {opt.dateLabel} • {opt.timeSlot}
                  </button>
                ))}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setConfirmStep(true)}>
                  Continue
                </button>
                <button type="button" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={handleCreateAndNotify}
                  disabled={loading}
                >
                  {loading ? 'Sending…' : 'Create & Notify'}
                </button>
                <button type="button" onClick={() => setConfirmStep(false)}>
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RescheduleEvent;
