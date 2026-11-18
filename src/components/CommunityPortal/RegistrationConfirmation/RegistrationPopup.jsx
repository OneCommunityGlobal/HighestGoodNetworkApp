import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './RegistrationPopup.module.css';

function RegistrationPopup({ onClose, activity, userName, userEmail }) {
  const darkMode = useSelector(state => state.theme?.darkMode);
  const history = useHistory();

  const eventName = activity?.name || activity?.title || 'Event Name';
  const attendeeName = userName || "User's Full Name";
  const eventDate = activity?.date || 'Tuesday, January 7th, 2025';
  const eventTime = activity?.time || '7:00 PM CST';
  const eventLocation = activity?.location || activity?.venue || 'Location';
  const eventId = activity?.id;

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDetailsClick = () => {
    if (eventId) {
      history.push(`/communityportal/activities/${eventId}`);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleAddToCalendar = () => {
    try {
      const now =
        new Date()
          .toISOString()
          .replace(/[-:]/g, '')
          .split('.')[0] + 'Z';
      const summary = eventName;
      const description = activity?.description || `Registration confirmation for ${eventName}`;
      const location = eventLocation;
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Highest Good Network//Event Confirmation//EN',
        'BEGIN:VEVENT',
        `UID:${Date.now()}@highestgoodnetwork.com`,
        `DTSTAMP:${now}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${summary.replace(/[^a-zA-Z0-9_-]/g, '_')}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Calendar event downloaded!');
    } catch {
      toast.error('Failed to export calendar event.');
    }
  };

  const handleViewInEmail = () => {
    const targetEmail = userEmail || 'your email';
    toast.info(`Registration details have been sent to ${targetEmail}`);
  };

  const handleDownloadTicket = () => {
    try {
      const ticketContent = [
        '========================================',
        '     EVENT REGISTRATION CONFIRMATION     ',
        '========================================',
        `Event:     ${eventName}`,
        `Attendee:  ${attendeeName}`,
        `Email:     ${userEmail || 'N/A'}`,
        `Date:      ${eventDate}`,
        `Time:      ${eventTime}`,
        `Location:  ${eventLocation}`,
        `Status:    CONFIRMED`,
        `Ticket ID: TKT-${Date.now()}`,
        '========================================',
        'Thank you for registering. See you there!',
      ].join('\n');

      const blob = new Blob([ticketContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${eventName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Ticket.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Ticket downloaded successfully!');
    } catch {
      toast.error('Failed to download ticket.');
    }
  };

  const handleOverlayClick = event => {
    if (event.target === event.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div className={darkMode ? styles.darkMode : ''} data-testid="popup-wrapper">
      <div
        className={styles.popupOverlay}
        onClick={handleOverlayClick}
        role="presentation"
        data-testid="popup-overlay"
      >
        <div
          className={styles.popup}
          role="dialog"
          aria-modal="true"
          aria-labelledby="registration-modal-title"
        >
          <div className={styles.popupHeader}>
            <span>✅ Registration Successful!</span>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close registration popup"
            >
              ✖
            </button>
          </div>
          <h2 id="registration-modal-title">Thank you for Registering!</h2>
          <p>
            You have successfully registered for the event. We have reserved your space. See you
            there!
          </p>
          <div className={styles.popupContent}>
            <strong>{eventName}</strong>
            <div>
              <button type="button" className={styles.eventDetailsBtn} onClick={handleDetailsClick}>
                (Click for more details)
              </button>
            </div>
            <p className={styles.userFullName}>{attendeeName}</p>

            <div className={styles.eventInfo}>
              <span>📅 {eventDate}</span>
              <span>⏰ {eventTime}</span>
              <span>📍 {eventLocation}</span>
            </div>

            <button type="button" className={styles.calendarBtn} onClick={handleAddToCalendar}>
              Add to my calendar
            </button>

            <div className={styles.popupFooter}>
              <button type="button" className={styles.emailBtn} onClick={handleViewInEmail}>
                View details in Email
              </button>
              <button type="button" className={styles.downloadBtn} onClick={handleDownloadTicket}>
                Download Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrationPopup;
