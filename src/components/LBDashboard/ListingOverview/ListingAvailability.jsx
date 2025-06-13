import React, { useEffect, useState } from 'react';
import './Listoverview.css';

const AVAILABILITY_COLORS = {
  available: '#4caf50', // green
  booked: '#f44336',    // red
  blocked: '#9e9e9e',   // gray
};

function getDateStatus(date, availability) {
  const d = date.toISOString().split('T')[0];
  if (availability.bookedDates?.includes(d)) return 'booked';
  if (availability.blockedDates?.includes(d)) return 'blocked';
  if (availability.availableDates?.includes(d)) return 'available';
  return null;
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  return days;
}

export default function ListingAvailability({ listingId, userId, onClose }) {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [error, setError] = useState('');
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL || ''}/api/lb/availability`,
          { headers: { listingid: listingId } }
        );
        if (!res.ok) throw new Error('No availability data found');
        const data = await res.json();
        setAvailability(data.data);
      } catch (err) {
        setError('Availability details are currently unavailable. Please check back later or contact the host.');
      } finally {
        setLoading(false);
      }
    }
    fetchAvailability();
  }, [listingId]);

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
    <div className="availability-modal">
      <button className="close-btn" onClick={onClose}>×</button>
      <h2>Availability Calendar</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="calendar-nav">
            <button onClick={handlePrevMonth}>&lt;</button>
            <span>
              {new Date(month.year, month.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth}>&gt;</button>
          </div>
          <table className="simple-calendar">
            <thead>
              <tr>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <th key={d}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {weeks.map((w, i) => (
                <tr key={i}>
                  {w.map((date, j) => {
                    if (!date) return <td key={j} />;
                    const status = getDateStatus(date, availability);
                    return (
                      <td
                        key={j}
                        className={status ? `calendar-${status}` : ''}
                        style={{
                          background: status ? AVAILABILITY_COLORS[status] : undefined,
                          color: status ? '#fff' : undefined,
                          borderRadius: status ? '50%' : undefined,
                          cursor: status ? 'pointer' : undefined,
                          position: 'relative'
                        }}
                        title={status ? status.charAt(0).toUpperCase() + status.slice(1) : ''}
                      >
                        {date.getDate()}
                        {status && (
                          <span className="calendar-tooltip">
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="calendar-legend" style={{ marginTop: 16 }}>
            <span style={{ background: AVAILABILITY_COLORS.available }} className="legend-dot" /> Available
            <span style={{ background: AVAILABILITY_COLORS.booked }} className="legend-dot" /> Booked
            <span style={{ background: AVAILABILITY_COLORS.blocked }} className="legend-dot" /> Blocked
          </div>
        </>
      )}
      <div className="contact-host-section">
        <button onClick={() => setContactOpen(true)} className="contact-host-btn">Contact Host</button>
        {contactOpen && (
          <form className="contact-form" onSubmit={handleContactSubmit}>
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
            <button type="submit">Send</button>
            <button type="button" onClick={() => setContactOpen(false)}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
}