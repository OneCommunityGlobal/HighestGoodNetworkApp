import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './BiddingOverview.module.css';
import { useSelector, useDispatch } from 'react-redux';
import logo from '../../../assets/images/logo2.png';
import { getPropertyBidOverview, placeBid } from '~/actions/lbdashboard/bidOverviewAction';

function BiddingOverview() {
  const [rentingFrom, setRentingFrom] = useState('');
  const [rentingTo, setRentingTo] = useState('');
  const [name, setName] = useState('');
  const [biddingPrice, setBiddingPrice] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [property, setProperty] = useState(null);
  const [currentBid, setCurrentBid] = useState(0);

  const darkMode = useSelector(state => state.theme.darkMode);
  const auth = useSelector(state => state.auth);
  const userId = auth?.user?._id;
  const userName = auth?.firstName || auth?.user?.firstName || auth?.user?.username || 'User';

  const { listingId } = useParams();
  const dispatch = useDispatch();

  // Fetch property details
  useEffect(() => {
    const fetchUnitDetails = async () => {
      try {
        const res = await dispatch(getPropertyBidOverview(listingId));
        setProperty(res.property);
        setCurrentBid(res.currentBid);
      } catch (error) {
        console.error('Error fetching property details:', error);
      }
    };
    if (listingId) fetchUnitDetails();
  }, [listingId, dispatch]);

  // Navigate images
  const navigateImages = direction => {
    if (!property?.images?.length) return;
    if (direction === 'next') {
      setCurrentImageIndex(prevIndex =>
        prevIndex === property.images.length - 1 ? 0 : prevIndex + 1,
      );
    } else {
      setCurrentImageIndex(prevIndex =>
        prevIndex === 0 ? property.images.length - 1 : prevIndex - 1,
      );
    }
  };

  // Only allow numeric bidding
  const handleBiddingPriceChange = ({ target: { value } }) => {
    if (value === '' || /^\d+$/.test(value)) {
      setBiddingPrice(value);
    }
  };

  // Submit bid
  const handleSubmit = async e => {
    e.preventDefault();
    if (!listingId || !userId) return;

    try {
      const payload = {
        userId,
        name,
        startDate: rentingFrom,
        endDate: rentingTo,
        bidAmount: Number(biddingPrice),
      };

      const res = await dispatch(placeBid(listingId, payload));
      setCurrentBid(res.bid?.bid_amount || currentBid);
      alert('Bid placed successfully!');
    } catch (err) {
      console.error('Error placing bid:', err);
      alert('Failed to place bid');
    }
  };

  // Zoom controls
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 1));
  const resetZoom = () => setZoom(1);
  const handleWheel = e => {
    e.preventDefault();
    if (e.deltaY > 0) zoomIn();
    else zoomOut();
  };

  if (!property) {
    return <div className={styles.loading}>Loading property details...</div>;
  }

  return (
    <div className={`${styles.biddingPage} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.topLogoContainer}>
        <img src={logo} alt="One Community Logo" className={styles.topLogo} />
      </div>
      <div className={styles.boxContainer}>
        <header className={styles.biddingHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.unitVillage}>{property?.village || 'Village'}</span>
          </div>

          <div className={styles.headerRight}>
            <span className={styles.welcomeText}>WELCOME {userName}</span>
            <div className={styles.iconContainer}>
              <i className={`fa fa-bell ${styles.notificationIcon}`} />
              <i className={`fa fa-user ${styles.userIcon}`} />
            </div>
          </div>
        </header>

        <main className={styles.biddingContainer}>
          <div className={styles.biddingCard}>
            <div className={styles.biddingLeft}>
              <div className={styles.currentBid}>Current bid: {currentBid} /night</div>

              {/* Images */}
              <div className={styles.biddingImage}>
                <div className={styles.zoomWrapper} onWheel={handleWheel}>
                  <img
                    src={property.images[currentImageIndex]}
                    alt={`Unit ${property.title}`}
                    className={styles.zoomImage}
                    style={{ transform: `scale(${zoom})` }}
                  />
                </div>
                <button
                  type="button"
                  className={`${styles.imageNavButton} ${styles.leftNav}`}
                  onClick={() => navigateImages('prev')}
                >
                  <i className="fa fa-chevron-left" />
                </button>
                <button
                  type="button"
                  className={`${styles.imageNavButton} ${styles.rightNav}`}
                  onClick={() => navigateImages('next')}
                >
                  <i className="fa fa-chevron-right" />
                </button>
              </div>

              {/* Amenities */}
              <div className={styles.amenitiesContainer}>
                <div className={styles.amenitiesSection}>
                  <h4>Available amenities in this Unit:</h4>
                  <ol>
                    {property.amenities?.map((amenity, index) => (
                      <li key={index}>{amenity}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className={styles.biddingRight}>
              <div className={styles.unitHeader}>
                <h2 className={styles.unitTitle}>{property.title}</h2>
                <h3 className={styles.unitSubtitle}>{property.village}</h3>
              </div>

              <p className={styles.unitDescription}>{property.description}</p>

              {/* Form */}
              <form className={styles.biddingForm} onSubmit={handleSubmit}>
                <div className={styles.formRowContainer}>
                  <div className={`${styles.formGroup} ${styles.biddingFormGroup}`}>
                    <label htmlFor="rentingFrom">Renting from:</label>
                    <input
                      type="date"
                      id="rentingFrom"
                      value={rentingFrom}
                      onChange={e => setRentingFrom(e.target.value)}
                      required
                    />
                  </div>
                  <div className={`${styles.formGroup} ${styles.biddingFormGroup}`}>
                    <label htmlFor="rentingTo">Renting to:</label>
                    <input
                      type="date"
                      id="rentingTo"
                      value={rentingTo}
                      onChange={e => setRentingTo(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
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

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="biddingPrice">Bidding Price ($/night)</label>
                  <input
                    type="text"
                    id="biddingPrice"
                    placeholder="Enter your bid amount"
                    value={biddingPrice}
                    onChange={handleBiddingPriceChange}
                    required
                  />
                </div>

                <button type="submit" className={styles.submitButton1}>
                  Submit Bid
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default BiddingOverview;
