import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchListingAvailability } from '../../../actions/lbdashboard/listOverviewAction';
import styles from './Listoverview.module.css';

const AVAILABILITY_COLORS = {
  available: '#4caf50', // green
  booked: '#f44336', // red
  blocked: '#9e9e9e', // gray
};

function getDateStatus(date, availability) {
  const d = date.toISOString().split('T')[0];

  if (
    availability.bookedDates?.some(
      b =>
        d >= new Date(b.from).toISOString().split('T')[0] &&
        d <= new Date(b.to).toISOString().split('T')[0],
    )
  ) {
    return 'booked';
  }

  if (
    availability.blockedOutDates?.some(
      b =>
        d >= new Date(b.from).toISOString().split('T')[0] &&
        d <= new Date(b.to).toISOString().split('T')[0],
    )
  ) {
    return 'blocked';
  }

  return 'available';
}

function getMonthDays(year, month) {
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let i = 1; i <= lastDay.getDate(); i += 1) {
    days.push(new Date(year, month, i));
  }
  return days;
}

export default function ListingAvailability({ listingId, availability, loading, error, onClose }) {
  const dispatch = useDispatch();

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    if (listingId) {
      dispatch(fetchListingAvailability(listingId));
    }
  }, [listingId, dispatch]);

  function handlePrevMonth() {
    setMonth(m => {
      if (m.month === 0) return { year: m.year - 1, month: 11 };
      return { year: m.year, month: m.month - 1 };
    });
  }
  function handleNextMonth() {
    setMonth(m => {
      if (m.month === 11) return { year: m.year + 1, month: 0 };
      return { year: m.year, month: m.month + 1 };
    });
  }

  function handleContactSubmit(e) {
    e.preventDefault();
    window.location.href = `mailto:host@example.com?subject=Inquiry about Listing&body=Name: ${contactForm.name}%0AEmail: ${contactForm.email}%0A${contactForm.message}`;
    setContactOpen(false);
  }

  const days = getMonthDays(month.year, month.month);
  const firstDayOfWeek = new Date(month.year, month.month, 1).getDay();
  const weeks = [];
  let week = Array(firstDayOfWeek).fill(null);
  days.forEach((date, idx) => {
    week.push(date);
    if (week.length === 7 || idx === days.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  return (
    <div className={`${styles.availabilityModal}`}>
      <button type="button" className={`${styles.closeBtn}`} onClick={onClose}>
        ×
      </button>
      <h2 className={`${styles.headingCalendar}`}>Availability Calendar</h2>
      {loading && <div>Loading...</div>}
      {!loading && error && <div className="error-message">{error}</div>}
      {!loading && !error && availability && (
        <>
          <div className={`${styles.calendarNav}`}>
            <button type="button" onClick={handlePrevMonth}>
              &lt;
            </button>
            <span>
              {new Date(month.year, month.month).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <button type="button" onClick={handleNextMonth}>
              &gt;
            </button>
          </div>
          <table className={`${styles.simpleCalendar}`}>
            <thead>
              <tr>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <th key={d}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map(w => (
                <tr key={w.map(date => date && date.toISOString()).join('-')}>
                  {w.map(date => {
                    if (!date) return <td key={`empty-${Math.random()}`} />;
                    const status = getDateStatus(date, availability);
                    return (
                      <td
                        key={date.toISOString()}
                        className={status ? `${styles[`calendar-${status}`]}` : ''}
                        style={{
                          background: status ? AVAILABILITY_COLORS[status] : undefined,
                          color: status ? '#fff' : undefined,
                          borderRadius: status ? '50%' : undefined,
                          cursor: status ? 'pointer' : undefined,
                          position: 'relative',
                        }}
                        title={status ? status.charAt(0).toUpperCase() + status.slice(1) : ''}
                      >
                        {date.getDate()}
                        {status && <span className={`${styles.calendarTooltip}`} />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className={`${styles.calendarLegend}`} style={{ marginTop: 16 }}>
            <span
              style={{ background: AVAILABILITY_COLORS.available }}
              className={`${styles.legendDot}`}
            />{' '}
            Available
            <span
              style={{ background: AVAILABILITY_COLORS.booked }}
              className={`${styles.legendDot}`}
            />{' '}
            Booked
            <span
              style={{ background: AVAILABILITY_COLORS.blocked }}
              className={`${styles.legendDot}`}
            />{' '}
            Blocked
          </div>
        </>
      )}
      <div className={`${styles.contactHostSection}`}>
        <button
          type="button"
          onClick={() => setContactOpen(true)}
          className={`${styles.contactHostBtn}`}
        >
          Contact Host
        </button>
        {contactOpen && (
          <form className={`${styles.contactForm}`} onSubmit={handleContactSubmit}>
            <input
              type="text"
              placeholder="Your Name"
              value={contactForm.name}
              onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={contactForm.email}
              onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
              required
            />
            <textarea
              placeholder="Message"
              value={contactForm.message}
              onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
              required
            />
            <button type="submit" className={`${styles.sendInfoBtn} ${styles.contactHostBtn}`}>
              Send
            </button>
            <button
              type="button"
              className={`${styles.cancelInfoBtn} ${styles.contactHostBtn}`}
              onClick={() => setContactOpen(false)}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
