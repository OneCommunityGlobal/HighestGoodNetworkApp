import { useLocation, useHistory } from 'react-router-dom';
import { Container, Button, Card, CardBody } from 'reactstrap';
import logo from '../../assets/images/logo2.png';
import './booking.css';

export default function BookingConfirmPage() {
  const { state } = useLocation();
  const history = useHistory();
  const booking = state?.booking;

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
    <div className="booking-bg">
      <div className="top-logo">
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
              <strong>Guest:</strong> {booking.guest.name} ({booking.guest.email},{' '}
              {booking.guest.phone})
            </p>
            <hr />
            <p>
              <strong>Total:</strong> ${booking.price.total.toFixed(2)}
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
