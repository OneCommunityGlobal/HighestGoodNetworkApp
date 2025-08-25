import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Row, Col, Button, Input, Label, Alert, Spinner } from 'reactstrap';
import { FaComment, FaBell, FaUser } from 'react-icons/fa';
import logo from '../../assets/images/logo2.png';
import './booking.css';

const STORAGE_KEY = 'bookingDraft_v1';
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

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      const isBooked = localStorage.getItem('bookingComplete');
      if (saved && isBooked !== 'true') {
        setStart(saved.start || '');
        setEnd(saved.end || '');
        setName(saved.name || '');
        setEmail(saved.email || '');
        setPhone(saved.phone || '');
        setCard(saved.card || '');
        setCvv(saved.cvv || '');
        setExp(saved.exp || '');
      }
    } catch {}
  }, []);

  useEffect(() => {
    const payload = { start, end, name, email, phone, card, cvv, exp };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [start, end, name, email, phone, card, cvv, exp]);

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
    if (!start || !end) return toast.error('Please choose dates.');
    if (dateDisabled(start) || dateDisabled(end))
      return toast.error('Selected date is unavailable.');
    if (!name.trim() || !email.trim() || !phone.trim())
      return toast.error('Fill Name, Email and Phone.');
    if (!price || price.error) return toast.error(price?.error || 'Invalid date range.');

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Booking captured.');
      localStorage.setItem('bookingComplete', 'true');
      history.push('/booking/confirm', {
        booking: { start, end, guest: { name, email, phone }, price },
      });
    }, 700);
  };

  return (
    <div className={`booking-bg ${darkMode ? 'dark-mode' : ''}`}>
      <div className="top-logo">
        <img src={logo} alt="One Community" />
      </div>

      <div className="green-bar">
        <div className="bar-inner">
          <div className="village-select">
            <select value={village} onChange={e => setVillage(e.target.value)}>
              <option>Choose your Village</option>
              <option>Earthbag Village</option>
              <option>Straw Bale Village</option>
              <option>Recycle Materials Village</option>
              <option>Cob Village</option>
              <option>Tree House Village</option>
            </select>
            <Button className="go-btn">Go</Button>
          </div>

          <div className="bar-right">
            <span className="welcome">WELCOME, {userName}</span>
            <div className="icons">
              <span className="icon">
                <FaComment />
                <span className="badge">1</span>
              </span>
              <span className="icon">
                <FaBell />
                <span className="badge">1</span>
              </span>
              <span className="icon">
                <FaUser />
              </span>
            </div>
          </div>
        </div>
      </div>

      <Container className="booking-shell">
        <Row>
          <Col>
            <div className="booking-content">
              <Row>
                <Col md={12} className="text-center mb-3">
                  <div>
                    <img
                      className="listing-photo"
                      src="https://images.unsplash.com/photo-1570793005386-840846445fed?w=900&auto=format&fit=crop"
                      alt="Unit 405"
                    />
                    <div className="photo-caption">
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
                  <h5 className="section-title">Booking Details</h5>
                  <div className="dates-subtitle">
                    Dates: {start && end ? `${start} - ${end}` : 'Select dates'}
                  </div>
                  <Row className="g-3 mt-2">
                    <Col md={6}>
                      <Label className="field-label">Name</Label>
                      <Input value={name} onChange={e => setName(e.target.value)} />
                    </Col>
                    <Col md={6}>
                      <Label className="field-label">Email</Label>
                      <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </Col>
                    <Col md={12}>
                      <Label className="field-label">Card #</Label>
                      <Input value={card} onChange={e => setCard(e.target.value)} />
                    </Col>
                    <Col md={6}>
                      <Label className="field-label">CVV</Label>
                      <Input value={cvv} onChange={e => setCvv(e.target.value)} />
                    </Col>
                    <Col md={6}>
                      <Label className="field-label">Exp</Label>
                      <Input value={exp} onChange={e => setExp(e.target.value)} />
                    </Col>
                    <Col md={6}>
                      <Label className="field-label">Check-in</Label>
                      <Input
                        type="date"
                        value={start}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setStart(e.target.value)}
                      />
                    </Col>
                    <Col md={6}>
                      <Label className="field-label">Check-out</Label>
                      <Input
                        type="date"
                        value={end}
                        min={start || new Date().toISOString().split('T')[0]}
                        onChange={e => setEnd(e.target.value)}
                      />
                    </Col>
                  </Row>
                </Col>

                <Col md={5}>
                  <Label className="field-label">Phone</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} />
                  <div className="price-box mt-4">
                    {price?.error && <Alert color="danger">{price.error}</Alert>}
                    {!price && <Alert color="info">Select dates to see pricing</Alert>}
                    {price && !price.error && (
                      <>
                        <div className="price-row">
                          <span>
                            {price.nights} × ${NIGHTLY_RATE}
                          </span>
                          <span>${price.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="price-row">
                          <span>Taxes</span>
                          <span>${price.taxes.toFixed(2)}</span>
                        </div>
                        <div className="price-row">
                          <span>Fees</span>
                          <span>${price.fees.toFixed(2)}</span>
                        </div>
                        <div className="price-row total">
                          <span>Total</span>
                          <span>${price.total.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-4 text-end">
                    <Button
                      color="success"
                      className="proceed-btn"
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
    </div>
  );
}
