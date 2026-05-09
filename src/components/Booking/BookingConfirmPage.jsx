import { useMemo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { Container, Button, Card, CardBody } from 'reactstrap';
import logo from '../../assets/images/logo2.png';
import styles from './booking.module.css';

const STORAGE_KEY = 'bookingDraft_v1';

export default function BookingConfirmPage() {
  const { state } = useLocation();
  const history = useHistory();
  const booking = useMemo(() => {
    if (state?.booking) return state.booking;

    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      return null;
    }
  }, [state]);

  const guestName = booking?.guest?.name || booking?.name || '';
  const guestEmail = booking?.guest?.email || booking?.email || '';
  const guestPhone = booking?.guest?.phone || booking?.phone || '';
  const total = typeof booking?.price?.total === 'number' ? booking.price.total : null;

  if (!booking) {
    return (
      <Container className="py-5 text-center">
        <h4>No booking found.</h4>
        <Button color="primary" onClick={() => history.push('/booking')}>
          Back to booking
        </Button>
      </Container>
    );
  }

  return (
    <div className={styles.bookingBg}>
      <div className={styles.topLogo}>
        <img src={logo} alt="One Community" />
      </div>

      <Container className="py-4">
        <Card>
          <CardBody>
            <h3 className="mb-3">Booking Confirmation</h3>
            <p>
              <strong>Listing:</strong> Unit 405, Earthbag Village
            </p>
            <p>
              <strong>Dates:</strong> {booking.start} → {booking.end}
            </p>
            <p>
              <strong>Guest:</strong> {guestName} ({guestEmail}, {guestPhone})
            </p>
            <hr />
            <p>
              <strong>Total:</strong> {total === null ? 'Unavailable' : `$${total.toFixed(2)}`}
            </p>
            <p className="text-muted">
              You’ll receive an email shortly. Some bookings may require host approval.
            </p>
            <Button color="success" onClick={() => history.push('/dashboard')}>
              Done
            </Button>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
}
