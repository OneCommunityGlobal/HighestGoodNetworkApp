import React, { useState, useRef } from 'react';
import logo from '../../../assets/images/logo2.png';
import styles from './payment.module.css';
import ImageModal from './UnitModal';
import BiddingInfoModal from './BiddingInfoModal';

function PaymentPage() {
  const mockUnitData = {
    unitName: 'Unit 405, Earthbag Village',
    images: [
      'https://i.ytimg.com/vi/9vYywX-54y0/maxresdefault.jpg',
      'https://onecommunityglobal.org/wp-content/uploads/2018/02/City-Center-Main-Render_v042018_640x360.jpg',
      'https://i.ytimg.com/vi/8Y_uQlKie2k/maxresdefault.jpg',
    ],
  };
  const [modal, setModal] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const [paymentDue, setPaymentDue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
  });

  const { startDate, endDate } = formData;

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const paypalRef = useRef();

  const handleSubmit = async e => {
    e.preventDefault();
    // You can add your form submission logic here
    try {
      const order = await paypalRef.current.createOrder();
      // Handle successful order creation (e.g., capture payment)
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className={styles.paymentMainContainer}>
      <ImageModal isOpen={modal} onClose={() => setModal(false)} images={mockUnitData.images} />
      <BiddingInfoModal isOpen={infoModal} onClose={() => setInfoModal(false)} />

      <div className={styles.paymentLogoContainer}>
        <img src={logo} alt="One Community Logo" />
      </div>

      <div className={styles.paymentCardContainer}>
        <div className={styles.paymentCardHeader}></div>
        <div className={styles.paymentCardContent}>
          <div className={styles.paymentFormContainer}>
            <h2>Bid and Pay</h2>
            <div className={styles.paymentImageSection}>
              {/* Increase image size by roughly 10% */}
              <img src={mockUnitData.images[0]} alt="Bidding Unit" />
              <p className={styles.paymentImageDescription}>
                {mockUnitData.unitName} -{' '}
                <button
                  style={{
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'blue',
                  }}
                  onClick={() => setModal(true)}
                >
                  Click for more photos
                </button>
              </p>
            </div>

            <div className={styles.paymentBookingDetails}>
              <form id="paymentForm" onSubmit={handleSubmit}>
                {/* Booking Details Heading */}
                <h3 style={{ marginBottom: '10px', color: '#000' }}>Booking Details</h3>
                {/* Flex row for date inputs and payment due */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '80%',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label htmlFor="from">From:</label>
                      <input
                        type="date"
                        id="from"
                        name="startDate"
                        value={startDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label htmlFor="to">To:</label>
                      <input
                        type="date"
                        id="to"
                        name="endDate"
                        value={endDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className={styles.paymentDueContainer}>
                    <p style={{ margin: 0 }}>{`Payment Due - ${paymentDue}`}</p>
                  </div>
                </div>

                <div className={styles.paymentRowLayout}>
                  <div className={styles.paymentFormRow}>
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
                  <div className={styles.paymentFormRow}>
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
                  <div className={styles.paymentFormRow}>
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
                <div>
                  <div className={styles.paymentFormRow}>
                    <input
                      name="cardNumber"
                      type="tel"
                      placeholder="Card Number"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.paymentFormRow}>
                    <input
                      name="expiryDate"
                      type="text"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      pattern="^(0[1-9]|1[0-2])\/([0-9]{2})$"
                      maxLength="5"
                      required
                    />
                  </div>
                  <div className={styles.paymentFormRow}>
                    <input
                      name="cvv"
                      type="tel"
                      placeholder="CVV"
                      value={formData.cvv}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className={styles.paymentActionColumn}>
                  {/* Use the existing button */}
                  <button type="submit" className={styles.paymentProceedButton}>
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
