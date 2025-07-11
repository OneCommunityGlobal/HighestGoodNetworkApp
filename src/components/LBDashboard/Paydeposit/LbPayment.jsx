import React, { useState, useRef } from 'react';
import logo from '../../../assets/images/logo2.png';
import sampleUnit from '../../../assets/images/sample.jpg';
import './payment.css';
import ImageModal from './UnitModal';
import BiddingInfoModal from './BiddingInfoModal';
import PaypalCardFields from './Paypal';  // Import the PaypalCardFields component

function PaymentPage() {
  const [modal, setModal] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  // Use simple date string values for the HTML date inputs
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // Payment due value (can be updated from backend later)
  const [paymentDue, setPaymentDue] = useState(70);

  // Reference for the PaypalCardFields to trigger its submission
  const paypalRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }
    try {
      const payload = await paypalRef.current.submit();
      console.log('Payment authorized!', payload);
      setInfoModal(true);
    } catch (err) {
      console.error('Error submitting payment:', err);
    }
  };

  return (
    <div className="payment-main-container">
      <ImageModal
        isOpen={modal}
        onClose={() => setModal(false)}
        images={[sampleUnit]}
      />
      <BiddingInfoModal
        isOpen={infoModal}
        onClose={() => setInfoModal(false)}
      />

      <div className="payment-logo-container">
        <img src={logo} alt="One Community Logo" />
      </div>

      <div className="payment-card-container">
        <div className="payment-card-header"></div>
        <div className="payment-card-content">
          <div className="payment-form-container">
            <h2>Bid and Pay</h2>
            <div className="payment-image-section">
              {/* Increase image size by roughly 10% */}
              <img 
                src={sampleUnit} 
                alt="Bidding Unit" 
                style={{ width: '33vw', height: '28vh' }} 
              />
              <p className="payment-image-description">
                Unit 405, Earthbag Village -{' '}
                <a
                  style={{ textDecoration: 'underline', cursor: 'pointer' }}
                  href="#"
                  onClick={() => setModal(true)}
                >
                  Click for more photos
                </a>
              </p>
            </div>

            <div className="payment-booking-details">
              <form id="paymentForm" onSubmit={handleSubmit}>
                {/* Booking Details Heading */}
                <h3 style={{ marginBottom: '10px' }}>Booking Details</h3>
                {/* Flex row for date inputs and payment due */}
                <div 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '80%', marginBottom: '20px' }}
                >
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label htmlFor="from">From:</label>
                      <input
                        type="date"
                        id="from"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label htmlFor="to">To:</label>
                      <input
                        type="date"
                        id="to"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="payment-due-container">
                    <p style={{ margin: 0 }}>{`Payment Due - $${paymentDue}`}</p>
                  </div>
                </div>

                <div className="payment-row-layout">
                  <div className="payment-form-row">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="payment-form-row">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="payment-form-row">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Integrate the Paypal card fields component */}
                <PaypalCardFields ref={paypalRef} />

                <div className="payment-action-column">
                  {/* Use the existing button */}
                  <button type="submit" className="payment-proceed-button">
                    Proceed to book with details
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;