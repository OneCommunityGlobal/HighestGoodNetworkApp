import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './RescheduleEvent.module.css';
import { useSelector } from 'react-redux';

function RescheduleEvent() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [confirmStep, setConfirmStep] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleReschedule = () => {
    setShowModal(true);
    setButtonClicked(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setConfirmStep(false);
    setSelectedDate(null);
    setSelectedTime('');
    setButtonClicked(false);
  };

  const handleConfirm = () => {
    // eslint-disable-next-line no-alert
    alert(`Event rescheduled to: ${selectedDate?.toDateString()} at ${selectedTime}`);
    closeModal();
  };

  const formatTime = hour => {
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour < 12 ? 'AM' : 'PM';
    return `${formattedHour < 10 ? `0${formattedHour}` : formattedHour}:00 ${period}`;
    };

  return (
    <div
      className={`${styles.reschedulePage} ${darkMode ? 'bg-oxford-blue text-light' : ''}`}
    >
      {!buttonClicked && (
        <button
          type="button"
          onClick={handleReschedule}
          className={`${styles.rescheduleButton} ${darkMode ? styles.btnDarkMode : ''}`}
        >
          Reschedule Event
        </button>
      )}

      {showModal && (
        <div
          className={`${styles.modalBackdrop} ${darkMode ? styles.modalBackdropDark : ''}`}
        >
          <div
            className={`${styles.modalContent} ${darkMode ? styles.modalContentDark : ''}`}
          >
            {/* Close button */}
            <button type="button" className={styles.modalCloseBtn} onClick={closeModal}>
              &times;
            </button>

            {!confirmStep ? (
              <>
                <div
                  className={`${styles.eventContainer} ${darkMode ? styles.eventContainerDark : ''}`}
                >
                  <h3 className={styles.modalTitle}>Event Name</h3>
                  <div className={styles.eventDetails}>
                    <p>Location: San Francisco, CA 94108</p>
                    <p>Link: Event Link</p>
                    <p>
                      Time:
                      <select
                        value={selectedTime}
                        onChange={e => setSelectedTime(e.target.value)}
                        className={`${styles.timeDropdown} ${darkMode ? styles.timeDropdownDark : ''}`}
                      >
                        <option value="">Select time</option>
                        {[...Array(12)].map((_, i) => {
                          const hour = 8 + i * 2;
                          const timeSlot = `${formatTime(hour)} - ${formatTime(hour + 2)}`;
                          return (
                            <option key={timeSlot} value={timeSlot}>
                              {timeSlot}
                            </option>
                          );
                        })}
                      </select>
                    </p>
                  </div>
                </div>

                <div className={styles.datepickerContainer}>
                  <p className={styles.rescheduleText}>Choose an available date to reschedule</p>
                  <DatePicker
                    selected={selectedDate}
                    onChange={date => {
                      setSelectedDate(date);
                      setConfirmStep(false);
                    }}
                    inline
                    minDate={new Date()}
                    /* Keep DatePicker classes global so :global() rules apply */
                    className={darkMode ? 'react-datepicker dark' : 'react-datepicker'}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmStep(true)}
                  className={`${styles.rescheduleButton} ${
                    darkMode ? styles.btnDarkMode : ''
                  }`}
                  disabled={!selectedDate || !selectedTime}
                >
                  Reschedule Event
                </button>
              </>
            ) : (
              <>
                <h2 className={darkMode ? 'text-light' : ''}>
                  Are you sure you want to reschedule?
                </h2>
                <div className={styles.eventDetails}>
                  <p>Date: {selectedDate?.toDateString()}</p>
                  <p>Time: {selectedTime}</p>
                </div>

                <div className={styles.confirmationButtons}>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className={darkMode ? styles.btnDarkMode : styles.btnPrimary}
                    disabled={!selectedDate || !selectedTime}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className={styles.btnCancelDark}
                  >
                    Cancel
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
