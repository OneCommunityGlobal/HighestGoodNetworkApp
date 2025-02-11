import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './RescheduleEvent.css';

function RescheduleEvent() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [confirmStep, setConfirmStep] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);

  const handleReschedule = () => {
    setShowModal(true);
    setButtonClicked(true);
  };

  const handleConfirm = () => {
    // eslint-disable-next-line no-alert
    alert(`Event rescheduled to: ${selectedDate?.toDateString()} at ${selectedTime}`);
    setShowModal(false);
    setConfirmStep(false);
    setSelectedDate(null);
    setSelectedTime('');
  };
  const formatTime = hour => {
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour < 12 ? 'AM' : 'PM';
    return `${formattedHour < 10 ? `0${formattedHour}` : formattedHour}:00 ${period}`;
  };

  return (
    <div className="reschedule-page">
      {!buttonClicked && (
        <button type="button" onClick={handleReschedule} className="reschedule-button">
          Reschedule Event
        </button>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            {!confirmStep ? (
              <>
                <div className="event-container">
                  <div className="event-details-header">
                    <h3>Event Name</h3>
                    <div className="event-details">
                      <p>Location: San Francisco, CA 94108</p>
                      <p>Link: Event Link</p>
                      <p>
                        Time:
                        <select
                          value={selectedTime}
                          onChange={e => setSelectedTime(e.target.value)}
                          className="time-dropdown"
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
                </div>
                <div className="datepicker-container">
                  <div className="datepicker-wrapper">
                    <p className="reschedule-text">Choose an available Date to Reschedule</p>
                    <DatePicker
                      selected={selectedDate}
                      onChange={date => {
                        setSelectedDate(date);
                        setConfirmStep(false); // Reset confirm step if date is changed
                      }}
                      inline
                    />
                  </div>
                </div>
                {selectedDate && selectedTime && (
                  <button
                    type="button"
                    onClick={() => setConfirmStep(true)}
                    className="confirm-date-button"
                  >
                    Reschedule Event
                  </button>
                )}
              </>
            ) : (
              <>
                <h2>Are you sure you want to reschedule?</h2>
                <div className="event-details">
                  <p>Location: San Francisco, CA 94108</p>
                  <p>Date: {selectedDate?.toDateString()}</p>
                  <p>Time: {selectedTime}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleConfirm();
                    setButtonClicked(false); // Show the reschedule button again
                  }}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setConfirmStep(false);
                    setSelectedDate(null);
                    setSelectedTime('');
                    setButtonClicked(false); // Show the reschedule button again when modal closes
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RescheduleEvent;
