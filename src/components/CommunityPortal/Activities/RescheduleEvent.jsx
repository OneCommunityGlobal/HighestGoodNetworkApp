import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './RescheduleEvent.css';

function RescheduleEvent() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [confirmStep, setConfirmStep] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);

  const handleReschedule = () => {
    setShowModal(true); // Show modal when clicked
    setButtonClicked(true); // Hide the "Reschedule Event" button after clicking it
  };

  const handleConfirm = () => {
    // eslint-disable-next-line no-alert
    alert(`Event rescheduled to: ${selectedDate?.toDateString()}`);
    setShowModal(false);
    setConfirmStep(false);
    setSelectedDate(null);
  };

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Updated showModal state:', showModal);
  }, [showModal]);

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
                      <p>Time: September 2024</p>
                      <p>Location: San Francisco, CA 94108</p>
                      <p>Link: Event Link</p>
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
                        setConfirmStep(true);
                      }}
                      inline
                    />
                    {selectedDate && (
                      <button
                        type="button"
                        onClick={() => setConfirmStep(true)}
                        className="confirm-date-button"
                      >
                        Confirm Date
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2>Are you sure you want to reschedule?</h2>
                <div className="event-details">
                  <p>Time: {selectedDate?.toDateString()}</p>
                  <p>Location: San Francisco, CA 94108</p>
                  <p>Link: Event Link</p>
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
