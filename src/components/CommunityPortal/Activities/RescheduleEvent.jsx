import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './RescheduleEvent.css';
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
    <div className={`reschedule-page ${darkMode ? 'bg-oxford-blue text-light' : ''}`}>
      {!buttonClicked && (
        <button
          type="button"
          onClick={handleReschedule}
          className={`reschedule-button ${darkMode ? 'btn-dark-mode' : ''}`}
        >
          Reschedule Event
        </button>
      )}

      {showModal && (
        <div className={`modal-backdrop ${darkMode ? 'dark' : ''}`}>
          <div className={`modal-content ${darkMode ? 'dark' : ''}`}>
            {/* Close button */}
            <button type="button" className="modal-close-btn" onClick={closeModal}>
              &times;
            </button>

            {!confirmStep ? (
              <>
                <div className={`event-container ${darkMode ? 'dark' : ''}`}>
                  <h3 className="modal-title">Event Name</h3>
                  <div className="event-details">
                    <p>Location: San Francisco, CA 94108</p>
                    <p>Link: Event Link</p>
                    <p>
                      Time:
                      <select
                        value={selectedTime}
                        onChange={e => setSelectedTime(e.target.value)}
                        className={`time-dropdown ${darkMode ? 'time-dropdown-dark' : ''}`}
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

                <div className="datepicker-container">
                  <div className="datepicker-wrapper">
                    <p className="reschedule-text">Choose an available date to reschedule</p>
                    <DatePicker
                      selected={selectedDate}
                      onChange={date => {
                        setSelectedDate(date);
                        setConfirmStep(false);
                      }}
                      inline
                      minDate={new Date()}
                      className={darkMode ? 'react-datepicker dark' : 'react-datepicker'}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmStep(true)}
                  className={`reschedule-button ${darkMode ? 'btn-dark-mode' : ''}`}
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
                <div className="event-details">
                  <p>Date: {selectedDate?.toDateString()}</p>
                  <p>Time: {selectedTime}</p>
                </div>

                <div className="confirmation-buttons">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className={`btn ${darkMode ? 'btn-dark-mode' : 'btn-primary'}`}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`btn ${darkMode ? 'btn-cancel-dark' : ''}`}
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
