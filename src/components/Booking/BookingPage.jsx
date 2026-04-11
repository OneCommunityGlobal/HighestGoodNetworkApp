import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Row, Col, Button, Input, Label, Alert, Spinner } from 'reactstrap';
import { FaComment, FaBell, FaUser } from 'react-icons/fa';
import logo from '../../assets/images/logo2.png';
import styles from './booking.module.css';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const STORAGE_KEY = 'bookingDraft_v1';

// Helper to safely save booking draft to localStorage
function saveDraft(payload) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    // fail silently
  }
}
const NIGHTLY_RATE = 140;
const UNAVAILABLE = ['2025-09-16', '2025-09-21', '2025-10-02', '2025-10-05', '2025-10-18'];

function isPastOrToday(dateStr) {
  const input = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return input <= today;
}

export default function BookingPage() {
  const darkMode = useSelector(s => s.theme?.darkMode);
  const history = useHistory();
  const location = useLocation();

  const [village, setVillage] = useState('Choose your Village');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [card, setCard] = useState('');
  const [cvv, setCvv] = useState('');
  const [exp, setExp] = useState('');
  const [loading, setLoading] = useState(false);
  const firstName = useSelector(state => state.auth?.firstName);

  const userName = firstName || 'Guest';

  // Restore logic: only run once on mount
  useEffect(() => {
    try {
      // First, try to restore from navigation state
      if (location.state && location.state.booking) {
        const b = location.state.booking;
        setVillage(b.village || 'Choose your Village');
        setStart(b.start || '');
        setEnd(b.end || '');
        setName(b.name || '');
        setEmail(b.email || '');
        setPhone(b.phone || '');
        setCard(b.card || '');
        setCvv(b.cvv || '');
        setExp(b.exp || '');
      } else {
        // Fallback to localStorage draft
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        if (saved) {
          setVillage(saved.village || 'Choose your Village');
          setStart(saved.start || '');
          setEnd(saved.end || '');
          setName(saved.name || '');
          setEmail(saved.email || '');
          setPhone(saved.phone || '');
          setCard(saved.card || '');
          setCvv(saved.cvv || '');
          setExp(saved.exp || '');
        }
      }
    } catch {}
  }, [location.state]);

  // Always persist booking fields to localStorage when any change
  useEffect(() => {
    const payload = { village, start, end, name, email, phone, card, cvv, exp };
    saveDraft(payload);
  }, [village, start, end, name, email, phone, card, cvv, exp]);

  const price = useMemo(() => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    const nights = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    if (isNaN(nights) || nights <= 0) return { error: 'End date must be after start date.' };
    const subtotal = nights * NIGHTLY_RATE;
    const taxes = Math.round(subtotal * 0.12 * 100) / 100;
    const fees = 15;
    const total = Math.round((subtotal + taxes + fees) * 100) / 100;
    return { nights, subtotal, taxes, fees, total };
  }, [start, end]);

  const dateDisabled = d => {
    return UNAVAILABLE.includes(d) || isPastOrToday(d);
  };

  const proceed = async () => {
    if (village === 'Choose your Village') return toast.error('Please select a village.');
    if (!start || !end) return toast.error('Please choose dates.');
    if (dateDisabled(start) || dateDisabled(end))
      return toast.error('Selected date is unavailable.');
    if (!name.trim() || !email.trim() || !phone.trim())
      return toast.error('Fill Name, Email and Phone.');
    if (!card.trim() || !cvv.trim() || !exp.trim())
      return toast.error('Please fill in all payment details.');
    if (!price || price.error) return toast.error(price?.error || 'Invalid date range.');

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Booking captured.');
      // Write final payload to localStorage and pass via navigation state
      const payload = {
        village,
        start,
        end,
        name,
        email,
        phone,
        card,
        cvv,
        exp,
        price,
      };
      saveDraft(payload);
      history.push('/booking/confirm', {
        booking: { village, start, end, name, email, phone, card, cvv, exp, price },
      });
    }, 700);
  };

  const handleDateFocus = e => {
    setTimeout(() => {
      e.target.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 50);
  };

  return (
    <div className={`${styles.bookingBg} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.topLogo}>
        <img src={logo} alt="One Community" />
      </div>

      <div className={styles.greenBar}>
        <div className={styles.barInner}>
          <div className={styles.villageSelect}>
            <select value={village} onChange={e => setVillage(e.target.value)}>
              <option>Choose your Village</option>
              <option>Earthbag Village</option>
              <option>Straw Bale Village</option>
              <option>Recycle Materials Village</option>
              <option>Cob Village</option>
              <option>Tree House Village</option>
            </select>
            <Button className={styles.goBtn}>Go</Button>
          </div>

          <div className={styles.barRight}>
            <span className={styles.welcome}>WELCOME, {userName}</span>
            <div className={styles.icons}>
              <span className={styles.icon}>
                <FaComment />
                <span className={styles.badge}>1</span>
              </span>
              <span className={styles.icon}>
                <FaBell />
                <span className={styles.badge}>1</span>
              </span>
              <span className={styles.icon}>
                <FaUser />
              </span>
            </div>
          </div>
        </div>
      </div>

      <Container className={styles.bookingShell}>
        <Row>
          <Col>
            <div className={styles.bookingContent}>
              <Row>
                <Col md={12} className="text-center mb-3">
                  <div>
                    <img
                      className={styles.listingPhoto}
                      src="https://images.unsplash.com/photo-1570793005386-840846445fed?w=900&auto=format&fit=crop"
                      alt="Unit 405"
                    />
                    <div className={styles.photoCaption}>
                      Unit 405, Earthbag Village –{' '}
                      <button href="#" onClick={e => e.preventDefault()}>
                        More photos
                      </button>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row className="pt-2">
                <Col md={7}>
                  <h5 className={styles.sectionTitle}>Booking Details</h5>
                  <div className={styles.datesSubtitle}>
                    Dates: {start && end ? `${start} - ${end}` : 'Select dates'}
                  </div>
                  <Row className="g-3 mt-2">
                    <Col md={6}>
                      <Label className={styles.fieldLabel}>Name</Label>
                      <Input value={name} onChange={e => setName(e.target.value)} />
                    </Col>
                    <Col md={6}>
                      <Label className={styles.fieldLabel}>Email</Label>
                      <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </Col>
                    <Col md={12}>
                      <Label className={styles.fieldLabel}>Card #</Label>
                      <Input value={card} onChange={e => setCard(e.target.value)} />
                    </Col>
                    <Col md={6}>
                      <Label className={styles.fieldLabel}>CVV</Label>
                      <Input value={cvv} onChange={e => setCvv(e.target.value)} />
                    </Col>
                    <Col md={6}>
                      <Label className={styles.fieldLabel}>Exp</Label>
                      <Input value={exp} onChange={e => setExp(e.target.value)} />
                    </Col>
                    <Col md={6}>
                      <Label className={styles.fieldLabel}>Check-in</Label>
                      <DatePicker
                        selected={start ? new Date(start) : null}
                        onChange={date => setStart(date ? date.toISOString().split('T')[0] : '')}
                        minDate={new Date()}
                        placeholderText="Select check-in date"
                        popperPlacement="bottom-start"
                        popperModifiers={[
                          { name: 'preventOverflow', options: { boundary: 'viewport' } },
                          { name: 'flip', options: { fallbackPlacements: ['top'] } },
                        ]}
                        className="form-control"
                      />
                    </Col>
                    <Col md={6}>
                      <Label className={styles.fieldLabel}>Check-out</Label>
                      <DatePicker
                        selected={end ? new Date(end) : null}
                        onChange={date => setEnd(date ? date.toISOString().split('T')[0] : '')}
                        minDate={start ? new Date(start) : new Date()}
                        placeholderText="Select check-out date"
                        popperPlacement="bottom-start"
                        popperModifiers={[
                          { name: 'preventOverflow', options: { boundary: 'viewport' } },
                          { name: 'flip', options: { fallbackPlacements: ['top'] } },
                        ]}
                        className="form-control"
                      />
                    </Col>
                  </Row>
                </Col>

                <Col md={5}>
                  <Label className={styles.fieldLabel}>Phone</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} />
                  <div className={`${styles.priceBox} mt-4`}>
                    {village !== 'Choose your Village' ? (
                      <>
                        {price?.error && <Alert color="danger">{price.error}</Alert>}
                        {!price && <Alert color="info">Select dates to see pricing</Alert>}
                        {price && !price.error && (
                          <>
                            <div className={styles.priceRow}>
                              <span>
                                {price.nights} × ${NIGHTLY_RATE}
                              </span>
                              <span>${price.subtotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.priceRow}>
                              <span>Taxes</span>
                              <span>${price.taxes.toFixed(2)}</span>
                            </div>
                            <div className={styles.priceRow}>
                              <span>Fees</span>
                              <span>${price.fees.toFixed(2)}</span>
                            </div>
                            <div className={`${styles.priceRow} ${styles.total}`}>
                              <span>Total</span>
                              <span>${price.total.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <Alert color="info">Please select a village to view pricing.</Alert>
                    )}
                  </div>
                  <div className="mt-4 text-end">
                    <Button
                      color="success"
                      className={styles.proceedBtn}
                      onClick={proceed}
                      disabled={loading}
                    >
                      {loading ? <Spinner size="sm" /> : 'Proceed to book'}
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
      {/* Datepicker styles injected for self-contained styling */}
      <style>
        {`
      .react-datepicker-wrapper {
        width: 100%;
      }

      .react-datepicker__input-container input {
        width: 100%;
        padding: 10px 12px;
        border-radius: 6px;
        border: 1px solid #ced4da;
        font-size: 14px;
      }

      .react-datepicker {
        border-radius: 10px;
        border: 1px solid #d0d7de;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        font-size: 13px;
      }

      .react-datepicker__header {
        background-color: #f8f9fa;
        border-bottom: 1px solid #e5e7eb;
        width: 100%;
        box-sizing: border-box;
      }

      .react-datepicker__current-month,
      .react-datepicker__day-name {
        font-weight: 600;
        color: #212529;
      }

      .react-datepicker__day {
        width: 2.2rem;
        line-height: 2.2rem;
        margin: 0.15rem;
      }

      .react-datepicker__day--selected,
      .react-datepicker__day--keyboard-selected {
        background-color: #198754;
        color: #fff;
      }

      .react-datepicker__day--disabled {
        color: #adb5bd;
      }

      .react-datepicker__day:hover {
        background-color: #e9ecef;
      }

      .${styles.darkMode} .react-datepicker {
        background-color: #1e1e1e;
        border-color: #333;
      }

      .${styles.darkMode} .react-datepicker__header {
        background-color: #2a2a2a;
        border-bottom-color: #333;
      }

      .${styles.darkMode} .react-datepicker__day,
      .${styles.darkMode} .react-datepicker__day-name,
      .${styles.darkMode} .react-datepicker__current-month {
        color: #eaeaea;
      }

      .${styles.darkMode} .react-datepicker__day--selected {
        background-color: #2ecc71;
        color: #000;
      }

      .${styles.darkMode} .react-datepicker__day:hover {
        background-color: #333;
      }
      .react-datepicker__month-container {
        width: 100%;
        box-sizing: border-box;
      }

      .react-datepicker-popper {
        max-width: 100vw;
        overflow: hidden;
      }
    `}
      </style>
    </div>
  );
}
