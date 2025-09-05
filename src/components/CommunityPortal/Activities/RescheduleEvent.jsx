import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './RescheduleEvent.module.css';
import { useSelector } from 'react-redux';
import { ApiEndpoint } from '~/utils/URL';

function RescheduleEvent({ activity }) {
  const eventInfo =
    activity || {
      id: 'activity_1',
      name: 'Event Name',
      location: 'San Francisco, CA 94108',
      link: 'Event Link',
    };

  const darkMode = useSelector((state) => state.theme?.darkMode);

  // UI
  const [showModal, setShowModal] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);
  const [loading, setLoading] = useState(false);

  // In-progress pickers
  const [selectedDate, setSelectedDate] = useState(null); // single date
  const [selectedTime, setSelectedTime] = useState('');   // dropdown time for that date
  const [reason, setReason] = useState('');               // optional

  // Final poll options (max 5): { dateISO, dateLabel, timeSlot }
  const [options, setOptions] = useState([]);

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setConfirmStep(false);
    setSelectedDate(null);
    setSelectedTime('');
    setReason('');
    setOptions([]);
  };

  const formatTime = (hour24) => {
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

  const toISODate = (d) => d.toISOString().slice(0, 10);

  const addOption = () => {
    if (!selectedDate || !selectedTime) return;

    const dateISO = toISODate(selectedDate);
    const dateLabel = selectedDate.toDateString();
    const timeSlot = selectedTime;

    const exists = options.some(
      (opt) => opt.dateISO === dateISO && opt.timeSlot === timeSlot
    );
    if (exists) {
      alert('That date & time is already in the poll list.');
      return;
    }
    if (options.length >= 5) {
      alert('You can add up to 5 options.');
      return;
    }

    setOptions((prev) =>
      [...prev, { dateISO, dateLabel, timeSlot }].sort(
        (a, b) => new Date(a.dateISO) - new Date(b.dateISO)
      )
    );
    setSelectedTime('');
  };

  const removeOption = (idx) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const parse12to24 = (label) => {
    // "09:00 AM" → "09:00"
    const [time, ap] = label.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (ap === 'PM' && h !== 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

const handleCreateAndNotify = async () => {
  try {
    setLoading(true);

    const beOptions = options.map((opt) => {
      const [startLabel, endLabel] = opt.timeSlot.split(' - ');
      return {
        dateISO: opt.dateISO,
        start: parse12to24(startLabel),
        end: parse12to24(endLabel),
      };
    });

    const res = await fetch(`${ApiEndpoint}/activities/${eventInfo.id}/reschedule/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        options: beOptions,
        reason: reason || '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }

    const json = await res.json();
    alert(`Notification sent to ${json.notified} participants.`);
    closeModal();
  } catch (e) {
    alert(`Error: ${e.message}`);
  } finally {
    setLoading(false);
  }
};


  const canContinue = options.length >= 1;

  return (
    <div className={`${styles.reschedulePage} ${darkMode ? 'bg-oxford-blue text-light' : ''}`}>
      <div style={{ position: 'absolute', top: 16, left: 16, opacity: 0.9 }}>
        <div><strong>{eventInfo.name}</strong></div>
        <div className="muted">{eventInfo.location}</div>
      </div>

      <button
        type="button"
        onClick={openModal}
        className={`${styles.rescheduleButton} ${darkMode ? styles.btnDarkMode : ''}`}
        aria-label="Initiate rescheduling"
      >
        Reschedule
      </button>

      {showModal && (
        <div
          className={`${styles.modalBackdrop} ${darkMode ? styles.modalBackdropDark : ''}`}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            className={`${styles.modalContent} ${darkMode ? styles.modalContentDark : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reschedule-title"
          >
            <button type="button" className={styles.modalCloseBtn} onClick={closeModal}>
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
                  <div className={`${styles.eventContainer} ${darkMode ? styles.eventContainerDark : ''}`}>
                    <div className={styles.eventDetails}>
                      <p><strong>{eventInfo.name}</strong></p>
                      <p>{eventInfo.location}</p>
                      <p>{eventInfo.link}</p>

                      {/* Time dropdown for the currently selected date */}
                      <label className={styles.fieldLabel} htmlFor="timeSelect">
                        Time (for selected date)
                      </label>
                      <select
                        id="timeSelect"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className={`${styles.timeDropdown} ${darkMode ? styles.timeDropdownDark : ''}`}
                      >
                        <option value="">Select time</option>
                        {getTimeSlots(8, 24, 2).map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>

                      {/* Add button */}
                      <div style={{ marginTop: 8 }}>
                        <button
                          type="button"
                          className={styles.primaryBtn}
                          onClick={addOption}
                          disabled={!selectedDate || !selectedTime || options.length >= 5}
                        >
                          Add option
                        </button>
                        <span style={{ marginLeft: 8, opacity: 0.75 }}>
                          {options.length}/5 added
                        </span>
                      </div>

                      {/* Optional reason */}
                      <label className={styles.fieldLabel} htmlFor="reasonInput" style={{ marginTop: 12 }}>
                        Reason (optional)
                      </label>
                      <textarea
                        id="reasonInput"
                        className={`${styles.textArea} ${darkMode ? styles.textAreaDark : ''}`}
                        rows={4}
                        maxLength={500}
                        placeholder="Tell participants why you’re rescheduling (optional)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                      <div className={styles.charCount}>{reason.length}/500</div>

                      {/* Options list */}
                      {options.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <p className={styles.fieldLabel}>Options in poll</p>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {options.map((opt, idx) => (
                              <li
                                key={`${opt.dateISO}-${opt.timeSlot}`}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  border: '1px solid #d0d7de',
                                  borderRadius: 8,
                                  padding: '8px 10px',
                                  marginBottom: 8,
                                }}
                              >
                                <span>{opt.dateLabel} • {opt.timeSlot}</span>
                                <button
                                  type="button"
                                  className={styles.secondaryBtn}
                                  onClick={() => removeOption(idx)}
                                  aria-label="Remove option"
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className={styles.datepickerContainer}>
                    <p className={styles.rescheduleText}>Pick a date, then choose a time and click Add option</p>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      inline
                      minDate={new Date()}
                      className={darkMode ? 'react-datepicker dark' : 'react-datepicker'}
                    />
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={`${styles.primaryBtn} ${darkMode ? styles.btnDarkMode : ''}`}
                    onClick={() => setConfirmStep(true)}
                    disabled={!canContinue}
                  >
                    Continue
                  </button>
                  <button type="button" onClick={closeModal} className={styles.secondaryBtn}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Preview notification & poll</h2>
                </div>

                <div className={styles.modalBodySingle}>
                  <div className={styles.eventDetails}>
                    <p><strong>Options:</strong></p>
                    <ul style={{ marginTop: 6 }}>
                      {options.map((opt) => (
                        <li key={`${opt.dateISO}-${opt.timeSlot}`}>
                          {opt.dateLabel} • {opt.timeSlot}
                        </li>
                      ))}
                    </ul>
                    <p style={{ marginTop: 8 }}><strong>Reason:</strong> {reason || '(none)'}</p>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={`${styles.primaryBtn} ${darkMode ? styles.btnDarkMode : ''}`}
                    onClick={handleCreateAndNotify}
                    disabled={options.length === 0 || loading}
                  >
                    {loading ? 'Sending…' : 'Create & Notify'}
                  </button>
                  <button type="button" onClick={() => setConfirmStep(false)} className={styles.secondaryBtn}>
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RescheduleEvent;
