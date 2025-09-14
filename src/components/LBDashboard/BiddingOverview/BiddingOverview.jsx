import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './BiddingOverview.module.css';
import logo from '../../../assets/images/logo2.png';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUnitDetails, submitBid } from '../../../actions/lbdashboard/bidOverviewActions';
import LBDashboardHeader from '../Header';
import Header from '../../Header/Header';

function BiddingOverview() {
  const { listingId } = useParams();
  const dispatch = useDispatch();

  const userId = useSelector(state => state.auth.user.userid);
  const firstName = useSelector(state => state.auth.firstName);
  const unitDetails = useSelector(state => state.bidOverview.unitDetails);
  const notifications = useSelector(state => state.bidOverview.notifications);
  const loading = useSelector(state => state.bidOverview.loading);
  const error = useSelector(state => state.bidOverview.error);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [rentingFrom, setRentingFrom] = useState('');
  const [rentingTo, setRentingTo] = useState('');
  const [name, setName] = useState('');
  const [biddingPrice, setBiddingPrice] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageScale, setImageScale] = useState(1);
  useEffect(() => {
    if (listingId) {
      dispatch(fetchUnitDetails(listingId));
    }
  }, [dispatch, listingId]);

  const navigateImages = direction => {
    if (!unitDetails.images || unitDetails.images.length === 0) return;
    if (direction === 'next') {
      setCurrentImageIndex(prevIndex =>
        prevIndex === unitDetails.images.length - 1 ? 0 : prevIndex + 1,
      );
    } else {
      setCurrentImageIndex(prevIndex =>
        prevIndex === 0 ? unitDetails.images.length - 1 : prevIndex - 1,
      );
    }
  };

  const handleBiddingPriceChange = ({ target: { value } }) => {
    if (value === '' || /^\d+$/.test(value)) {
      setBiddingPrice(value);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!rentingFrom || !rentingTo || !name || !biddingPrice) {
      alert('Please fill in all fields.');
      return;
    }
    const bidData = {
      user_id: userId,
      property_id: listingId,
      bid_amount: parseInt(biddingPrice, 10),
      start_date: rentingFrom,
      end_date: rentingTo,
    };
    dispatch(submitBid(listingId, bidData));
    alert('Bid submitted successfully!');
    setRentingFrom('');
    setRentingTo('');
    setName(firstName || '');
    setBiddingPrice('');
  };

  const flatNotifications = Array.isArray(notifications) ? notifications.flat() : [];

  if (loading || !unitDetails) {
    return <div className={styles.loading}>Loading...</div>;
  }
  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={`${styles.biddingPage}`}>
      <Header />
      <div className={`${styles.biddingPage} ${darkMode ? styles.darkMode : ''}`}>
        <div className={`${styles.topLogoContainer}`}>
          <img src={logo} alt="One Community Logo" className={`${styles.topLogo}`} />
        </div>

        <div className={styles.boxContainer}>
          <LBDashboardHeader notifications={flatNotifications} />
          <main className={styles.biddingContainer}>
            <div className={styles.biddingCard}>
              <div className={styles.biddingLeft}>
                <div className={styles.currentBid}>Current bid: {unitDetails.bidAmount} /night</div>
                <div className={styles.biddingImage}>
                  <img
                    src={unitDetails.images[currentImageIndex]}
                    alt={`Unit ${unitDetails.unitNumber} ${unitDetails.villageName}`}
                    style={{ transform: `scale(${imageScale})`, transition: 'transform 0.2s' }}
                  />
                  <div className={styles.imageZoomControls}>
                    <button
                      type="button"
                      onClick={() => setImageScale(prev => Math.min(prev + 0.2, 3))}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageScale(prev => Math.max(prev - 0.2, 0.5))}
                    >
                      -
                    </button>
                    <button type="button" onClick={() => setImageScale(1)}>
                      Reset
                    </button>
                  </div>
                  <button
                    type="button"
                    className={`${styles.imageNavButton} ${styles.leftNav}`}
                    onClick={() => navigateImages('prev')}
                    aria-label="Previous image"
                  >
                    <i className="fa fa-chevron-left" />
                  </button>
                  <button
                    type="button"
                    className={`${styles.imageNavButton} ${styles.rightNav}`}
                    onClick={() => navigateImages('next')}
                    aria-label="Next image"
                  >
                    <i className="fa fa-chevron-right" />
                  </button>
                  <div className={styles.imageDots}>
                    {unitDetails.images.map((image, index) => (
                      <span
                        key={image}
                        className={`image-dot ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setCurrentImageIndex(index);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.amenitiesContainer}>
                  <div className={styles.amenitiesSection}>
                    <h4>Available amenities in this Unit:</h4>
                    <ol>
                      {unitDetails.unitAmenities.map(amenity => (
                        <li key={amenity}>{amenity}</li>
                      ))}
                    </ol>
                  </div>
                  <div className={styles.amenitiesSection}>
                    <h4>Village level amenities:</h4>
                    <ol>
                      {unitDetails.villageAmenities.map(amenity => (
                        <li key={amenity}>{amenity}</li>
                      ))}
                    </ol>
                  </div>
                </div>
                <div className={styles.mapLinkContainer}>
                  <Link to="/property-map" className={styles.mapLink}>
                    <i className={`fa fa-map-marker ${styles.locationIcon}`} />
                    View on Property Map
                  </Link>
                </div>
              </div>
              <div className={styles.biddingRight}>
                <div className={styles.unitHeader}>
                  <h2 className={styles.unitTitle}>{unitDetails.title}</h2>
                  {/* <h3 className={styles.unitSubtitle}>{unitDetails.villageName}</h3> */}
                </div>
                <p className={styles.unitDescription}>{unitDetails.description}</p>
                <form className={styles.biddingForm} onSubmit={handleSubmit}>
                  <div className={styles.formRowContainer}>
                    <div className={`${styles.formGroup} ${styles.biddingFormGroup}`}>
                      <label htmlFor="rentingFrom">Renting from:</label>
                      <div className={styles.inputWithIcon}>
                        <input
                          type="date"
                          id="rentingFrom"
                          value={rentingFrom}
                          onChange={e => setRentingFrom(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className={`${styles.formGroup} ${styles.biddingFormGroup}`}>
                      <label htmlFor="rentingTo">Renting to:</label>
                      <div className={styles.inputWithIcon}>
                        <input
                          type="date"
                          id="rentingTo"
                          value={rentingTo}
                          onChange={e => setRentingTo(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className={`${styles.formGroup} ${styles.fullWidth} ${styles.biddingFormGroup}`}
                  >
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Your Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div
                    className={`${styles.formGroup} ${styles.fullWidth} ${styles.biddingFormGroup}`}
                  >
                    <label htmlFor="biddingPrice">Bidding Price ($/night)</label>
                    <input
                      type="text"
                      id="biddingPrice"
                      placeholder="Enter your bid amount"
                      value={biddingPrice}
                      onChange={handleBiddingPriceChange}
                      pattern="\d+"
                      title="Please enter numbers only."
                      required
                    />
                  </div>
                  <div className="submit-button-container">
                    <button type="submit" className={styles.submitButton1}>
                      Proceed to submit with details
                    </button>
                  </div>
                </form>
                <div className={styles.biddingActions}>
                  <button type="button" className={`${styles.actionButton} reviews-button`}>
                    <i className="fa fa-star" /> Reviews
                  </button>
                  <button type="button" className={`${styles.actionButton} ${styles.saveButton}`}>
                    <i className="fa fa-heart" /> Save
                  </button>
                  <button type="button" className={`${styles.actionButton} ${styles.chatButton}`}>
                    <i className="fa fa-comment" /> CHAT WITH HOST
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default BiddingOverview;
