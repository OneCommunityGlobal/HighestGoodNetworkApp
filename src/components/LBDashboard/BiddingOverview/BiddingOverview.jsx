import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './BiddingOverview.module.css';

import logo from '../../../assets/images/logo2.png';

function BiddingOverview() {
  const [rentingFrom, setRentingFrom] = useState('');
  const [rentingTo, setRentingTo] = useState('');
  const [name, setName] = useState('');
  const [biddingPrice, setBiddingPrice] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const unitDetails = {
    unitNumber: '405',
    villageName: 'Earthbag Village',
    description:
      "If you wish to book it in advance bid your price and leave your details below and we'll get back to you if you are our highest bidder. Make sure your starting date is at least 2 weeks from now.",
    currentBid: '40$',
    unitAmenities: [
      { id: 'ua1', text: 'Artistic Interiors' },
      { id: 'ua2', text: 'Artistic Interiors' },
      { id: 'ua3', text: 'Artistic Interiors' },
    ],

    villageAmenities: [
      'Central Tropical',
      'Eco-Conscious Water System',
      'Solar Power Infrastructure',
      'Passive Heating and Cooling',
      'Community Gardens',
      'Rainwater Harvesting Systems',
      'Workshops and Demonstration Spaces',
    ],
    images: [
      'https://www.chromethemer.com/backgrounds/google/images/beautiful-morning-4k-google-background.jpg',
      'https://wallpaper.forfun.com/fetch/1d/1d033e2b725d21df94f9f6f8c289a2ba.jpeg',
    ],
  };

  const navigateImages = direction => {
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
    // Allow only empty string or digits
    if (value === '' || /^\d+$/.test(value)) {
      setBiddingPrice(value);
    }
  };

  useEffect(() => {
    const fetchUnitDetails = async () => {
      try {
        // Placeholder for API call
      } catch (error) {
        // Handle error fetching unit details if needed (e.g., send to a logging service)
      }
    };

    fetchUnitDetails();
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    // Handle form submission logic here
    // Example: Send data to backend API
  };

  return (
    <div className={`${styles.biddingPage}`}>
      <div className={`${styles.topLogoContainer}`}>
        <img src={logo} alt="One Community Logo" className={`${styles.topLogo}`} />
      </div>
      <div className={`${styles.boxContainer}`}>
        <header className={`${styles.biddingHeader}`}>
          <div className={`${styles.headerLeft}`}>
            <div className="village-selector">
              <select
                id="village"
                className={`${styles.villageSelect}`}
                aria-label="Choose your Village"
              >
                <option value="">Choose your Village</option>
                <option value="earthbag">Earthbag Village</option>
                <option value="strawbale">Straw Bale Village</option>
                <option value="cob">Cob Village</option>
              </select>
            </div>
            <button type="button" className={`${styles.goButton}`}>
              Go
            </button>
          </div>

          <div className={`${styles.headerRight}`}>
            <span className={`${styles.welcomeText}`}>WELCOME USER_NAME</span>
            {/* Replace USER_NAME */}
            <div className={`${styles.iconContainer}`}>
              <div className={`${styles.iconBadge}`}>
                <i className={`fa fa-comment ${styles.messageIcon}`} />
                <span className={`${styles.badge}`} />
              </div>
              <div className={`${styles.iconBadge}`}>
                <i className={`fa fa-bell ${styles.notificationIcon}`} />
                <span className={`${styles.badge}`} />
              </div>
              <i className={`fa fa-user ${styles.userIcon}`} />
            </div>
          </div>
        </header>

        <main className={`${styles.biddingContainer}`}>
          <div className={`${styles.biddingCard}`}>
            <div className={`${styles.biddingLeft}`}>
              <div className={`${styles.currentBid}`}>
                Current bid: {unitDetails.currentBid} /night
              </div>
              <div className={`${styles.biddingImage}`}>
                <img
                  src={unitDetails.images[currentImageIndex]}
                  alt={`Unit ${unitDetails.unitNumber} ${unitDetails.villageName}`}
                />
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
                <div className={`${styles.imageDots}`}>
                  {unitDetails.images.map((image, index) => (
                    <span
                      key={image} // Using unique image URL as key is correct here
                      className={`image-dot ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                      onKeyDown={e => {
                        // Added for accessibility
                        if (e.key === 'Enter' || e.key === ' ') {
                          setCurrentImageIndex(index);
                        }
                      }}
                      role="button" // Added for accessibility
                      tabIndex={0} // Added for accessibility
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className={`${styles.amenitiesContainer}`}>
                <div className={`${styles.amenitiesSection}`}>
                  <h4>Available amenities in this Unit:</h4>
                  <ol>
                    {/* FIXED: Use the unique 'id' property as the key */}
                    {unitDetails.unitAmenities.map(amenity => (
                      <li key={amenity.id}>{amenity.text}</li>
                    ))}
                  </ol>
                </div>

                <div className={`${styles.amenitiesSection}`}>
                  <h4>Village level amenities:</h4>
                  <ol>
                    {unitDetails.villageAmenities.map(amenity => (
                      // Using unique amenity string as key is correct here
                      <li key={amenity}>{amenity}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className={`${styles.mapLinkContainer}`}>
                <Link to="/property-map" className={`${styles.mapLink}`}>
                  <i className={`fa fa-map-marker ${styles.locationIcon}`} />
                  View on Property Map
                </Link>
              </div>
            </div>

            <div className={`${styles.biddingRight}`}>
              <div className={`${styles.unitHeader}`}>
                <h2 className={`${styles.unitTitle}`}>Unit {unitDetails.unitNumber}</h2>
                <h3 className={`${styles.unitSubtitle}`}>{unitDetails.villageName}</h3>
              </div>

              <p className={`${styles.unitDescription}`}>{unitDetails.description}</p>

              <form className={`${styles.biddingForm}`} onSubmit={handleSubmit}>
                <div className={`${styles.formRowContainer}`}>
                  <div className={`${styles.formGroup} ${styles.biddingFormGroup}`}>
                    <label htmlFor="rentingFrom">Renting from:</label>
                    <div className={`${styles.inputWithIcon}`}>
                      <input
                        type="date"
                        id="rentingFrom"
                        value={rentingFrom}
                        onChange={e => setRentingFrom(e.target.value)}
                        required // Added basic validation
                      />
                    </div>
                  </div>

                  <div className={`${styles.formGroup} ${styles.biddingFormGroup}`}>
                    <label htmlFor="rentingTo">Renting to:</label>
                    <div className={`${styles.inputWithIcon}`}>
                      <input
                        type="date"
                        id="rentingTo"
                        value={rentingTo}
                        onChange={e => setRentingTo(e.target.value)}
                        required // Added basic validation
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
                    required // Added basic validation
                  />
                </div>

                <div
                  className={`${styles.formGroup} ${styles.fullWidth} ${styles.biddingFormGroup}`}
                >
                  <label htmlFor="biddingPrice">Bidding Price ($/night)</label>
                  <input
                    type="text" // Keep as text to allow custom validation logic
                    id="biddingPrice"
                    placeholder="Enter your bid amount"
                    value={biddingPrice}
                    onChange={handleBiddingPriceChange}
                    pattern="\d+"
                    title="Please enter numbers only."
                    required // Added basic validation
                  />
                </div>

                <div className="submit-button-container">
                  <button type="submit" className={`${styles.submitButton1}`}>
                    Proceed to submit with details{' '}
                  </button>
                </div>
              </form>

              <div className={`${styles.biddingActions}`}>
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
  );
}

export default BiddingOverview;
